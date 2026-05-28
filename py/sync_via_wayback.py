import sys
import time
import requests

sys.stdout.reconfigure(encoding="utf-8")

from calculadora_dmo import (
    DIGIMON_NAMES, _load_cache, _save_cache,
    parse_wiki_table, _validate_parsed_data,
    _cache_path,
)

CDX_API = "https://web.archive.org/cdx/search/cdx"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36"
SESSION = requests.Session()
SESSION.headers.update({"User-Agent": UA})


def _candidate_names(name):
    base = name.replace(" ", "_")
    seen = set()
    out = []
    for v in [base, name.replace(":", "").replace("'", "").replace(" ", "_")]:
        if v not in seen:
            seen.add(v)
            out.append(v)
    return out


def _query_cdx(url):
    try:
        resp = SESSION.get(
            CDX_API,
            params={"url": url, "output": "json", "limit": 50, "fl": "original,timestamp,statuscode"},
            timeout=20,
        )
        if resp.status_code != 200:
            return []
        rows = resp.json()
        if not rows or len(rows) < 2:
            return []
        snapshots = []
        for row in rows[1:]:
            snapshots.append({
                "timestamp": row[1],
                "original": row[0],
                "statuscode": row[2],
                "year": int(row[1][:4]),
            })
        snapshots.sort(key=lambda x: x["timestamp"], reverse=True)
        return snapshots
    except Exception:
        return []


def _fetch_snapshot(ts, original):
    url = f"https://web.archive.org/web/{ts}/{original}"
    try:
        resp = SESSION.get(url, timeout=30)
        if resp.status_code == 200 and "Just a moment" not in resp.text:
            return resp.text
    except Exception:
        pass
    return None


def sync_all():
    cache = _load_cache()
    names = list(DIGIMON_NAMES)
    missing = [n for n in names if n not in cache]

    total = len(names)
    cached_count = total - len(missing)
    print(f"Total: {total}  |  Em cache: {cached_count}  |  Faltam: {len(missing)}\n")

    if not missing:
        print("Nenhum digimon faltando!")
        return

    found = errors = skipped = 0
    start = time.time()

    for idx, name in enumerate(missing, 1):
        if name in _load_cache():
            skipped += 1
            _status(idx, len(missing), name, "cache", start)
            continue

        cand_names = _candidate_names(name)
        all_snaps = []

        for cname in cand_names:
            url = f"https://dmowiki.com/{cname}"
            snaps = _query_cdx(url)
            snaps = [s for s in snaps if s["statuscode"] == "200"]
            all_snaps.extend(snaps)

        all_snaps.sort(key=lambda x: x["timestamp"], reverse=True)

        if not all_snaps:
            errors += 1
            _status(idx, len(missing), name, "SEM SNAP", start)
            continue

        # Try snapshots newest -> oldest until one parses
        data = None
        used_snap = None
        for snap in all_snaps:
            html = _fetch_snapshot(snap["timestamp"], snap["original"])
            if not html:
                continue
            parsed = parse_wiki_table(html)
            data = _validate_parsed_data(parsed)
            if data:
                used_snap = snap
                break

        if not data:
            errors += 1
            _status(idx, len(missing), name, "PARSE", start)
            continue

        data["_source"] = f"Wayback-{used_snap['year']}"
        data["_name"] = name
        _save_cache(data)
        found += 1
        _status(idx, len(missing), name, f"OK({used_snap['year']})", start)

    elapsed = time.time() - start
    print(f"\n\n--- Concluido ({elapsed:.0f}s) ---")
    print(f"Encontrados: {found}  |  Falhas: {errors}  |  Pulados: {skipped}")
    print(f"Cache: {_cache_path}")

    still_missing = [n for n in missing if n not in _load_cache()]
    if still_missing:
        print(f"\nAinda faltam {len(still_missing)}:")
        for n in still_missing:
            print(f"  - {n}")


def _status(idx, total, name, status, start):
    pct = idx / total * 100
    elapsed = time.time() - start
    eta = (elapsed / idx) * (total - idx) if idx > 0 else 0
    sys.stdout.write(f"\r[{idx:>4}/{total:<4} {pct:>5.1f}%] {status:<10} {name:<30} ETA: {eta:.0f}s")
    sys.stdout.flush()


if __name__ == "__main__":
    sync_all()
