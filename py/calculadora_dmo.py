import re
import sys
import tkinter as tk
from tkinter import ttk, messagebox
import requests
from bs4 import BeautifulSoup
import threading
import queue
import json
import os
import time
from datetime import datetime, timedelta

try:
    from curl_cffi import requests as curl_requests
    _curl_available = True
except Exception:
    _curl_available = False

try:
    import cloudscraper
    _scraper = cloudscraper.create_scraper(
        browser={
            'browser': 'chrome',
            'platform': 'windows',
            'desktop': True
        }
    )
except Exception:
    _scraper = None

CLONE_DATA = [
    (0,  "0%",   "0%",   "0%",   "0%",   "0%"),
    (1,  "3%",   "15%",  "2%",   "12%",  "2%"),
    (2,  "6%",   "30%",  "4%",   "24%",  "4%"),
    (3,  "9%",   "45%",  "6%",   "36%",  "6%"),
    (4,  "14%",  "70%",  "9%",   "56%",  "9%"),
    (5,  "19%",  "95%",  "12%",  "76%",  "12%"),
    (6,  "24%",  "120%", "15%",  "96%",  "15%"),
    (7,  "34%",  "170%", "21%",  "136%", "19%"),
    (8,  "44%",  "220%", "27%",  "176%", "23%"),
    (9,  "54%",  "270%", "33%",  "216%", "27%"),
    (10, "69%",  "345%", "42%",  "276%", "31%"),
    (11, "84%",  "420%", "51%",  "336%", "35%"),
    (12, "99%",  "495%", "60%",  "396%", "39%"),
    (13, "114%", "570%", "69%",  "456%", "44%"),
    (14, "129%", "645%", "78%",  "516%", "49%"),
    (15, "144%", "720%", "87%",  "576%", "54%"),
]

CLONE_NUM = []
for l, ap, cp, bp, ep, hp in CLONE_DATA:
    CLONE_NUM.append((
        l,
        float(ap.rstrip('%')) / 100,
        float(cp.rstrip('%')) / 100,
        float(bp.rstrip('%')) / 100,
        float(ep.rstrip('%')) / 100,
        float(hp.rstrip('%')) / 100,
    ))

# Single source of truth for evolution multipliers
EVO_DATA = {
    "Rookie": 1.0,
    "Champion": 1.5,
    "Ultimate": 1.85,
    "Armor": 1.85,
    "Spirit": 1.85,
    "Mega": 2.0,
    "Burst Mode": 2.5,
    "Side Mega": 2.5,
    "Variant": 2.5,
    "Jogress": 3.0,
    "Fusion": 3.0,
}

EVO_OPTIONS = [
    ("Rookie", 1.0),
    ("Champion", 1.5),
    ("Ultimate / Armor", 1.85),
    ("Mega", 2.0),
    ("Burst Mode / Side Mega", 2.5),
    ("Jogress / Fusion", 3.0),
]

FLAT_CATEGORIES = [
    "Selos", "Chipset", "D-Unit", "Equipamentos", "Achievements", "Buff Tamer",
]

STAT_LABELS = ["HP", "DS", "AT", "CT (%)", "HT", "DE"]
STAT_KEYS = ["hp", "ds", "at", "ct", "ht", "de"]
WIKI_SIZE = 1.4  # size multiplier used by wiki for "final" column
SNAP_YEARS = ["2026id_", "2025id_", "2024id_", "2023id_"]
WIKI_ROW_MAP = {
    "health points": "hp",
    "digi-soul": "ds",
    "attack": "at",
    "critical hit": "ct",
    "hit rate": "ht",
    "defense": "de",
}
NAME_ALIASES = {
    "alphamon ouryouken x extreme": "Alphamon Ouryuken (Extreme)",
    "alphamon ouryuken x extreme": "Alphamon Ouryuken (Extreme)",
    "alphamon ouryouken extreme": "Alphamon Ouryuken (Extreme)",
    "alphamon ouryuken extreme": "Alphamon Ouryuken (Extreme)",
    "alphamon ouryouken awaken": "Alphamon Ouryuken (Awaken)",
    "alphamon ouryuken awaken": "Alphamon Ouryuken (Awaken)",
}

_form_to_mult_map = {}
for _k, _v in EVO_DATA.items():
    _form_to_mult_map[_k.lower()] = _v


def form_to_mult(form):
    if not form:
        return None
    key = form.strip().lower()
    if key in _form_to_mult_map:
        return _form_to_mult_map[key]
    for part in form.split("/"):
        part = part.strip().lower()
        if part in _form_to_mult_map:
            return _form_to_mult_map[part]
        for word in part.split():
            word = word.strip().lower()
            if word in _form_to_mult_map:
                return _form_to_mult_map[word]
    return None


_cache_lock = threading.Lock()
_cache_dict = None
CACHE_TTL_DAYS = 7


def _get_cache_dir():
    if getattr(sys, 'frozen', False):
        return os.path.join(os.environ.get("APPDATA", os.path.expanduser("~")), "CalculadoraDMO")
    return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


_cache_path = os.path.join(_get_cache_dir(), "digimon_stats_cache.json")
MANUAL_HTML_DIR = os.path.join(_get_cache_dir(), "manual_html")


def _load_cache():
    global _cache_dict
    if _cache_dict is not None:
        return _cache_dict
    try:
        if os.path.exists(_cache_path):
            with open(_cache_path, encoding="utf-8") as f:
                _cache_dict = json.load(f)
                return _cache_dict
    except Exception:
        pass
    return {}


def _save_cache(data):
    global _cache_dict
    name = data.get("_name", "")
    if not name:
        return
    with _cache_lock:
        _cache_dict = _load_cache()
        entry = {k: v for k, v in data.items() if not k.startswith("_")}
        entry["_cached_at"] = datetime.now().isoformat()
        _cache_dict[name] = entry
        try:
            os.makedirs(os.path.dirname(_cache_path), exist_ok=True)
            with open(_cache_path, "w", encoding="utf-8") as f:
                json.dump(_cache_dict, f, indent=2, ensure_ascii=False)
        except Exception:
            pass


def _cache_is_fresh(name):
    cache = _load_cache()
    entry = cache.get(name)
    if not entry:
        return False
    cached_at = entry.get("_cached_at")
    if not cached_at:
        return False
    try:
        dt = datetime.fromisoformat(cached_at)
        return datetime.now() - dt < timedelta(days=CACHE_TTL_DAYS)
    except Exception:
        return False


def _normalize_name_key(name):
    text = re.sub(r"\s+", " ", str(name or "").strip().lower())
    text = text.replace("_", " ")
    text = re.sub(r"[\'\":]", "", text)
    text = text.replace("(", " ").replace(")", " ")
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _candidate_page_names(name):
    clean = name.strip()
    if not clean:
        return []

    candidates = []
    seen = set()

    def add(value):
        if not value:
            return
        value = value.strip()
        key = value.lower()
        if not value or key in seen:
            return
        seen.add(key)
        candidates.append(value)

    add(clean)

    alias = NAME_ALIASES.get(_normalize_name_key(clean))
    if alias:
        add(alias)

    normalized = _normalize_name_key(clean)
    for known in DIGIMON_NAMES:
        if _normalize_name_key(known) == normalized:
            add(known)

    loose_variants = [
        clean.replace("Ouryouken", "Ouryuken"),
        clean.replace("ouryouken", "ouryuken"),
        clean.replace(" X Extreme", " (Extreme)"),
        clean.replace(" x extreme", " (Extreme)"),
        clean.replace(" Extreme", " (Extreme)"),
        clean.replace(" Awaken", " (Awaken)"),
    ]
    for variant in loose_variants:
        if variant != clean:
            add(variant)
            alias = NAME_ALIASES.get(_normalize_name_key(variant))
            if alias:
                add(alias)
            for known in DIGIMON_NAMES:
                if _normalize_name_key(known) == _normalize_name_key(variant):
                    add(known)

    return candidates


def _normalize_stat_text(value, *, percent=False):
    if value is None:
        return None
    text = str(value).replace("\xa0", " ").strip()
    if not text:
        return None
    text = re.sub(r"\s+", "", text)
    if percent:
        if "%" not in text:
            return None
        text = text.replace("%", "")
        if not text:
            return None
        if "," in text and "." in text:
            text = text.replace(",", "")
        elif "," in text:
            text = text.replace(",", ".")
        return f"{text}%"
    if "," in text and "." in text:
        text = text.replace(",", "")
    elif "," in text:
        text = text.replace(",", "")
    return text


def _is_valid_stat_text(key, value):
    if value is None:
        return key == "ht_base"
    pattern = r"\d+(?:\.\d+)?%"
    if key not in {"ct", "ct_base"}:
        pattern = r"\d+(?:\.\d+)?"
    return re.fullmatch(pattern, str(value)) is not None


def _validate_parsed_data(data):
    if not data:
        return None
    result = dict(data)
    if not result.get("form") or not result.get("level_cap"):
        return None
    for key in STAT_KEYS:
        percent = key == "ct"
        normalized = _normalize_stat_text(result.get(key), percent=percent)
        if not _is_valid_stat_text(key, normalized):
            return None
        result[key] = normalized

        base_key = f"{key}_base"
        normalized_base = _normalize_stat_text(result.get(base_key), percent=percent)
        if _is_valid_stat_text(base_key, normalized_base):
            result[base_key] = normalized_base
        else:
            result[base_key] = None
    return result


def _try_dmowiki(clean, candidate):
    """Try direct dmowiki: curl_cffi (primary) then cloudscraper (fallback)."""
    url = f"https://dmowiki.com/{candidate}"

    # 1) curl_cffi with Chrome TLS fingerprint
    if _curl_available:
        try:
            resp = curl_requests.get(url, timeout=20, impersonate="chrome")
            if resp.status_code == 200 and "Just a moment" not in resp.text:
                _save_debug_html(f"{clean}_{candidate}", resp.text)
                data = _validate_parsed_data(parse_wiki_table(resp.text))
                if data:
                    data["_source"] = "dmowiki"
                    data["_name"] = clean
                    _save_cache(data)
                    return data
        except Exception:
            pass

    # 2) Fallback: cloudscraper
    if _scraper:
        try:
            resp = _scraper.get(url, timeout=20)
            if resp.status_code == 200 and "Just a moment" not in resp.text:
                _save_debug_html(f"{clean}_{candidate}", resp.text)
                data = _validate_parsed_data(parse_wiki_table(resp.text))
                if data:
                    data["_source"] = "dmowiki"
                    data["_name"] = clean
                    _save_cache(data)
                    return data
        except requests.RequestException:
            pass
        except Exception:
            pass

    return None


