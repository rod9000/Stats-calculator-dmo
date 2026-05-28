import sys
import os
import json
import time
import webbrowser

sys.stdout.reconfigure(encoding="utf-8")

# Reuse paths from the main app
from calculadora_dmo import (
    _load_cache, _save_cache, _cache_path, parse_wiki_table,
    MANUAL_HTML_DIR, DIGIMON_NAMES
)


def main():
    # Ensure manual_html folder exists
    os.makedirs(MANUAL_HTML_DIR, exist_ok=True)

    # Load cache
    cache = _load_cache()
    total = len(DIGIMON_NAMES)
    cached = sum(1 for n in DIGIMON_NAMES if n in cache)

    print(f"Total de digimons: {total}")
    print(f"Ja em cache: {cached}")
    print(f"Faltando: {total - cached}")
    print(f"Pasta HTML manual: {MANUAL_HTML_DIR}")
    print("-" * 50)

    if cached == total:
        print("Todos os digimons ja estao em cache!")
        return

    missing = [n for n in DIGIMON_NAMES if n not in cache]
    print(f"\nFaltam {len(missing)} digimons. Vou abrir as paginas uma por uma no navegador.")
    print("Para cada pagina: salve como HTML (Ctrl+S) na pasta:")
    print(f"  {MANUAL_HTML_DIR}")
    print("Depois volte aqui e pressione Enter para continuar.\n")

    for idx, name in enumerate(missing, 1):
        url_name = name.replace(" ", "_")
        url = f"https://dmowiki.com/{url_name}"

        print(f"\n[{idx}/{len(missing)}] {name}")
        print(f"  URL: {url}")
        webbrowser.open(url)

        input("  Pressione Enter apos salvar o HTML... ")

        # Try to find the saved file
        found = False
        for fname in os.listdir(MANUAL_HTML_DIR):
            if fname.lower().endswith(".html"):
                base = os.path.splitext(fname)[0].replace("_", " ")
                if base.lower() == name.lower():
                    path = os.path.join(MANUAL_HTML_DIR, fname)
                    try:
                        with open(path, "r", encoding="utf-8") as f:
                            html = f.read()
                        data = parse_wiki_table(html)
                        if data and data.get("hp"):
                            data["_source"] = "manual_html"
                            data["_name"] = name
                            _save_cache(data)
                            print(f"  -> SALVO no cache!")
                            found = True
                        else:
                            print(f"  -> Arquivo encontrado mas sem dados validos")
                    except Exception as e:
                        print(f"  -> Erro ao ler: {e}")
                    break

        if not found:
            print(f"  -> Nao encontrei o arquivo. Salve como '{name}.html' na pasta e rode novamente.")

    print("\nConcluido!")
    print(f"Agora {cached + len(missing)} digimons estao no cache.")
    print(f"Cache: {_cache_path}")


if __name__ == "__main__":
    main()
