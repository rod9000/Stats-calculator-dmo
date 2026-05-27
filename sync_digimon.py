import sys
import time

from calculadora_dmo import DIGIMON_NAMES, search_digimon, _load_cache, _cache_path


def sync_all():
    names = DIGIMON_NAMES
    total = len(names)
    print(f"Sincronizando {total} digimons...")
    print(f"Cache: {_cache_path}\n")

    cache = _load_cache()
    found = 0
    errors = 0
    skipped = 0
    start = time.time()

    for idx, name in enumerate(names, 1):
        if name in cache:
            skipped += 1
            _print_status(idx, total, name, "cache", start)
            continue

        data = search_digimon(name)
        if data:
            found += 1
            cache[name] = data
            _print_status(idx, total, name, "OK", start)
        else:
            errors += 1
            _print_status(idx, total, name, "FALHA", start)

        if idx % 5 == 0:
            sys.stdout.write("\n")
            sys.stdout.flush()

        time.sleep(1)

    elapsed = time.time() - start
    print(f"\n\n--- Concluido ({elapsed:.0f}s) ---")
    print(f"Total: {total}  |  Encontrados: {found}  |  Falhas: {errors}  |  Ja tinham: {skipped}")
    print(f"Cache: {_cache_path}")


def _print_status(idx, total, name, status, start):
    pct = idx / total * 100
    elapsed = time.time() - start
    eta = (elapsed / idx) * (total - idx) if idx > 0 else 0
    sys.stdout.write(f"\r[{idx:>4}/{total:<4} {pct:>5.1f}%] {status:<6} {name:<30} ETA: {eta:.0f}s")
    sys.stdout.flush()


if __name__ == "__main__":
    sync_all()