def _try_wayback(clean, candidate):
    """Try Wayback Machine snapshots."""
    for snap in SNAP_YEARS:
        url = f"https://web.archive.org/web/{snap}/https://dmowiki.com/{candidate}"
        try:
            resp = requests.get(url, timeout=15, headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
            })
        except requests.RequestException:
            continue
        if resp.status_code != 200:
            continue
        if "Just a moment" in resp.text or "challenges.cloudflare.com" in resp.text:
            continue
        _save_debug_html(f"{clean}_{candidate}", resp.text)
        data = _validate_parsed_data(parse_wiki_table(resp.text))
        if data is None:
            continue
        data["_source"] = f"Wayback-{snap}"
        data["_name"] = clean
        _save_cache(data)
        return data
        break
    return None


def _try_cache(clean):
    """Check JSON cache for existing data."""
    cache = _load_cache()
    return _validate_parsed_data(cache.get(clean))


def _scan_manual_html():
    """Scan manual_html folder and return dict {name: filepath, name_underscore: filepath}."""
    files = {}
    if not os.path.isdir(MANUAL_HTML_DIR):
        return files
    for fname in os.listdir(MANUAL_HTML_DIR):
        if fname.lower().endswith(".html"):
            name = os.path.splitext(fname)[0]
            files[name] = os.path.join(MANUAL_HTML_DIR, fname)
            # Also index underscore variant if name has spaces
            if " " in name:
                files[name.replace(" ", "_")] = os.path.join(MANUAL_HTML_DIR, fname)
    return files


def _try_manual_html(clean):
    """Look for a manually saved HTML file in manual_html/."""
    files = _scan_manual_html()
    if not files:
        return None
    # Build candidate list: exact name, with underscores, without colons/apostrophes, partial
    candidates = [
        clean,
        clean.replace(" ", "_"),
        clean.replace(":", "").replace("'", "").replace(" ", "_"),
        clean.replace(":", "").replace("'", ""),
    ]
    # Also try progressively shorter name (for when file has a shorter name)
    parts = clean.replace(" ", "_").split("_")
    for i in range(len(parts) - 1, 0, -1):
        candidates.append("_".join(parts[:i]))
        candidates.append(" ".join(parts[:i]))
    path = None
    for candidate in candidates:
        if candidate in files:
            path = files[candidate]
            break
    if path is None:
        return None
    try:
        with open(path, "r", encoding="utf-8") as f:
            html = f.read()
    except Exception:
        return None
    data = _validate_parsed_data(parse_wiki_table(html))
    if data:
        data["_source"] = "manual_html"
        data["_name"] = clean
        _save_cache(data)
        return data
    return None


def search_digimon(name):
    clean = name.strip()
    if not clean:
        return None

    page_names = _candidate_page_names(clean)

    # 1) dmowiki direct — live data (most up-to-date)
    for page_name in page_names:
        candidate = page_name.replace(" ", "_")
        data = _try_dmowiki(page_name, candidate)
        if data:
            return data

    # 2) Manual HTML (user saves from browser to bypass Cloudflare)
    for page_name in page_names:
        data = _try_manual_html(page_name)
        if data:
            return data

    # 3) Local cache
    for page_name in page_names:
        data = _try_cache(page_name)
        if data:
            return data

    # 4) Last resort: Wayback snapshots
    for page_name in page_names:
        candidate = page_name.replace(" ", "_")
        data = _try_wayback(page_name, candidate)
        if data:
            return data

    return None


def parse_wiki_table(html):
    soup = BeautifulSoup(html, "html.parser")
    tables = soup.find_all("table", class_="wikitable")

    form = None
    if tables:
        info_rows = tables[0].find_all("tr")
        for tr in info_rows:
            tds = tr.find_all("td")
            if len(tds) >= 2 and "Form:" in tds[0].get_text():
                form = tds[1].get_text(strip=True)
                break

    stat_table = None
    for t in tables:
        header = t.find("th")
        if header and "Digimon Stats" in header.get_text():
            stat_table = t
            break
    if stat_table is None:
        return None if not form else {"form": form}

    level_cap = 140
    m = re.search(r"level (\d+)", html)
    if m:
        level_cap = int(m.group(1))

    result = {"form": form, "level_cap": level_cap}
    for tr in stat_table.find_all("tr"):
        cells = [c.get_text(" ", strip=True) for c in tr.find_all(["td", "th"])]
        if len(cells) < 3:
            continue
        label = cells[1].strip().lower() if len(cells) > 1 else ""
        key = WIKI_ROW_MAP.get(label)
        if not key:
            continue
        result[key] = cells[2].strip() if len(cells) > 2 else None
        result[f"{key}_base"] = cells[3].strip() if len(cells) > 3 else None

    # Raw rows for debug
    raw_rows = []
    for tr in stat_table.find_all("tr"):
        cells = tr.find_all(["td", "th"])
        if cells:
            raw_rows.append([c.get_text(strip=True) for c in cells])
    result["_raw_rows"] = raw_rows
    result["_table_html"] = str(stat_table)

    return result


def _save_debug_html(label, html):
    try:
        path = os.path.join(os.path.dirname(os.path.abspath(__file__)), f"_wiki_{label}.html")
        with open(path, "w", encoding="utf-8") as f:
            f.write(html)
    except Exception:
        pass


DIGIMON_NAMES = []
if getattr(sys, 'frozen', False):
    _base = sys._MEIPASS
else:
    _base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_list_path = os.path.join(_base, "digimon_list.json")
_save_list_path = os.path.join(_get_cache_dir(), "digimon_list.json")
if os.path.exists(_list_path):
    try:
        with open(_list_path, encoding="utf-8") as _f:
            DIGIMON_NAMES = json.load(_f).get("digimon", [])
    except Exception:
        pass

try:
    if os.path.exists(_save_list_path):
        with open(_save_list_path, encoding="utf-8") as _f:
            DIGIMON_NAMES = json.load(_f).get("digimon", [])
except Exception:
    pass

if not DIGIMON_NAMES:
    DIGIMON_NAMES = [
        "Agumon", "Gabumon", "Patamon", "Guilmon", "Renamon", "Veemon", "Dorumon",
        "Impmon", "Lopmon", "Gomamon", "Palmon", "Tentomon", "Biyomon", "Kotemon",
        "Gaomon", "Lalamon", "Falcomon", "Hackmon", "Gammamon", "Jellymon", "Angoramon",
        "Agumon X", "Gabumon X", "Guilmon X", "Patamon X", "Palmon X", "Renamon X",
        "Greymon", "Garurumon", "Growlmon", "Kyuubimon", "Fugamon", "Frighmon",
        "Goblimon", "Gotsumon", "Hagurumon", "Impmon", "Kokuwamon", "Koromon",
        "Kunemon", "Monodramon", "Mushroomon", "Otamamon", "Piyomon", "Salamon",
        "Tanemon", "ToyAgumon", "Tsukaimon", "Wormmon", "Betamon", "Candlemon",
        "DemiDevimon", "DemiMeramon", "Dokunemon", "Gazimon", "Gizamon",
        "MetalGreymon", "WarGreymon", "Omegamon", "Omegamon X", "Omegamon Alter-S",
        "Omegamon Alter-B", "Omegamon Zwart", "Gallantmon", "Gallantmon X",
        "Gallantmon (Crimson Mode)", "Beelzemon", "Beelzemon X", "Beelzemon (Blast Mode)",
        "Alphamon", "Alphamon Ouryuken", "Jesmon", "Jesmon X", "Examon",
        "Imperialdramon (Dragon Mode)", "Imperialdramon (Fighter Mode)",
        "Imperialdramon (Paladin Mode)", "Magnamon", "Magnamon X",
        "UlforceVeedramon", "Shoutmon X7", "ShineGreymon", "MirageGaogamon",
        "Rosemon", "Ravemon (Burst Mode)", "Craniamon", "Dynasmon", "LordKnightmon",
        "Duftmon", "Sleipmon", "Gankoomon", "Leomon", "MagnaAngemon",
        "Angemon", "Angewomon", "LadyDevimon", "Mastemon", "Seraphimon",
        "Ophanimon", "Cherubimon", "Lucemon", "Lilithmon", "Barbamon",
        "Leviamon", "Belphemon (Rage Mode)", "Daemon", "Creepymon",
    ]


