"""Busca online de Digimon usada pelo servidor web (web/server.py, rota /api/search).

Vem do antigo app desktop (py/calculadora_dmo.py), so que sem a interface Tkinter.
Ordem da busca: dmowiki ao vivo -> HTML salvo em manual_html/ -> cache JSON -> Wayback Machine.
O cache, digimon_list.json e manual_html/ ficam na raiz do projeto (a pasta acima de web/).
"""
import json
import os
import re
import threading
from datetime import datetime

import requests
from bs4 import BeautifulSoup

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

STAT_KEYS = ["hp", "ds", "at", "ct", "ht", "de"]

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

# Raiz do projeto: a pasta acima de web/ (no Docker, /app)
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_cache_path = os.path.join(ROOT_DIR, "digimon_stats_cache.json")
MANUAL_HTML_DIR = os.path.join(ROOT_DIR, "manual_html")

# Nomes conhecidos (digimon_list.json): ajudam a achar variacoes de grafia ao montar os nomes de pagina
DIGIMON_NAMES = []
try:
    with open(os.path.join(ROOT_DIR, "digimon_list.json"), encoding="utf-8") as _f:
        DIGIMON_NAMES = json.load(_f).get("digimon", [])
except Exception:
    pass

_cache_lock = threading.Lock()
_cache_dict = None


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
