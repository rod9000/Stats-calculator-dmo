import re
import sys
import tkinter as tk
from tkinter import ttk, messagebox
import requests
from bs4 import BeautifulSoup
import threading
import json
import os

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

EVO_OPTIONS = [
    ("Rookie", 1.0),
    ("Champion", 1.5),
    ("Ultimate / Armor", 1.85),
    ("Mega", 2.0),
    ("Burst Mode / Side Mega", 2.5),
    ("Jogress / Fusion", 3.0),
]

FLAT_CATEGORIES = [
    "Selos",
    "Chipset",
    "D-Unit",
    "Equipamentos",
    "Achievements",
    "Buff Tamer",
]

STAT_LABELS = ["HP", "DS", "AT", "CT (%)", "HT (%)", "DE"]
STAT_KEYS = ["hp", "ds", "at", "ct", "ht", "de"]

FORM_TO_MULT = {
    "Rookie": 1.0,
    "Champion": 1.5,
    "Ultimate": 1.85,
    "Armor": 1.85,
    "Spirit": 1.85,
    "Mega": 2.0,
    "Burst Mode": 2.5,
    "Variant": 2.5,
    "Jogress": 3.0,
}


def form_to_mult(form):
    if not form:
        return None
    if form in FORM_TO_MULT:
        return FORM_TO_MULT[form]
    for part in form.split("/"):
        part = part.strip()
        if part in FORM_TO_MULT:
            return FORM_TO_MULT[part]
        for word in part.split():
            if word in FORM_TO_MULT:
                return FORM_TO_MULT[word]
    return None


WAYBACK = "https://web.archive.org/web/2025/https://dmowiki.com"


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

    def val(row, col):
        rows = stat_table.find_all("tr")
        if row >= len(rows):
            return None
        tds = rows[row].find_all("td")
        if col >= len(tds):
            return None
        txt = tds[col].get_text(strip=True)
        return txt

    level_cap = 140
    m = re.search(r"level (\d+)", html)
    if m:
        level_cap = int(m.group(1))

    result = {"form": form, "level_cap": level_cap}
    rows_map = [("hp", 1), ("ds", 2), ("at", 3), ("ct", 5), ("ht", 8), ("de", 7)]
    for key, r in rows_map:
        result[key] = val(r, 2)
        result[f"{key}_growth"] = val(r, 3)

    return result


def search_digimon(name):
    clean = name.strip()
    parts = clean.replace(" ", "_").split("_")
    for i in range(len(parts), 0, -1):
        candidate = "_".join(parts[:i])
        url = f"{WAYBACK}/{candidate}"
        try:
            resp = requests.get(url, timeout=15)
        except requests.RequestException:
            continue
        if resp.status_code == 200:
            data = parse_wiki_table(resp.text)
            if data and data.get("hp"):
                return data
    return None


DIGIMON_NAMES = []
if getattr(sys, 'frozen', False):
    _base = sys._MEIPASS
else:
    _base = os.path.dirname(os.path.abspath(__file__))