class CalculadoraDMO:
    SIZE_DEFAULT = WIKI_SIZE
    COMPARE_CARD_WIDTH = 320
    COMPARE_CARD_HEIGHT = 300

    LIGHT_THEME = {
        "BG": "#edf2f7", "CARD_BG": "#ffffff", "PANEL_BG": "#f7fafc",
        "ACCENT": "#1d4ed8", "ACCENT_SOFT": "#dbeafe", "SUCCESS": "#15803d",
        "LABEL_FG": "#0f172a", "SUB_FG": "#475569", "BORDER": "#cbd5e1",
        "INPUT_BG": "#f8fafc", "INPUT_FG": "#0f172a",
    }
    DARK_THEME = {
        "BG": "#111827", "CARD_BG": "#1f2937", "PANEL_BG": "#0f172a",
        "ACCENT": "#60a5fa", "ACCENT_SOFT": "#1e3a8a", "SUCCESS": "#22c55e",
        "LABEL_FG": "#e5eefb", "SUB_FG": "#94a3b8", "BORDER": "#334155",
        "INPUT_BG": "#0f172a", "INPUT_FG": "#e5eefb",
    }

    def __init__(self, root):
        root.title("Digimon Master Online - Calculadora Final")
        root.resizable(True, True)
        self.dark_mode = False
        self.theme = dict(self.LIGHT_THEME)
        self.root = root
        self._ui_queue = queue.Queue()
        self._apply_styles()
        self.root.after(50, self._drain_ui_queue)

        notebook = ttk.Notebook(root)
        notebook.pack(fill="both", expand=True)
        self.notebook = notebook
        tab1 = ttk.Frame(notebook, padding="8")
        tab2 = ttk.Frame(notebook, padding="8")
        tab3 = ttk.Frame(notebook, padding="8")
        tab4 = ttk.Frame(notebook, padding="8")
        notebook.add(tab1, text="Calculadora")
        notebook.add(tab2, text="Calculadora Reversa")
        notebook.add(tab3, text="Comparação")
        notebook.add(tab4, text="Lista de Digimons")

        canvas = tk.Canvas(tab1, highlightthickness=0, bg=self.theme["BG"])
        self.canvas = canvas
        scrollbar = ttk.Scrollbar(tab1, orient="vertical", command=canvas.yview)
        canvas.configure(yscrollcommand=scrollbar.set)
        scrollbar.pack(side="right", fill="y")
        canvas.pack(side="left", fill="both", expand=True)

        main = ttk.Frame(canvas, padding="16")
        main.configure(style="TFrame")
        canvas.create_window((0, 0), window=main, anchor="nw")

        def on_frame_configure(*_):
            canvas.configure(scrollregion=canvas.bbox("all"))
        main.bind("<Configure>", on_frame_configure)

        def on_mousewheel(event):
            canvas.yview_scroll(-int(event.delta / 120), "units")
        canvas.bind_all("<MouseWheel>", on_mousewheel)

        self.build_main_ui(main)
        self.build_rev_ui(tab2)
        self.build_compare_ui(tab3)
        self.build_list_ui(tab4)

        root.update_idletasks()
        cw = main.winfo_reqwidth() + 50
        ch = min(main.winfo_reqheight() + 50, root.winfo_screenheight() - 80)
        scrw = scrollbar.winfo_width() or 20
        root.geometry(f"{int(cw + scrw)}x{int(ch)}")

    def _drain_ui_queue(self):
        try:
            while True:
                callback = self._ui_queue.get_nowait()
                callback()
        except queue.Empty:
            pass
        self.root.after(50, self._drain_ui_queue)

    def _apply_styles(self):
        style = ttk.Style()
        style.theme_use("clam")
        t = self.theme
        style.configure("TFrame", background=t["BG"])
        style.configure("TLabel", background=t["BG"], foreground=t["LABEL_FG"], font=("Segoe UI", 10))
        style.configure("TButton", font=("Segoe UI", 10, "bold"),
                        background=t["ACCENT"], foreground="white", borderwidth=0, padding=(12, 7))
        style.map("TButton",
                  background=[("active", t["ACCENT"]), ("pressed", t["ACCENT"])],
                  foreground=[("active", "white"), ("pressed", "white")])
        style.configure("CardTitle.TLabel", background=t["CARD_BG"], foreground=t["ACCENT"],
                        font=("Segoe UI Semibold", 11, "bold"))
        style.configure("Header.TLabel", background=t["BG"], foreground=t["ACCENT"],
                        font=("Segoe UI Semibold", 15, "bold"))
        style.configure("Hero.TLabel", background=t["BG"], foreground=t["LABEL_FG"],
                        font=("Segoe UI Semibold", 20, "bold"))
        style.configure("Sub.TLabel", background=t["BG"], foreground=t["SUB_FG"], font=("Segoe UI", 9))
        style.configure("CardSub.TLabel", background=t["CARD_BG"], foreground=t["SUB_FG"], font=("Segoe UI", 9))
        style.configure("Cell.TLabel", background=t["CARD_BG"], foreground=t["LABEL_FG"],
                        font=("Segoe UI", 10), anchor="center")
        style.configure("Result.TLabel", background=t["CARD_BG"], foreground=t["SUCCESS"],
                        font=("Segoe UI", 10, "bold"), anchor="center")
        style.configure("Total.TLabel", background=t["BG"], foreground=t["LABEL_FG"],
                        font=("Segoe UI Semibold", 12, "bold"))
        style.configure("BoldHeader.TLabel", background=t["CARD_BG"], foreground=t["LABEL_FG"],
                        font=("Segoe UI Semibold", 10, "bold"), anchor="center")
        style.configure("TNotebook", background=t["BG"], borderwidth=0, tabmargins=(0, 0, 0, 8))
        style.configure("TNotebook.Tab", background=t["PANEL_BG"], foreground=t["SUB_FG"],
                        padding=[16, 8], font=("Segoe UI Semibold", 10))
        style.map("TNotebook.Tab",
                  background=[("selected", t["CARD_BG"]), ("active", t["ACCENT_SOFT"])],
                  foreground=[("selected", t["ACCENT"]), ("active", t["LABEL_FG"])])
        style.configure("TEntry", fieldbackground=t["INPUT_BG"], foreground=t["INPUT_FG"],
                        bordercolor=t["BORDER"], lightcolor=t["BORDER"], darkcolor=t["BORDER"],
                        insertcolor=t["INPUT_FG"], padding=6)
        style.configure("TCombobox", fieldbackground=t["INPUT_BG"], foreground=t["INPUT_FG"],
                        bordercolor=t["BORDER"], lightcolor=t["BORDER"], darkcolor=t["BORDER"],
                        arrowsize=14, padding=5)
        style.map("TCombobox",
                  fieldbackground=[("readonly", t["INPUT_BG"])],
                  foreground=[("readonly", t["INPUT_FG"])])
        style.configure("TRadiobutton", background=t["CARD_BG"], foreground=t["LABEL_FG"],
                        font=("Segoe UI", 9))
        style.configure("TCheckbutton", background=t["CARD_BG"], foreground=t["LABEL_FG"],
                        font=("Segoe UI", 9))
        style.configure("TProgressbar", troughcolor=t["ACCENT_SOFT"], background=t["ACCENT"], borderwidth=0)
        style.configure("Treeview", background=t["CARD_BG"], foreground=t["LABEL_FG"],
                        fieldbackground=t["CARD_BG"], bordercolor=t["BORDER"],
                        font=("Segoe UI", 9), rowheight=26)
        style.configure("Treeview.Heading", background=t["PANEL_BG"], foreground=t["LABEL_FG"],
                        font=("Segoe UI", 9, "bold"), bordercolor=t["BORDER"])
        style.map("Treeview",
                  background=[("selected", t["ACCENT"])],
                  foreground=[("selected", "white")])
        style.map("Treeview.Heading",
                  background=[("active", t["ACCENT_SOFT"])])
        self.root.configure(bg=t["BG"])

    def try_float(self, val):
        val = val.strip().replace(",", ".")
        if val == "":
            return 0.0
        return float(val)

    def _make_card(self, parent, title, row):
        t = self.theme
        card = tk.Frame(parent, bg=t["CARD_BG"], bd=0, highlightthickness=1,
                        highlightbackground=t["BORDER"], highlightcolor=t["BORDER"],
                        padx=16, pady=12)
        card.grid(row=row, column=0, columnspan=6, sticky="ew", pady=(0, 8))
        tk.Frame(card, bg=t["ACCENT"], height=3).pack(fill="x", pady=(0, 8))
        title_row = tk.Frame(card, bg=t["CARD_BG"])
        title_row.pack(fill="x")
        ttk.Label(title_row, text=title, style="CardTitle.TLabel").pack(anchor="w", side="left")
        card._is_card = True
        return card

    def _add_card_hint(self, parent, text):
        ttk.Label(parent, text=text, style="CardSub.TLabel", wraplength=780, justify="left").pack(anchor="w", pady=(2, 8))

    def toggle_theme(self):
        self.dark_mode = not self.dark_mode
        self.theme = dict(self.DARK_THEME if self.dark_mode else self.LIGHT_THEME)
        self._apply_styles()
        self._apply_theme(self.root)
        self.theme_btn.config(text="Modo Claro" if self.dark_mode else "Modo Escuro")

    def _apply_theme(self, widget):
        t = self.theme
        for child in widget.winfo_children():
            if isinstance(child, tk.Frame):
                is_card = getattr(child, "_is_card", False)
                child.configure(bg=t["CARD_BG"] if is_card else t["BG"],
                                highlightbackground=t["BORDER"], highlightcolor=t["BORDER"])
            elif isinstance(child, tk.Canvas):
                child.configure(bg=t["BG"])
            elif isinstance(child, tk.Button):
                child.configure(bg=t["ACCENT"], fg="white",
                                activebackground=t["ACCENT"], activeforeground="white")
            elif isinstance(child, tk.Listbox):
                child.configure(bg=t["CARD_BG"], fg=t["LABEL_FG"],
                                selectbackground=t["ACCENT"], selectforeground="white")
            elif isinstance(child, tk.Text):
                child.configure(bg=t["INPUT_BG"], fg=t["INPUT_FG"], insertbackground=t["INPUT_FG"])
            elif isinstance(child, tk.Entry):
                child.configure(bg=t["INPUT_BG"], fg=t["INPUT_FG"], insertbackground=t["INPUT_FG"])
            elif isinstance(child, ttk.Treeview):
                child.tag_configure("uncached", foreground=t["SUB_FG"])
                child.tag_configure("cached", foreground=t["LABEL_FG"])
            self._apply_theme(child)

    def build_main_ui(self, parent):
        self.root = parent.winfo_toplevel()
        r = 0

        # ===================== HEADER =====================
        header_frame = tk.Frame(parent, bg=self.theme["BG"])
        header_frame.grid(row=r, column=0, columnspan=6, sticky="ew", pady=(0, 8))
        ttk.Label(header_frame, text="Digimon Stats Studio", style="Hero.TLabel").pack(anchor="w")
        ttk.Label(header_frame, text="Busca dados na Wiki, calcula stats finais e compara Digimons lado a lado.",
                  style="Sub.TLabel").pack(anchor="w", pady=(2, 0))
        ttk.Label(header_frame, text="Atalhos: Enter busca | Ctrl+Enter calcula | +HTML abre importacao manual.",
                  style="Sub.TLabel").pack(anchor="w", pady=(2, 0))
        self.theme_btn = tk.Button(header_frame, text="Modo Escuro",
            command=self.toggle_theme, bg=self.theme["ACCENT"], fg="white",
            font=("Segoe UI", 9, "bold"), bd=0, cursor="hand2",
            padx=10, pady=2, activebackground=self.theme["ACCENT"])
        self.theme_btn.pack(side="right", padx=(10, 0))
        r += 1

        # ===================== BUSCAR NA WIKI =====================
        card_wiki = self._make_card(parent, "Buscar Digimon na DMO Wiki", r)
        self._add_card_hint(card_wiki, "Ordem da busca: DMOwiki, HTML manual, cache local e Wayback.")
        r += 1

        wf = tk.Frame(card_wiki, bg=self.theme["CARD_BG"])
        wf.pack(fill="x")
        ttk.Label(wf, text="Nome:", style="TLabel").pack(side="left", padx=(0, 4))
        self.wiki_name_var = tk.StringVar()
        self.wiki_name_entry = ttk.Entry(wf, textvariable=self.wiki_name_var, width=24)
        self.wiki_name_entry.pack(side="left", padx=(0, 8))
        self.wiki_name_entry.bind("<Return>", lambda e: self.buscar_wiki())
        self.wiki_btn = ttk.Button(wf, text="Buscar", command=self.buscar_wiki)
        self.wiki_btn.pack(side="left", padx=(0, 8))
        self.html_btn = ttk.Button(wf, text="+HTML", command=self._open_html_folder, width=7)
        self.html_btn.pack(side="left", padx=(0, 8))
        self.wiki_progress = ttk.Progressbar(wf, mode="indeterminate", length=80)
        self.wiki_status = ttk.Label(wf, text="", style="Sub.TLabel")
        self.wiki_status.pack(side="left", padx=(4, 0))

        # Autocomplete frame
        self.wiki_auto_frame = tk.Frame(card_wiki, bg=self.theme["CARD_BG"])
        auto_row = tk.Frame(self.wiki_auto_frame, bg=self.theme["CARD_BG"])
        auto_row.pack(fill="x", padx=(40, 0))
        self.wiki_auto_listbox = tk.Listbox(auto_row, height=6,
            font=("Segoe UI", 10), bd=1, relief="solid",
            bg=self.theme["CARD_BG"], fg=self.theme["LABEL_FG"],
            selectbackground=self.theme["ACCENT"], selectforeground="white",
            highlightthickness=0)
        self.wiki_auto_listbox.pack(side="left", fill="x", expand=True)
        auto_scroll = ttk.Scrollbar(auto_row, orient="vertical", command=self.wiki_auto_listbox.yview)
        auto_scroll.pack(side="right", fill="y")
        self.wiki_auto_listbox.configure(yscrollcommand=auto_scroll.set)
        self.wiki_auto_add_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(self.wiki_auto_frame, text="Adicionar ao autocomplete automaticamente",
                        variable=self.wiki_auto_add_var, style="TLabel").pack(anchor="w", padx=(40, 0), pady=(2, 0))

        # Debug: raw wiki table
        self.wiki_debug_frame = tk.Frame(card_wiki, bg=self.theme["CARD_BG"])
        ttk.Label(self.wiki_debug_frame, text="Dados brutos do wiki:", style="TLabel").pack(anchor="w", pady=(4, 2))
        df_row = tk.Frame(self.wiki_debug_frame, bg=self.theme["CARD_BG"])
        df_row.pack(fill="x")
        self.wiki_debug_text = tk.Text(df_row, height=8, width=60, font=("Consolas", 9),
            bg=self.theme["CARD_BG"], fg=self.theme["LABEL_FG"], bd=1, relief="solid", wrap="none")
        self.wiki_debug_text.pack(side="left", fill="x", expand=True)
        debug_scroll = ttk.Scrollbar(df_row, orient="vertical", command=self.wiki_debug_text.yview)
        debug_scroll.pack(side="right", fill="y")
        self.wiki_debug_text.configure(yscrollcommand=debug_scroll.set)
        self.wiki_debug_frame.pack_forget()  # hidden until first search

        self.wiki_name_var.trace_add("write", self._on_wiki_name_change)
        self.wiki_name_entry.bind("<Down>", lambda e: self.wiki_auto_listbox.focus_set() if self.wiki_auto_frame.winfo_ismapped() else None)
        self.wiki_name_entry.bind("<FocusOut>", lambda e: self.root.after(200, self._hide_wiki_suggestions))
        self.wiki_auto_listbox.bind("<<ListboxSelect>>", self._select_wiki_suggestion)
        self.wiki_auto_listbox.bind("<Return>", self._select_wiki_suggestion)
        self.wiki_auto_listbox.bind("<Escape>", lambda e: self._hide_wiki_suggestions())
        self.wiki_auto_listbox.bind("<FocusOut>", lambda e: self._hide_wiki_suggestions())

        # ===================== BASE STAT =====================
        card_base = self._make_card(parent, "Base Stat", r)
        self._add_card_hint(card_base, "Use o modo simples para ajustes rapidos ou o modo por nivel para growth detalhado.")
        r += 1

        method_frame = tk.Frame(card_base, bg=self.theme["CARD_BG"])
        method_frame.pack(fill="x", pady=(0, 8))
        self.base_method = tk.StringVar(value="simples")
        ttk.Radiobutton(method_frame, text="Simples (Size x Base + Adicional)",
                        variable=self.base_method, value="simples",
                        command=self.toggle_base_method).pack(side="left", padx=(0, 20))
        ttk.Radiobutton(method_frame, text="Por Nivel (Lv, Evo, Growth)",
                        variable=self.base_method, value="nivel",
                        command=self.toggle_base_method).pack(side="left")

        # -- Simple --
        self.simple_frame = tk.Frame(card_base, bg=self.theme["CARD_BG"])
        self.simple_frame.pack(fill="x")

        top_row = tk.Frame(self.simple_frame, bg=self.theme["CARD_BG"])
        top_row.pack(fill="x", pady=(0, 6))
        ttk.Label(top_row, text="Size:", style="TLabel").pack(side="left", padx=(0, 4))
        self.s_size_var = tk.StringVar(value=str(self.SIZE_DEFAULT))
        ttk.Entry(top_row, textvariable=self.s_size_var, width=8).pack(side="left", padx=(0, 20))

        ttk.Label(top_row, text="Nome:", style="TLabel").pack(side="left", padx=(0, 4))
        self.s_nome_var = tk.StringVar()
        ttk.Entry(top_row, textvariable=self.s_nome_var, width=20).pack(side="left")

        tbl = tk.Frame(self.simple_frame, bg=self.theme["CARD_BG"])
        tbl.pack(fill="x")
        for ci, c in enumerate(["Stat", "Base", "Adicional"]):
            ttk.Label(tbl, text=c, style="BoldHeader.TLabel", width=14).grid(row=0, column=ci, padx=4, pady=2)
        tk.Frame(tbl, bg="#ddd", height=1).grid(row=1, column=0, columnspan=3, sticky="ew", pady=2)

        self.s_base_vars = {}
        self.s_adic_vars = {}
        for si, (sl, sk) in enumerate(zip(STAT_LABELS, STAT_KEYS)):
            ttk.Label(tbl, text=sl, style="TLabel", width=14).grid(row=2 + si, column=0, padx=4, pady=1)
            bv = tk.StringVar()
            ttk.Entry(tbl, textvariable=bv, width=14).grid(row=2 + si, column=1, padx=4, pady=1)
            self.s_base_vars[sk] = bv
            av = tk.StringVar()
            ttk.Entry(tbl, textvariable=av, width=14).grid(row=2 + si, column=2, padx=4, pady=1)
            self.s_adic_vars[sk] = av

        # -- Nivel --
        self.nivel_frame = tk.Frame(card_base, bg=self.theme["CARD_BG"])
        self.nivel_frame.pack(fill="x")

        top_row_n = tk.Frame(self.nivel_frame, bg=self.theme["CARD_BG"])
        top_row_n.pack(fill="x", pady=(0, 6))
        ttk.Label(top_row_n, text="Level:", style="TLabel").pack(side="left", padx=(0, 4))
        self.n_lvl_var = tk.StringVar(value="140")
        ttk.Entry(top_row_n, textvariable=self.n_lvl_var, width=8).pack(side="left", padx=(0, 20))

        ttk.Label(top_row_n, text="Evo:", style="TLabel").pack(side="left", padx=(0, 4))
        self.n_evo_var = tk.StringVar()
        cmb = ttk.Combobox(top_row_n, textvariable=self.n_evo_var,
                           values=[name for name, _ in EVO_OPTIONS],
                           state="readonly", width=22)
        cmb.pack(side="left", padx=(0, 20))
        cmb.current(0)

        ttk.Label(top_row_n, text="Size:", style="TLabel").pack(side="left", padx=(0, 4))
        self.n_size_var = tk.StringVar(value=str(self.SIZE_DEFAULT))
        ttk.Entry(top_row_n, textvariable=self.n_size_var, width=8).pack(side="left")

        tbl_n = tk.Frame(self.nivel_frame, bg=self.theme["CARD_BG"])
        tbl_n.pack(fill="x")
        for ci, c in enumerate(["Stat", "Base Lv1", "Growth/Lv", "Final"]):
            ttk.Label(tbl_n, text=c, style="BoldHeader.TLabel", width=14).grid(row=0, column=ci, padx=4, pady=2)
        tk.Frame(tbl_n, bg="#ddd", height=1).grid(row=1, column=0, columnspan=4, sticky="ew", pady=2)

        self.n_base_vars = {}
        self.n_growth_vars = {}
        self.n_final_vars = {}
        for si, (sl, sk) in enumerate(zip(STAT_LABELS, STAT_KEYS)):
            ttk.Label(tbl_n, text=sl, style="TLabel", width=14).grid(row=2 + si, column=0, padx=4, pady=1)
            bv = tk.StringVar()
            ttk.Entry(tbl_n, textvariable=bv, width=14).grid(row=2 + si, column=1, padx=4, pady=1)
            self.n_base_vars[sk] = bv
            gv = tk.StringVar()
            ttk.Entry(tbl_n, textvariable=gv, width=14).grid(row=2 + si, column=2, padx=4, pady=1)
            self.n_growth_vars[sk] = gv
            fv = tk.StringVar()
            ttk.Label(tbl_n, textvariable=fv, style="Result.TLabel", width=14).grid(row=2 + si, column=3, padx=4, pady=1)
            self.n_final_vars[sk] = fv

        self.n_lvl_var.trace_add("write", lambda *_: self._recalc_nivel_final())
        self.n_evo_var.trace_add("write", lambda *_: self._recalc_nivel_final())
        self.n_size_var.trace_add("write", lambda *_: self._recalc_nivel_final())
        for sk in STAT_KEYS:
            self.n_base_vars[sk].trace_add("write", lambda *_, s=sk: self._recalc_nivel_final())
            self.n_growth_vars[sk].trace_add("write", lambda *_, s=sk: self._recalc_nivel_final())
        self._recalc_nivel_final()

        self.toggle_base_method()

        # ===================== CLONE =====================
        card_clone = self._make_card(parent, "Clone", r)
        self._add_card_hint(card_clone, "O resumo mostra os multiplicadores aplicados ao nivel de clone selecionado.")
        r += 1

        cf = tk.Frame(card_clone, bg=self.theme["CARD_BG"])
        cf.pack(fill="x")
        ttk.Label(cf, text="Nivel do Clone:", style="TLabel").pack(side="left", padx=(0, 6))
        self.clone_lv_var = tk.StringVar()
        cmb = ttk.Combobox(cf, textvariable=self.clone_lv_var,
                           values=[str(d[0]) for d in CLONE_DATA],
                           state="readonly", width=6)
        cmb.pack(side="left", padx=(0, 16))
        cmb.current(len(CLONE_DATA) - 1)

        self.clone_info = ttk.Label(cf, text="", style="TLabel", font=("Segoe UI", 10))
        self.clone_info.pack(side="left")

        def update_clone_info(*_):
            try:
                lv = int(self.clone_lv_var.get())
            except ValueError:
                return
            _, a, c, _, _, h = CLONE_NUM[lv]
            self.clone_info.config(text=f"AT: x{1+a:.2f}   CT: x{1+c:.2f}   HP: x{1+h:.2f}   HT/BL/EV/DE/DS: x1.00")
        self.clone_lv_var.trace_add("write", update_clone_info)
        update_clone_info()

        # ===================== FLAT BONUSES =====================
        card_flat = self._make_card(parent, "Flat Bonuses (adicionados apos clone)", r)
        self._add_card_hint(card_flat, "Preencha somente os bonuses fixos que entram depois do clone.")
        r += 1

        hdr = tk.Frame(card_flat, bg=self.theme["CARD_BG"])
        hdr.pack(fill="x", pady=(0, 2))
        ttk.Label(hdr, text="Fonte", style="BoldHeader.TLabel", width=14).grid(row=0, column=0, padx=2)
        for si, sl in enumerate(STAT_LABELS):
            ttk.Label(hdr, text=sl, style="BoldHeader.TLabel", width=10).grid(row=0, column=1 + si, padx=2)
        tk.Frame(card_flat, bg="#ddd", height=1).pack(fill="x", pady=2)

        self.flat_vars = {}
        for cat in FLAT_CATEGORIES:
            row_f = tk.Frame(card_flat, bg=self.theme["CARD_BG"])
            row_f.pack(fill="x", pady=1)
            ttk.Label(row_f, text=cat, style="TLabel", width=14).grid(row=0, column=0, padx=2)
            cat_vars = {}
            for si, sk in enumerate(STAT_KEYS):
                v = tk.StringVar()
                ttk.Entry(row_f, textvariable=v, width=10).grid(row=0, column=1 + si, padx=2)
                cat_vars[sk] = v
            self.flat_vars[cat] = cat_vars

        # ===================== CALCULATE =====================
        btn_frame = tk.Frame(parent, bg=self.theme["BG"])
        btn_frame.grid(row=r, column=0, columnspan=6, pady=(4, 8))
        tk.Button(btn_frame, text="Calcular", command=self.calcular,
                  bg=self.theme["ACCENT"], fg="white", font=("Segoe UI", 11, "bold"),
                  padx=32, pady=6, bd=0, cursor="hand2",
                  activebackground=self.theme["ACCENT"]).pack()
        self.root.bind("<Control-Return>", lambda e: self.calcular())
        r += 1

        # ===================== RESULTS =====================
        card_res = self._make_card(parent, "Resultado Final", r)
        self._add_card_hint(card_res, "Painel consolidado com base, ganho por level, clone, flat e total final.")
        r += 1

        res_tbl = tk.Frame(card_res, bg=self.theme["CARD_BG"])
        res_tbl.pack(fill="x", pady=(4, 0))
        cols_res = ["Stat", "Base (c/ Adicional)", "+/Lv", "Clone (x)", "Clone (+)", "Flat", "Total"]
        widths = [10, 14, 8, 8, 10, 10, 14]
        for ci, (c, w) in enumerate(zip(cols_res, widths)):
            ttk.Label(res_tbl, text=c, style="BoldHeader.TLabel", width=w).grid(row=0, column=ci, padx=4, pady=2)
        tk.Frame(res_tbl, bg="#ddd", height=1).grid(row=1, column=0, columnspan=7, sticky="ew", pady=2)

        self.result_cells = {}
        for si, (sl, sk) in enumerate(zip(STAT_LABELS, STAT_KEYS)):
            ttk.Label(res_tbl, text=sl, style="TLabel", width=10).grid(row=2 + si, column=0, padx=4, pady=2)
            cells = {}
            labels = [("Cell.TLabel", widths[1]), ("Cell.TLabel", widths[2]),
                      ("Cell.TLabel", widths[3]), ("Cell.TLabel", widths[4]),
                      ("Cell.TLabel", widths[5]), ("Result.TLabel", widths[6])]
            for ci, (stl, w) in enumerate(labels):
                lbl = ttk.Label(res_tbl, text="--", style=stl, width=w)
                lbl.grid(row=2 + si, column=1 + ci, padx=4, pady=2)
                cells[ci] = lbl
            self.result_cells[sk] = cells

        self.total_line = ttk.Label(parent, text="", style="Total.TLabel")
        self.total_line.grid(row=r, column=0, columnspan=6, sticky="w", pady=(4, 0))

        self.copy_btn = tk.Button(parent, text="Copiar Resultados",
            command=self._copy_results, bg=self.theme["ACCENT"], fg="white",
            font=("Segoe UI", 9), bd=0, cursor="hand2",
            padx=10, pady=2, activebackground=self.theme["ACCENT"])
        self.copy_btn.grid(row=r, column=5, sticky="e", padx=(0, 4))
        r += 1

    def _copy_results(self):
        text = self.total_line.cget("text")
        if text:
            self.root.clipboard_clear()
            self.root.clipboard_append(text)
            self.wiki_status.config(text="Copiado!")

    def build_rev_ui(self, parent):
        r = 0

        card_rev = self._make_card(parent, "Calculadora Reversa / Verificador", r)
        self._add_card_hint(card_rev, "Use 2 pontos conhecidos para descobrir growth ou 1 ponto + base para validar dados.")
        r += 1

        # Mode
        mf = tk.Frame(card_rev, bg=self.theme["CARD_BG"])
        mf.pack(fill="x", pady=(0, 6))
        self.rev_mode = tk.StringVar(value="2p")
        ttk.Radiobutton(mf, text="Descobridor (2 pontos)",
                        variable=self.rev_mode, value="2p",
                        command=self._toggle_reverso_mode).pack(side="left", padx=(0, 15))
        ttk.Radiobutton(mf, text="Verificador (1 ponto + Base)",
                        variable=self.rev_mode, value="1p",
                        command=self._toggle_reverso_mode).pack(side="left")

        rf1 = tk.Frame(card_rev, bg=self.theme["CARD_BG"])
        rf1.pack(fill="x", pady=2)
        ttk.Label(rf1, text="Stat:", style="TLabel").pack(side="left", padx=(0, 4))
        self.rev_stat = tk.StringVar(value="AT")
        ttk.Combobox(rf1, textvariable=self.rev_stat,
                     values=["HP", "DS", "AT", "CT (%)", "HT", "DE"],
                     width=10, state="readonly").pack(side="left", padx=(0, 16))
        ttk.Label(rf1, text="Evo:", style="TLabel").pack(side="left", padx=(0, 4))
        self.rev_evo = tk.StringVar()
        rev_evo_cmb = ttk.Combobox(rf1, textvariable=self.rev_evo,
                                    values=[n for n, _ in EVO_OPTIONS],
                                    width=18, state="readonly")
        rev_evo_cmb.pack(side="left")
        rev_evo_cmb.current(3)

        # Ponto 1
        p1f = tk.Frame(card_rev, bg=self.theme["CARD_BG"])
        p1f.pack(fill="x", pady=2)
        ttk.Label(p1f, text="Ponto 1:", style="TLabel").pack(side="left", padx=(0, 4))
        ttk.Label(p1f, text="Size", style="Sub.TLabel").pack(side="left", padx=(0, 2))
        self.rev_s1 = tk.StringVar(value="1.4")
        ttk.Entry(p1f, textvariable=self.rev_s1, width=6).pack(side="left", padx=(0, 8))
        ttk.Label(p1f, text="Lv", style="Sub.TLabel").pack(side="left", padx=(0, 2))
        self.rev_l1 = tk.StringVar(value="170")
        ttk.Entry(p1f, textvariable=self.rev_l1, width=6).pack(side="left", padx=(0, 8))
        ttk.Label(p1f, text="Total", style="Sub.TLabel").pack(side="left", padx=(0, 2))
        self.rev_t1 = tk.StringVar(value="12901")
        ttk.Entry(p1f, textvariable=self.rev_t1, width=10).pack(side="left")

        # Ponto 2 (mode Descobridor)
        self.rev_p2_frame = tk.Frame(card_rev, bg=self.theme["CARD_BG"])
        self.rev_p2_frame.pack(fill="x", pady=2)
        ttk.Label(self.rev_p2_frame, text="Ponto 2:", style="TLabel").pack(side="left", padx=(0, 4))
        ttk.Label(self.rev_p2_frame, text="Size", style="Sub.TLabel").pack(side="left", padx=(0, 2))
        self.rev_s2 = tk.StringVar(value="1.0")
        ttk.Entry(self.rev_p2_frame, textvariable=self.rev_s2, width=6).pack(side="left", padx=(0, 8))
        ttk.Label(self.rev_p2_frame, text="Lv", style="Sub.TLabel").pack(side="left", padx=(0, 2))
        self.rev_l2 = tk.StringVar(value="1")
        ttk.Entry(self.rev_p2_frame, textvariable=self.rev_l2, width=6).pack(side="left", padx=(0, 8))
        ttk.Label(self.rev_p2_frame, text="Total", style="Sub.TLabel").pack(side="left", padx=(0, 2))
        self.rev_t2 = tk.StringVar(value="9065")
        ttk.Entry(self.rev_p2_frame, textvariable=self.rev_t2, width=10).pack(side="left")

        # Base Lv1 (mode Verificador)
        self.rev_base_frame = tk.Frame(card_rev, bg=self.theme["CARD_BG"])
        ttk.Label(self.rev_base_frame, text="Base Lv1 (Size 1.0):", style="TLabel").pack(side="left", padx=(0, 4))
        self.rev_base = tk.StringVar()
        ttk.Entry(self.rev_base_frame, textvariable=self.rev_base, width=10).pack(side="left")

        # Button
        btf = tk.Frame(card_rev, bg=self.theme["CARD_BG"])
        btf.pack(fill="x", pady=(6, 2))
        tk.Button(btf, text="Calcular Reverso", command=self._calcular_reverso,
                  bg=self.theme["ACCENT"], fg="white", font=("Segoe UI", 10, "bold"),
                  padx=20, pady=4, bd=0, cursor="hand2",
                  activebackground=self.theme["ACCENT"]).pack(side="left", padx=(0, 12))
        self.rev_result = ttk.Label(btf, text="", style="Sub.TLabel")
        self.rev_result.pack(side="left")

        self._toggle_reverso_mode()

    # ===================== COMPARAÇÃO =====================
    def build_compare_ui(self, parent):
        self.compare_cards = []

        # Canvas for vertical scrolling
        self.compare_canvas = tk.Canvas(parent, bg=self.theme["BG"], highlightthickness=0)
        self.compare_vscroll = ttk.Scrollbar(parent, orient="vertical", command=self.compare_canvas.yview)
        self.compare_canvas.configure(yscrollcommand=self.compare_vscroll.set)

        self.compare_vscroll.pack(side="right", fill="y")
        self.compare_canvas.pack(side="left", fill="both", expand=True)

        # Inner frame
        self.compare_container = tk.Frame(self.compare_canvas, bg=self.theme["BG"])
        self.compare_canvas.create_window((0, 0), window=self.compare_container, anchor="nw")
        self.compare_container.bind("<Configure>", self._on_compare_configure)
        self.compare_container.grid_columnconfigure(0, minsize=self.COMPARE_CARD_WIDTH, weight=1)
        self.compare_container.grid_columnconfigure(1, minsize=self.COMPARE_CARD_WIDTH, weight=1)

        # Top bar with Add button
        top = tk.Frame(parent, bg=self.theme["BG"])
        top.pack(fill="x", pady=(0, 8), before=self.compare_canvas)
        ttk.Label(top, text="Comparação de Digimons", style="Header.TLabel").pack(side="left")
        ttk.Label(top, text="Dois cards por linha, busca direta e status de origem por card.",
                  style="Sub.TLabel").pack(side="left", padx=(12, 0))
        self.compare_add_btn = tk.Button(top, text="+", command=self._add_comparison_card,
                                         bg=self.theme["ACCENT"], fg="white",
                                         font=("Segoe UI", 14, "bold"),
                                         padx=12, pady=2, bd=0, cursor="hand2",
                                         activebackground=self.theme["ACCENT"])
        self.compare_add_btn.pack(side="right", padx=(8, 0))

        # Add first two cards
        self._add_comparison_card()
        self._add_comparison_card()

    def _on_compare_configure(self, _=None):
        self.compare_canvas.configure(scrollregion=self.compare_canvas.bbox("all"))

    def _add_comparison_card(self, digimon_name=None):
        t = self.theme
        card_frame = tk.Frame(self.compare_container, bg=t["CARD_BG"], bd=1, relief="solid",
                              padx=12, pady=10, highlightbackground=t["SUB_FG"], highlightthickness=1,
                              width=self.COMPARE_CARD_WIDTH, height=self.COMPARE_CARD_HEIGHT)
        card_frame.grid_propagate(False)

        # Close button
        def _remove():
            self._remove_comparison_card(card_frame)
        tk.Button(card_frame, text="✕", command=_remove,
                  bg=t["CARD_BG"], fg=t["SUB_FG"], bd=0, cursor="hand2",
                  font=("Segoe UI", 10, "bold"),
                  activebackground=t["ACCENT"], activeforeground="white").pack(anchor="ne")

        # ComboBox / Entry
        var = tk.StringVar(value=digimon_name or "")
        entry_row = tk.Frame(card_frame, bg=t["CARD_BG"])
        entry_row.pack(fill="x", pady=(4, 0))
        entry = ttk.Entry(entry_row, textvariable=var, width=18, font=("Segoe UI", 10))
        entry.pack(side="left", fill="x", expand=True)

        # Autocomplete listbox (hidden by default)
        auto_frame = tk.Frame(card_frame, bg=t["CARD_BG"])
        auto_list = tk.Listbox(auto_frame, height=5,
            font=("Segoe UI", 10), bd=1, relief="solid",
            bg=t["CARD_BG"], fg=t["LABEL_FG"],
            selectbackground=t["ACCENT"], selectforeground="white",
            highlightthickness=0, width=24)
        auto_list.pack(side="left", fill="x", expand=True)
        auto_scroll = ttk.Scrollbar(auto_frame, orient="vertical", command=auto_list.yview)
        auto_scroll.pack(side="right", fill="y")
        auto_list.configure(yscrollcommand=auto_scroll.set)

        # Info labels
        form_var = tk.StringVar()
        lv_var = tk.StringVar()
        status_var = tk.StringVar()
        info = tk.Frame(card_frame, bg=t["CARD_BG"])
        info.pack(fill="x", pady=4)
        ttk.Label(info, textvariable=status_var, style="Sub.TLabel").pack(anchor="w")
        ttk.Label(info, textvariable=form_var, style="Sub.TLabel").pack(anchor="w")
        ttk.Label(info, textvariable=lv_var, style="Sub.TLabel").pack(anchor="w")

        # Stats table header
        sh = tk.Frame(card_frame, bg=t["CARD_BG"])
        sh.pack(fill="x", pady=(6, 2))
        ttk.Label(sh, text="Stat", width=5, style="BoldHeader.TLabel").pack(side="left")
        ttk.Label(sh, text="Final", width=8, style="BoldHeader.TLabel").pack(side="left")
        ttk.Label(sh, text="Base", width=8, style="BoldHeader.TLabel").pack(side="left")

        # Stat rows
        stat_widgets = {}
        for sk, sl in zip(["hp", "ds", "at", "ct", "ht", "de"],
                          ["HP", "DS", "AT", "CT(%)", "HT", "DE"]):
            row = tk.Frame(card_frame, bg=t["CARD_BG"])
            row.pack(fill="x")
            ttk.Label(row, text=sl, width=5, style="Cell.TLabel").pack(side="left")
            fv = tk.StringVar()
            bv = tk.StringVar()
            ttk.Label(row, textvariable=fv, width=8, style="Cell.TLabel").pack(side="left")
            ttk.Label(row, textvariable=bv, width=8, style="Cell.TLabel").pack(side="left")
            stat_widgets[sk] = (fv, bv)

        # card_data dict (used by closures below)
        card_data = {
            "frame": card_frame,
            "var": var,
            "entry": entry,
            "status_var": status_var,
            "form_var": form_var,
            "lv_var": lv_var,
            "stat_widgets": stat_widgets,
        }

        def _on_change(*_):
            typed = var.get().strip()
            if not typed:
                auto_frame.pack_forget()
                return
            matches = [n for n in DIGIMON_NAMES if typed.lower() in n.lower()]
            if not matches:
                auto_frame.pack_forget()
                return
            auto_list.delete(0, tk.END)
            for m in matches[:12]:
                auto_list.insert(tk.END, m)
            auto_frame.pack(fill="x")
            if auto_list.size() > 0:
                auto_list.selection_clear(0, tk.END)
                auto_list.activate(0)

        def _submit_search():
            typed = var.get().strip()
            auto_frame.pack_forget()
            if not typed:
                card_data["status_var"].set("")
                self._compare_clear_card(card_data)
                return
            card_data["status_var"].set("Buscando...")
            self._compare_search(card_data, typed)

        def _select():
            sel = auto_list.curselection()
            if sel:
                var.set(auto_list.get(sel[0]))
                entry.icursor(tk.END)
                entry.xview_moveto(1)
            elif auto_frame.winfo_ismapped() and auto_list.size() > 0:
                var.set(auto_list.get(0))
                entry.icursor(tk.END)
                entry.xview_moveto(1)
            _submit_search()

        tk.Button(entry_row, text="Buscar", command=_submit_search,
                  bg=t["ACCENT"], fg="white", bd=0, cursor="hand2",
                  font=("Segoe UI", 9, "bold"), padx=8, pady=2,
                  activebackground=t["ACCENT"], activeforeground="white").pack(side="left", padx=(6, 0))

        var.trace_add("write", _on_change)
        entry.bind("<Down>", lambda e: auto_list.focus_set() if auto_frame.winfo_ismapped() else None)
        entry.bind("<FocusOut>", lambda e: card_frame.after(300, auto_frame.pack_forget))
        entry.bind("<Return>", lambda e: _submit_search())
        auto_list.bind("<<ListboxSelect>>", lambda e: _select())
        auto_list.bind("<Return>", lambda e: _select())
        auto_list.bind("<Escape>", lambda e: auto_frame.pack_forget())
        auto_list.bind("<FocusOut>", lambda e: auto_frame.pack_forget())

        self.compare_cards.append(card_data)
        self._reflow_compare_cards()

        # Auto-search if name provided
        if digimon_name:
            self._compare_search(card_data, digimon_name)

        return card_data

    def _remove_comparison_card(self, card_frame):
        for i, cd in enumerate(self.compare_cards):
            if cd["frame"] == card_frame:
                cd["frame"].destroy()
                self.compare_cards.pop(i)
                break
        while len(self.compare_cards) < 2:
            self._add_comparison_card()
        self._reflow_compare_cards()

    def _reflow_compare_cards(self):
        for idx, cd in enumerate(self.compare_cards):
            frame = cd["frame"]
            row = idx // 2
            col = idx % 2
            frame.grid(row=row, column=col, padx=6, pady=4, sticky="nsew")

    def _compare_search(self, card, name):
        name = name.strip()
        if not name:
            self._compare_clear_card(card)
            return

        def task():
            data = search_digimon(name)
            self._ui_queue.put(lambda: self._compare_fill_card(card, data))

        threading.Thread(target=task, daemon=True).start()

    def _compare_clear_card(self, card):
        card["form_var"].set("")
        card["lv_var"].set("")
        for sk in ["hp", "ds", "at", "ct", "ht", "de"]:
            card["stat_widgets"][sk][0].set("")
            card["stat_widgets"][sk][1].set("")

    def _compare_fill_card(self, card, data):
        if not data:
            card["status_var"].set("Nao encontrado.")
            self._compare_clear_card(card)
            return

        form = data.get("form", "")
        lv = data.get("level_cap", "")
        source = data.get("_source", "")
        card["status_var"].set(f"Encontrado ({source})" if source else "Encontrado")
        card["form_var"].set(f"Form: {form}" if form else "")
        card["lv_var"].set(f"LvCap: {lv}" if lv else "")

        for sk in ["hp", "ds", "at", "ct", "ht", "de"]:
            final = data.get(sk, "")
            base = data.get(f"{sk}_base", "")
            card["stat_widgets"][sk][0].set(str(final) if final else "-")
            card["stat_widgets"][sk][1].set(str(base) if base else "-")

    def toggle_base_method(self):
        method = self.base_method.get()
        if method == "simples":
            self.nivel_frame.pack_forget()
            self.simple_frame.pack(fill="x")
        else:
            self.simple_frame.pack_forget()
            self.nivel_frame.pack(fill="x")
            self._recalc_nivel_final()

    # ===================== AUTOCOMPLETE =====================
    def _on_wiki_name_change(self, *args):
        typed = self.wiki_name_var.get().strip()
        if not typed:
            self._hide_wiki_suggestions()
            return
        matches = [n for n in DIGIMON_NAMES if typed.lower() in n.lower()]
        if not matches:
            self._hide_wiki_suggestions()
            return
        self.wiki_auto_listbox.delete(0, tk.END)
        for m in matches[:12]:
            self.wiki_auto_listbox.insert(tk.END, m)
        self.wiki_auto_frame.pack(fill="x", pady=(4, 0))
        if self.wiki_auto_listbox.size() > 0:
            self.wiki_auto_listbox.selection_clear(0, tk.END)
            self.wiki_auto_listbox.activate(0)

    def _select_wiki_suggestion(self, event=None):
        sel = self.wiki_auto_listbox.curselection()
        if sel:
            self.wiki_name_var.set(self.wiki_auto_listbox.get(sel[0]))
            self.wiki_name_entry.icursor(tk.END)
            self.wiki_name_entry.xview_moveto(1)
        self._hide_wiki_suggestions()

    def _hide_wiki_suggestions(self):
        self.wiki_auto_frame.pack_forget()

    def _add_to_autocomplete(self, name):
        if not self.wiki_auto_add_var.get():
            return
        name = name.strip()
        if not name:
            return
        if any(n.lower() == name.lower() for n in DIGIMON_NAMES):
            return
        DIGIMON_NAMES.append(name)
        DIGIMON_NAMES.sort(key=str.lower)
        try:
            with open(_save_list_path, "w", encoding="utf-8") as _f:
                json.dump({"digimon": DIGIMON_NAMES}, _f, ensure_ascii=False, indent=2)
        except Exception:
            pass

    # ===================== LISTA DE DIGIMONS =====================
    def build_list_ui(self, parent):
        t = self.theme
        cache = _load_cache()

        top = tk.Frame(parent, bg=t["BG"])
        top.pack(fill="x", pady=(0, 8))
        ttk.Label(top, text="Lista de Digimons", style="Header.TLabel").pack(side="left")

        cached_count = sum(1 for n in DIGIMON_NAMES if n in cache)
        total_count = len(DIGIMON_NAMES)
        self.list_status_label = ttk.Label(
            top, text=f"{cached_count}/{total_count} em cache",
            style="Sub.TLabel"
        )
        self.list_status_label.pack(side="left", padx=(12, 0))

        refresh_btn = tk.Button(
            top, text="⟳ Atualizar", command=self._refresh_list,
            bg=t["ACCENT"], fg="white", font=("Segoe UI", 9, "bold"),
            padx=10, pady=2, bd=0, cursor="hand2",
            activebackground=t["ACCENT"]
        )
        refresh_btn.pack(side="right")

        container = tk.Frame(parent, bg=t["BG"])
        container.pack(fill="both", expand=True)

        columns = ("form", "hp", "ds", "at", "ct", "ht", "de", "level_cap")
        headings = {
            "form": "Forma", "hp": "HP", "ds": "DS", "at": "AT",
            "ct": "CT(%)", "ht": "HT", "de": "DE", "level_cap": "Lv Cap"
        }

        all_columns = ("nome",) + columns
        all_headings = {"nome": "Nome", **headings}

        self.list_tree = ttk.Treeview(
            container, columns=all_columns, show="headings",
            height=30, selectmode="browse"
        )

        for col in all_columns:
            width = 200 if col == "nome" else (100 if col == "form" else 70)
            self.list_tree.column(col, width=width, anchor="center" if col != "nome" else "w")
            self.list_tree.heading(
                col, text=all_headings[col],
                command=lambda c=col: self._sort_treeview(c, False)
            )

        vsb = ttk.Scrollbar(container, orient="vertical", command=self.list_tree.yview)
        self.list_tree.configure(yscrollcommand=vsb.set)
        self.list_tree.pack(side="left", fill="both", expand=True)
        vsb.pack(side="right", fill="y")

        self.list_tree.tag_configure("uncached", foreground=t["SUB_FG"])
        self.list_tree.tag_configure("cached", foreground=t["LABEL_FG"])

        self._populate_list(cache)

        self._list_sort_col = None
        self._list_sort_rev = False

    def _populate_list(self, cache=None):
        if cache is None:
            cache = _load_cache()
        self.list_tree.delete(*self.list_tree.get_children())

        cached_names = []
        uncached_names = []
        for name in DIGIMON_NAMES:
            (cached_names if name in cache else uncached_names).append(name)

        for name in cached_names:
            d = cache[name]
            values = (
                name,
                d.get("form", "---"),
                d.get("hp", "---"),
                d.get("ds", "---"),
                d.get("at", "---"),
                d.get("ct", "---"),
                d.get("ht", "---"),
                d.get("de", "---"),
                str(d.get("level_cap", "---")),
            )
            self.list_tree.insert("", "end", text="", values=values, tags=("cached",))

        for name in uncached_names:
            values = (name,) + ("---",) * 8
            self.list_tree.insert("", "end", text="", values=values, tags=("uncached",))

        total = len(DIGIMON_NAMES)
        cached = len(cached_names)
        self.list_status_label.config(text=f"{cached}/{total} em cache")

    def _sort_treeview(self, col, reverse):
        items = []
        for item in self.list_tree.get_children(""):
            items.append((self.list_tree.set(item, col), item))

        def sort_key(val):
            s = val[0].strip().replace("%", "").replace(",", ".")
            try:
                return (1, float(s))
            except ValueError:
                return (0, s.lower())

        items.sort(key=sort_key, reverse=reverse)
        for index, (_, item) in enumerate(items):
            self.list_tree.move(item, "", index)

        self.list_tree.heading(col, command=lambda c=col: self._sort_treeview(c, not reverse))

    def _refresh_list(self):
        cache = _load_cache()
        self._populate_list(cache)

    # ===================== CALCULADORA REVERSA =====================
    def _toggle_reverso_mode(self):
        mode = self.rev_mode.get()
        if mode == "2p":
            self.rev_base_frame.pack_forget()
            self.rev_p2_frame.pack(fill="x", pady=2)
        else:
            self.rev_p2_frame.pack_forget()
            self.rev_base_frame.pack(fill="x", pady=2)

    def _recalc_nivel_final(self):
        try:
            level = int(self.n_lvl_var.get().strip())
        except ValueError:
            return
        if level < 1:
            return
        try:
            size = self.try_float(self.n_size_var.get())
        except ValueError:
            return
        evo_name = self.n_evo_var.get()
        evo_mult = 1.0
        for name, mult in EVO_OPTIONS:
            if name == evo_name:
                evo_mult = mult
                break
        for sk in STAT_KEYS:
            try:
                bv = self.try_float(self.n_base_vars[sk].get())
                gv = self.try_float(self.n_growth_vars[sk].get())
            except ValueError:
                continue
            stat_from_lv = gv * (level - 1) * evo_mult
            if sk == "ds":
                final = bv + stat_from_lv
            else:
                final = size * bv + stat_from_lv
            self.n_final_vars[sk].set(f"{final:.0f}" if abs(final - round(final)) < 0.0001 else f"{final:.2f}")

    def _calcular_reverso(self):
        sk_map = {"HP": "hp", "DS": "ds", "AT": "at", "CT (%)": "ct", "HT": "ht", "DE": "de"}
        stat_key = sk_map[self.rev_stat.get()]
        is_ds = stat_key == "ds"
        try:
            s1 = self.try_float(self.rev_s1.get())
            l1 = int(self.rev_l1.get().strip())
            t1 = self.try_float(self.rev_t1.get())
        except ValueError:
            self.rev_result.config(text="Valores invalidos no Ponto 1.")
            return
        if l1 < 1 or s1 <= 0:
            self.rev_result.config(text="Ponto 1: Level >= 1, Size > 0.")
            return

        evo_name = self.rev_evo.get()
        evo_mult = 1.0
        for n, m in EVO_OPTIONS:
            if n == evo_name:
                evo_mult = m
                break

        mode = self.rev_mode.get()

        if mode == "2p":
            try:
                s2 = self.try_float(self.rev_s2.get())
                l2 = int(self.rev_l2.get().strip())
                t2 = self.try_float(self.rev_t2.get())
            except ValueError:
                self.rev_result.config(text="Valores invalidos no Ponto 2.")
                return
            if l2 < 1 or s2 <= 0:
                self.rev_result.config(text="Ponto 2: Level >= 1, Size > 0.")
                return

            if is_ds:
                denom = evo_mult * (l2 - l1)
                if abs(denom) < 1e-12:
                    self.rev_result.config(text="Os dois pontos tem o mesmo level, nao da pra calcular.")
                    return
                growth_lv = (t2 - t1) / denom
                base_lv1 = t1 - growth_lv * (l1 - 1) * evo_mult
            else:
                denom = evo_mult * ((l2 - 1) - s2 / s1 * (l1 - 1))
                if abs(denom) < 1e-12:
                    self.rev_result.config(text="Os dois pontos sao equivalentes, nao da pra calcular.")
                    return
                growth_lv = (t2 - s2 / s1 * t1) / denom
                base_lv1 = (t1 - growth_lv * (l1 - 1) * evo_mult) / s1
        else:
            try:
                bv = self.try_float(self.rev_base.get())
            except ValueError:
                self.rev_result.config(text="Base Lv1 invalida.")
                return

            if is_ds:
                denom = evo_mult * (l1 - 1)
                if denom < 1e-12:
                    self.rev_result.config(text="Level 1 nao da pra calcular Growth (Level > 1 necessario).")
                    return
                growth_lv = (t1 - bv) / denom
                base_lv1 = bv
            else:
                denom = evo_mult * (l1 - 1)
                if denom < 1e-12:
                    self.rev_result.config(text="Level 1 nao da pra calcular Growth (Level > 1 necessario).")
                    return
                growth_lv = (t1 - s1 * bv) / denom
                base_lv1 = bv

        def fmt(v):
            if abs(v - round(v)) < 0.001:
                return f"{v:.0f}"
            return f"{v:.3f}"

        self.rev_result.config(
            text=f"Base Lv1 (Size 1.0): {fmt(base_lv1)}  |  Growth/Lv: {fmt(growth_lv)}"
        )

    def _open_html_folder(self):
        os.makedirs(MANUAL_HTML_DIR, exist_ok=True)
        os.startfile(MANUAL_HTML_DIR)

    def buscar_wiki(self):
        name = self.wiki_name_var.get().strip()
        if not name:
            messagebox.showinfo("Aviso", "Digite o nome do Digimon.")
            return
        self.wiki_btn.config(state="disabled")
        self.wiki_status.config(text="Buscando...")
        self.wiki_progress.pack(side="left", padx=(4, 0))
        self.wiki_progress.start()

        def task():
            data = search_digimon(name)
            self._ui_queue.put(lambda: self._wiki_result(data))

        threading.Thread(target=task, daemon=True).start()

    def _wiki_result(self, data):
        self.wiki_btn.config(state="normal")
        self.wiki_progress.stop()
        self.wiki_progress.pack_forget()
        name = self.wiki_name_var.get().strip()
        if name:
            self._add_to_autocomplete(name)
        if data is None:
            self.wiki_status.config(text="Nao encontrado. Salve o HTML em manual_html/ e tente de novo.")
            self.wiki_debug_frame.pack_forget()
            return
        self.wiki_status.config(text=f"OK! ({data.get('_source', '?')})")

        # Fill Simples → valor final (col 2), Nivel → base Lv1 (col 3)
        for sk in STAT_KEYS:
            raw = data.get(sk)
            if raw:
                val = raw.replace("%", "").strip() if sk == "ct" else raw
                if sk in self.s_base_vars:
                    self.s_base_vars[sk].set(val)

            raw_base = data.get(f"{sk}_base")
            if raw_base:
                val_base = raw_base.replace("%", "").strip() if sk == "ct" else raw_base
                if sk in self.n_base_vars:
                    self.n_base_vars[sk].set(val_base)
            elif raw:
                # Stats without base column (e.g. HT) — derive from final / 1.4
                val_num = self.try_float(raw.replace("%", "")) if sk == "ct" else self.try_float(raw)
                if val_num:
                    inferred_base = f"{val_num / WIKI_SIZE:.0f}"
                    if sk in self.n_base_vars:
                        self.n_base_vars[sk].set(inferred_base)

        form = data.get("form")
        mult = form_to_mult(form) if form else None
        level_cap = data.get("level_cap", 140)

        self.n_lvl_var.set(str(level_cap))
        if mult:
            for evo_name, evo_m in EVO_OPTIONS:
                if evo_m == mult:
                    self.n_evo_var.set(evo_name)
                    break

        # Calculate Growth/Lv from Max and Base
        if mult and level_cap > 1:
            for sk in STAT_KEYS:
                try:
                    max_val = data.get(sk)
                    base_val = data.get(f"{sk}_base")
                    if max_val and base_val:
                        max_num = self.try_float(max_val.replace("%", ""))
                        base_num = self.try_float(base_val.replace("%", ""))
                        if sk == "ds":
                            growth_per_lv = (max_num - base_num) / (level_cap - 1) / mult
                        else:
                            growth_per_lv = (max_num - WIKI_SIZE * base_num) / (level_cap - 1) / mult
                        if sk in self.n_growth_vars:
                            self.n_growth_vars[sk].set(f"{growth_per_lv:.3f}")
                    elif max_val and not base_val:
                        # Stats without base (e.g. HT) — no growth
                        if sk in self.n_growth_vars:
                            self.n_growth_vars[sk].set("0")
                except ValueError:
                    pass

        # Show debug data
        try:
            self.wiki_debug_text.configure(state="normal")
            self.wiki_debug_text.delete("1.0", tk.END)
            lines = []
            raw_rows = data.get("_raw_rows", [])
            if raw_rows:
                for ri, row in enumerate(raw_rows):
                    cols = " | ".join(f"{c:>10}" if i > 0 else f"{c:<10}" for i, c in enumerate(row))
                    lines.append(f"R{ri}  {cols}")
            lines.append("")
            lines.append(f"Fonte: {data.get('_source', '?')}")
            lines.append(f"Form: {data.get('form', '?')}")
            lines.append(f"Level Cap: {data.get('level_cap', '?')}")
            for sk in STAT_KEYS:
                fv = data.get(sk, "?")
                bv = data.get(f"{sk}_base", "?")
                lines.append(f"{sk.upper()}:  final={fv}  base={bv}")
            raw_html = data.get("_table_html", "")
            if raw_html:
                lines.append("")
                lines.append("--- HTML CRU (primeiros 500 chars) ---")
                lines.append(raw_html[:500])
            self.wiki_debug_text.insert("1.0", "\n".join(lines))
            self.wiki_debug_text.configure(state="disabled")
            self.wiki_debug_frame.pack(fill="x", pady=(6, 0))
        except Exception as e:
            self.wiki_status.config(text=f"Erro debug: {e}")

    def calcular(self):
        try:
            clone_lv = int(self.clone_lv_var.get())
        except ValueError:
            messagebox.showerror("Erro", "Selecione um Clone Level.")
            return
        _, a, c, _, _, h = CLONE_NUM[clone_lv]
        clone_mult = {"hp": 1 + h, "ds": 1.0, "at": 1 + a, "ct": 1 + c, "ht": 1.0, "de": 1.0}

        flat_totals = {sk: 0.0 for sk in STAT_KEYS}
        for cat in FLAT_CATEGORIES:
            for sk in STAT_KEYS:
                try:
                    flat_totals[sk] += self.try_float(self.flat_vars[cat][sk].get())
                except ValueError:
                    messagebox.showerror("Erro", f"Valor invalido em {cat} para {sk.upper()}.")
                    return

        method = self.base_method.get()
        self._gain_per_lv = {sk: 0.0 for sk in STAT_KEYS}

        if method == "simples":
            try:
                size = self.try_float(self.s_size_var.get())
            except ValueError:
                messagebox.showerror("Erro", "Size invalido.")
                return
            base_w_adic = {}
            for sk in STAT_KEYS:
                try:
                    bv = self.try_float(self.s_base_vars[sk].get())
                    av = self.try_float(self.s_adic_vars[sk].get())
                except ValueError:
                    messagebox.showerror("Erro", f"Valor invalido em {sk.upper()}.")
                    return
                if sk == "ds":
                    base_w_adic[sk] = bv + av
                else:
                    base_w_adic[sk] = size * bv + av
        else:
            try:
                level = int(self.n_lvl_var.get().strip())
            except ValueError:
                messagebox.showerror("Erro", "Level invalido.")
                return
            if level < 1:
                messagebox.showerror("Erro", "Level deve ser >= 1.")
                return
            try:
                size = self.try_float(self.n_size_var.get())
            except ValueError:
                messagebox.showerror("Erro", "Size invalido.")
                return
            evo_name = self.n_evo_var.get()
            evo_mult = 1.0
            for name, mult in EVO_OPTIONS:
                if name == evo_name:
                    evo_mult = mult
                    break
            base_w_adic = {}
            for sk in STAT_KEYS:
                try:
                    bv = self.try_float(self.n_base_vars[sk].get())
                    gv = self.try_float(self.n_growth_vars[sk].get())
                except ValueError:
                    messagebox.showerror("Erro", f"Valor invalido em {sk.upper()}.")
                    return
                stat_from_lv = gv * (level - 1) * evo_mult
                self._gain_per_lv[sk] = gv * evo_mult
                if sk == "ds":
                    base_w_adic[sk] = bv + stat_from_lv
                else:
                    base_w_adic[sk] = size * bv + stat_from_lv

        results = {}
        for sk in STAT_KEYS:
            bw = base_w_adic[sk]
            total = bw * clone_mult[sk] + flat_totals[sk]
            clone_add = bw * (clone_mult[sk] - 1)
            results[sk] = {"base": bw, "clone": clone_add, "flat": flat_totals[sk], "total": total}

        def fmt(v):
            if abs(v - round(v)) < 0.0001 and abs(v) < 1e12:
                return f"{v:.0f}"
            return f"{v:.2f}"

        for sk in STAT_KEYS:
            d = results[sk]
            per_lv = self._gain_per_lv[sk]
            per_lv_text = fmt(per_lv) if method == "nivel" and per_lv != 0 else "--"
            self.result_cells[sk][0].config(text=fmt(d["base"]))
            self.result_cells[sk][1].config(text=per_lv_text)
            self.result_cells[sk][2].config(text=f"x{clone_mult[sk]:.2f}")
            self.result_cells[sk][3].config(text=fmt(d["clone"]))
            self.result_cells[sk][4].config(text=fmt(d["flat"]))
            self.result_cells[sk][5].config(text=fmt(d["total"]))

        hp = results["hp"]["total"]
        ds = results["ds"]["total"]
        at = results["at"]["total"]
        ct = results["ct"]["total"]
        ht = results["ht"]["total"]
        de = results["de"]["total"]

        nome = self.s_nome_var.get().strip()
        prefix = f"{nome}: " if nome and self.base_method.get() == "simples" else ""
        self.total_line.config(
            text=f"{prefix}{fmt(hp)} HP | {fmt(ds)} DS | {fmt(at)} AT | {fmt(ct)}% CT | {fmt(ht)} HT | {fmt(de)} DE"
        )


if __name__ == "__main__":
    root = tk.Tk()
    app = CalculadoraDMO(root)
    root.mainloop()