_list_path = os.path.join(_base, "digimon_list.json")
_save_list_path = os.path.join(
    os.path.dirname(sys.executable) if getattr(sys, 'frozen', False) else _base,
    "digimon_list.json"
)
if os.path.exists(_list_path):
    try:
        with open(_list_path, encoding="utf-8") as _f:
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
    SIZE_DEFAULT = 1.4
    BG = "#f0f2f5"
    CARD_BG = "#ffffff"
    ACCENT = "#2b6ef0"
    SUCCESS = "#27ae60"
    LABEL_FG = "#1a1a2e"
    SUB_FG = "#555555"

    LIGHT_THEME = {
        "BG": "#f0f2f5",
        "CARD_BG": "#ffffff",
        "ACCENT": "#2b6ef0",
        "SUCCESS": "#27ae60",
        "LABEL_FG": "#1a1a2e",
        "SUB_FG": "#555555",
    }
    DARK_THEME = {
        "BG": "#1e1e2e",
        "CARD_BG": "#2d2d44",
        "ACCENT": "#6fa8ff",
        "SUCCESS": "#4caf50",
        "LABEL_FG": "#e0e0e0",
        "SUB_FG": "#aaaaaa",
    }

    def __init__(self, root):
        root.title("Digimon Master Online - Calculadora Final")
        root.resizable(False, False)
        root.configure(bg=self.BG)
        self.dark_mode = False

        style = ttk.Style()
        style.theme_use("clam")
        style.configure("TLabel", background=self.BG, foreground=self.LABEL_FG, font=("Segoe UI", 10))
        style.configure("TButton", font=("Segoe UI", 10, "bold"))
        style.configure("CardTitle.TLabel", background=self.CARD_BG, foreground=self.ACCENT,
                        font=("Segoe UI", 11, "bold"))
        style.configure("Header.TLabel", background=self.BG, foreground=self.ACCENT,
                        font=("Segoe UI", 14, "bold"))
        style.configure("Sub.TLabel", background=self.BG, foreground=self.SUB_FG, font=("Segoe UI", 9))
        style.configure("Cell.TLabel", background=self.CARD_BG, foreground=self.LABEL_FG,
                        font=("Segoe UI", 10), anchor="center")
        style.configure("Result.TLabel", background=self.CARD_BG, foreground=self.SUCCESS,
                        font=("Segoe UI", 10, "bold"), anchor="center")
        style.configure("Total.TLabel", background=self.BG, foreground=self.LABEL_FG,
                        font=("Segoe UI", 12, "bold"))
        style.configure("BoldHeader.TLabel", background=self.CARD_BG, foreground=self.LABEL_FG,
                        font=("Segoe UI", 10, "bold"), anchor="center")

        notebook = ttk.Notebook(root)
        notebook.pack(fill="both", expand=True)
        self.notebook = notebook

        tab1 = ttk.Frame(notebook, padding="8")
        tab2 = ttk.Frame(notebook, padding="8")
        notebook.add(tab1, text="Calculadora")
        notebook.add(tab2, text="Calculadora Reversa")

        # Tab 1: scrollable main calculator
        canvas = tk.Canvas(tab1, highlightthickness=0, bg=self.BG)
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

        # Tab 2: reverse calculator (no scroll needed)
        self.build_rev_ui(tab2)

        root.update_idletasks()
        cw = main.winfo_reqwidth() + 50
        ch = min(main.winfo_reqheight() + 50, root.winfo_screenheight() - 80)
        scrw = scrollbar.winfo_width() or 20
        root.geometry(f"{int(cw + scrw)}x{int(ch)}")

    def try_float(self, val):
        val = val.strip().replace(",", ".")
        if val == "":
            return 0.0
        return float(val)

    def _make_card(self, parent, title, row):
        card = tk.Frame(parent, bg=self.CARD_BG, bd=0, highlightthickness=0,
                        padx=14, pady=10)
        card.grid(row=row, column=0, columnspan=6, sticky="ew", pady=(0, 8))
        tk.Frame(card, bg=self.ACCENT, height=2).pack(fill="x", pady=(0, 6))
        ttk.Label(card, text=title, style="CardTitle.TLabel").pack(anchor="w")
        card._is_card = True
        return card

    def toggle_theme(self):
        self.dark_mode = not self.dark_mode
        theme = self.DARK_THEME if self.dark_mode else self.LIGHT_THEME
        self.BG = theme["BG"]
        self.CARD_BG = theme["CARD_BG"]
        self.ACCENT = theme["ACCENT"]
        self.SUCCESS = theme["SUCCESS"]
        self.LABEL_FG = theme["LABEL_FG"]
        self.SUB_FG = theme["SUB_FG"]

        style = ttk.Style()
        style.configure("TLabel", background=self.BG, foreground=self.LABEL_FG)
        style.configure("CardTitle.TLabel", background=self.CARD_BG, foreground=self.ACCENT)
        style.configure("Header.TLabel", background=self.BG, foreground=self.ACCENT)
        style.configure("Sub.TLabel", background=self.BG, foreground=self.SUB_FG)
        style.configure("Cell.TLabel", background=self.CARD_BG, foreground=self.LABEL_FG)
        style.configure("Result.TLabel", background=self.CARD_BG, foreground=self.SUCCESS)
        style.configure("Total.TLabel", background=self.BG, foreground=self.LABEL_FG)
        style.configure("BoldHeader.TLabel", background=self.CARD_BG, foreground=self.LABEL_FG)
        bg2 = theme["BG"]
        fg2 = theme["LABEL_FG"]
        style.configure("TNotebook", background=bg2, borderwidth=0)
        style.configure("TNotebook.Tab", background=bg2, foreground=fg2,
                        padding=[10, 4], font=("Segoe UI", 10))
        style.map("TNotebook.Tab",
                  background=[("selected", theme["CARD_BG"]), ("active", theme["ACCENT"])],
                  foreground=[("selected", theme["ACCENT"]), ("active", "white")])

        self._apply_theme(self.root)
        self.theme_btn.config(text="Modo Claro" if self.dark_mode else "Modo Escuro")

    def _apply_theme(self, widget):
        for child in widget.winfo_children():
            if isinstance(child, tk.Frame):
                is_card = getattr(child, "_is_card", False)
                child.configure(bg=self.CARD_BG if is_card else self.BG)
            elif isinstance(child, tk.Canvas):
                child.configure(bg=self.BG)
            elif isinstance(child, tk.Button):
                child.configure(bg=self.ACCENT, fg="white",
                                activebackground=self.ACCENT, activeforeground="white")
            elif isinstance(child, tk.Listbox):
                child.configure(bg=self.CARD_BG, fg=self.LABEL_FG,
                                selectbackground=self.ACCENT, selectforeground="white")
            self._apply_theme(child)

    def build_main_ui(self, parent):
        self.root = parent.winfo_toplevel()
        r = 0

        # ===================== HEADER =====================
        header_frame = tk.Frame(parent, bg=self.BG)
        header_frame.grid(row=r, column=0, columnspan=6, sticky="ew", pady=(0, 8))
        ttk.Label(header_frame, text="Calculadora de Stats", style="Header.TLabel").pack(anchor="w")
        ttk.Label(header_frame, text="Digimon Master Online", style="Sub.TLabel").pack(anchor="w")
        self.theme_btn = tk.Button(header_frame, text="Modo Escuro",
            command=self.toggle_theme, bg=self.ACCENT, fg="white",
            font=("Segoe UI", 9, "bold"), bd=0, cursor="hand2",
            padx=10, pady=2, activebackground=self.ACCENT)
        self.theme_btn.pack(side="right", padx=(10, 0))
        r += 1

        # ===================== BUSCAR NA WIKI =====================
        card_wiki = self._make_card(parent, "Buscar Digimon na DMO Wiki", r)
        r += 1

        wf = tk.Frame(card_wiki, bg=self.CARD_BG)
        wf.pack(fill="x")
        ttk.Label(wf, text="Nome:", style="TLabel").pack(side="left", padx=(0, 4))
        self.wiki_name_var = tk.StringVar()
        self.wiki_name_entry = ttk.Entry(wf, textvariable=self.wiki_name_var, width=24)
        self.wiki_name_entry.pack(side="left", padx=(0, 8))
        self.wiki_btn = ttk.Button(wf, text="Buscar", command=self.buscar_wiki)
        self.wiki_btn.pack(side="left", padx=(0, 8))
        self.wiki_status = ttk.Label(wf, text="", style="Sub.TLabel")
        self.wiki_status.pack(side="left")

        # Autocomplete frame
        self.wiki_auto_frame = tk.Frame(card_wiki, bg=self.CARD_BG)
        self.wiki_auto_listbox = tk.Listbox(self.wiki_auto_frame, height=6,
            font=("Segoe UI", 10), bd=1, relief="solid",
            bg=self.CARD_BG, fg=self.LABEL_FG,
            selectbackground=self.ACCENT, selectforeground="white",
            highlightthickness=0)
        self.wiki_auto_listbox.pack(fill="x", padx=(40, 0))
        self.wiki_auto_add_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(self.wiki_auto_frame, text="Adicionar ao autocomplete automaticamente",
                        variable=self.wiki_auto_add_var, style="TLabel").pack(anchor="w", padx=(40, 0), pady=(2, 0))

        self.wiki_name_var.trace_add("write", self._on_wiki_name_change)
        self.wiki_name_entry.bind("<Down>", lambda e: self.wiki_auto_listbox.focus_set() if self.wiki_auto_frame.winfo_ismapped() else None)
        self.wiki_name_entry.bind("<FocusOut>", lambda e: self.root.after(200, self._hide_wiki_suggestions))
        self.wiki_auto_listbox.bind("<<ListboxSelect>>", self._select_wiki_suggestion)
        self.wiki_auto_listbox.bind("<Return>", self._select_wiki_suggestion)
        self.wiki_auto_listbox.bind("<Escape>", lambda e: self._hide_wiki_suggestions())
        self.wiki_auto_listbox.bind("<FocusOut>", lambda e: self._hide_wiki_suggestions())

        # ===================== BASE STAT =====================
        card_base = self._make_card(parent, "Base Stat", r)
        r += 1

        method_frame = tk.Frame(card_base, bg=self.CARD_BG)
        method_frame.pack(fill="x", pady=(0, 8))
        self.base_method = tk.StringVar(value="simples")
        ttk.Radiobutton(method_frame, text="Simples (Size x Base + Adicional)",
                        variable=self.base_method, value="simples",
                        command=self.toggle_base_method).pack(side="left", padx=(0, 20))
        ttk.Radiobutton(method_frame, text="Por Nivel (Lv, Evo, Growth)",
                        variable=self.base_method, value="nivel",
                        command=self.toggle_base_method).pack(side="left")

        # -- Simple --
        self.simple_frame = tk.Frame(card_base, bg=self.CARD_BG)
        self.simple_frame.pack(fill="x")

        top_row = tk.Frame(self.simple_frame, bg=self.CARD_BG)
        top_row.pack(fill="x", pady=(0, 6))
        ttk.Label(top_row, text="Size:", style="TLabel").pack(side="left", padx=(0, 4))
        self.s_size_var = tk.StringVar(value=str(self.SIZE_DEFAULT))
        ttk.Entry(top_row, textvariable=self.s_size_var, width=8).pack(side="left", padx=(0, 20))

        ttk.Label(top_row, text="Nome:", style="TLabel").pack(side="left", padx=(0, 4))
        self.s_nome_var = tk.StringVar()
        ttk.Entry(top_row, textvariable=self.s_nome_var, width=20).pack(side="left")

        tbl = tk.Frame(self.simple_frame, bg=self.CARD_BG)
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
        self.nivel_frame = tk.Frame(card_base, bg=self.CARD_BG)
        self.nivel_frame.pack(fill="x")

        top_row_n = tk.Frame(self.nivel_frame, bg=self.CARD_BG)
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

        tbl_n = tk.Frame(self.nivel_frame, bg=self.CARD_BG)
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
        r += 1

        cf = tk.Frame(card_clone, bg=self.CARD_BG)
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
        r += 1

        hdr = tk.Frame(card_flat, bg=self.CARD_BG)
        hdr.pack(fill="x", pady=(0, 2))
        ttk.Label(hdr, text="Fonte", style="BoldHeader.TLabel", width=14).grid(row=0, column=0, padx=2)
        for si, sl in enumerate(STAT_LABELS):
            ttk.Label(hdr, text=sl, style="BoldHeader.TLabel", width=10).grid(row=0, column=1 + si, padx=2)
        tk.Frame(card_flat, bg="#ddd", height=1).pack(fill="x", pady=2)

        self.flat_vars = {}
        for cat in FLAT_CATEGORIES:
            row_f = tk.Frame(card_flat, bg=self.CARD_BG)
            row_f.pack(fill="x", pady=1)
            ttk.Label(row_f, text=cat, style="TLabel", width=14).grid(row=0, column=0, padx=2)
            cat_vars = {}
            for si, sk in enumerate(STAT_KEYS):
                v = tk.StringVar()
                ttk.Entry(row_f, textvariable=v, width=10).grid(row=0, column=1 + si, padx=2)
                cat_vars[sk] = v
            self.flat_vars[cat] = cat_vars

        # ===================== CALCULATE =====================
        btn_frame = tk.Frame(parent, bg=self.BG)
        btn_frame.grid(row=r, column=0, columnspan=6, pady=(4, 8))
        tk.Button(btn_frame, text="Calcular", command=self.calcular,
                  bg=self.ACCENT, fg="white", font=("Segoe UI", 11, "bold"),
                  padx=32, pady=6, bd=0, cursor="hand2",
                  activebackground=self.ACCENT).pack()
        r += 1

        # ===================== RESULTS =====================
        card_res = self._make_card(parent, "Resultado Final", r)
        r += 1

        res_tbl = tk.Frame(card_res, bg=self.CARD_BG)
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
        r += 1

    def build_rev_ui(self, parent):
        r = 0

        card_rev = self._make_card(parent, "Calculadora Reversa / Verificador", r)
        r += 1

        # Mode
        mf = tk.Frame(card_rev, bg=self.CARD_BG)
        mf.pack(fill="x", pady=(0, 6))
        self.rev_mode = tk.StringVar(value="2p")
        ttk.Radiobutton(mf, text="Descobridor (2 pontos)",
                        variable=self.rev_mode, value="2p",
                        command=self._toggle_reverso_mode).pack(side="left", padx=(0, 15))
        ttk.Radiobutton(mf, text="Verificador (1 ponto + Base)",
                        variable=self.rev_mode, value="1p",
                        command=self._toggle_reverso_mode).pack(side="left")

        rf1 = tk.Frame(card_rev, bg=self.CARD_BG)
        rf1.pack(fill="x", pady=2)
        ttk.Label(rf1, text="Stat:", style="TLabel").pack(side="left", padx=(0, 4))
        self.rev_stat = tk.StringVar(value="AT")
        ttk.Combobox(rf1, textvariable=self.rev_stat,
                     values=["HP", "DS", "AT", "CT (%)", "HT (%)", "DE"],
                     width=10, state="readonly").pack(side="left", padx=(0, 16))
        ttk.Label(rf1, text="Evo:", style="TLabel").pack(side="left", padx=(0, 4))
        self.rev_evo = tk.StringVar()
        rev_evo_cmb = ttk.Combobox(rf1, textvariable=self.rev_evo,
                                    values=[n for n, _ in EVO_OPTIONS],
                                    width=18, state="readonly")
        rev_evo_cmb.pack(side="left")
        rev_evo_cmb.current(3)

        # Ponto 1
        p1f = tk.Frame(card_rev, bg=self.CARD_BG)
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
        self.rev_p2_frame = tk.Frame(card_rev, bg=self.CARD_BG)
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
        self.rev_base_frame = tk.Frame(card_rev, bg=self.CARD_BG)
        ttk.Label(self.rev_base_frame, text="Base Lv1 (Size 1.0):", style="TLabel").pack(side="left", padx=(0, 4))
        self.rev_base = tk.StringVar()
        ttk.Entry(self.rev_base_frame, textvariable=self.rev_base, width=10).pack(side="left")

        # Button
        btf = tk.Frame(card_rev, bg=self.CARD_BG)
        btf.pack(fill="x", pady=(6, 2))
        tk.Button(btf, text="Calcular Reverso", command=self._calcular_reverso,
                  bg=self.ACCENT, fg="white", font=("Segoe UI", 10, "bold"),
                  padx=20, pady=4, bd=0, cursor="hand2",
                  activebackground=self.ACCENT).pack(side="left", padx=(0, 12))
        self.rev_result = ttk.Label(btf, text="", style="Sub.TLabel")
        self.rev_result.pack(side="left")

        self._toggle_reverso_mode()

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
        sk_map = {"HP": "hp", "DS": "ds", "AT": "at", "CT (%)": "ct", "HT (%)": "ht", "DE": "de"}
        stat_key = sk_map[self.rev_stat.get()]
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

    def buscar_wiki(self):
        name = self.wiki_name_var.get().strip()
        if not name:
            messagebox.showinfo("Aviso", "Digite o nome do Digimon.")
            return
        self.wiki_btn.config(state="disabled")
        self.wiki_status.config(text="Buscando...")

        def task():
            data = search_digimon(name)
            root = self.wiki_btn.winfo_toplevel()
            root.after(0, lambda: self._wiki_result(data))

        threading.Thread(target=task, daemon=True).start()

    def _wiki_result(self, data):
        self.wiki_btn.config(state="normal")
        name = self.wiki_name_var.get().strip()
        if name:
            self._add_to_autocomplete(name)
        if data is None:
            self.wiki_status.config(text="Nao encontrado ou erro na requisicao.")
            return
        self.wiki_status.config(text="OK! Preenchido.")

        for sk in STAT_KEYS:
            raw = data.get(sk)
            if raw:
                if sk in ("ct", "ht"):
                    raw = raw.replace("%", "").strip()
                if sk in self.s_base_vars:
                    self.s_base_vars[sk].set(raw)
                if sk in self.n_base_vars:
                    self.n_base_vars[sk].set(raw)

        form = data.get("form")
        mult = form_to_mult(form) if form else None
        level_cap = data.get("level_cap", 140)

        self.n_lvl_var.set(str(level_cap))
        if mult:
            for evo_name, evo_m in EVO_OPTIONS:
                if evo_m == mult:
                    self.n_evo_var.set(evo_name)
                    break

        if mult and level_cap > 1:
            for sk in STAT_KEYS:
                raw_growth = data.get(f"{sk}_growth")
                if raw_growth:
                    try:
                        val_growth = self.try_float(raw_growth.replace("%", ""))
                        growth_per_lv = val_growth / (level_cap - 1) / mult
                        if sk in self.n_growth_vars:
                            self.n_growth_vars[sk].set(f"{growth_per_lv:.3f}")
                    except ValueError:
                        pass

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
            text=f"{prefix}{fmt(hp)} HP | {fmt(ds)} DS | {fmt(at)} AT | {fmt(ct)}% CT | {fmt(ht)}% HT | {fmt(de)} DE"
        )


if __name__ == "__main__":
    root = tk.Tk()
    app = CalculadoraDMO(root)
    root.mainloop()
