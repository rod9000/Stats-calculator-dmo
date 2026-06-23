<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$name = isset($_GET['name']) ? trim($_GET['name']) : '';

if ($name === '' || $name === '_ping_') {
    http_response_code(400);
    echo json_encode(['error' => 'missing name']);
    exit;
}

$cacheDir = __DIR__ . '/cache';
if (!is_dir($cacheDir)) {
    mkdir($cacheDir, 0755, true);
}

function normalizeName($n) {
    $n = preg_replace('/\s+/', ' ', strtolower(trim($n)));
    $n = str_replace('_', ' ', $n);
    $n = preg_replace('/[\'":]/', '', $n);
    $n = str_replace(['(', ')'], ' ', $n);
    return preg_replace('/\s+/', ' ', trim($n));
}

function loadCache() {
    $path = __DIR__ . '/digimon_stats_cache.json';
    if (file_exists($path)) {
        $data = json_decode(file_get_contents($path), true);
        if (is_array($data)) return $data;
    }
    return [];
}

function saveCache($name, $data) {
    $path = __DIR__ . '/digimon_stats_cache.json';
    $cache = loadCache();
    $entry = array_filter($data, function($k) { return strpos($k, '_') !== 0; }, ARRAY_FILTER_USE_KEY);
    $entry['_cached_at'] = date('c');
    $cache[$name] = $entry;
    file_put_contents($path, json_encode($cache, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function loadNameAliases() {
    return [
        'alphamon ouryouken x extreme' => 'Alphamon Ouryuken (Extreme)',
        'alphamon ouryuken x extreme' => 'Alphamon Ouryuken (Extreme)',
        'alphamon ouryouken extreme' => 'Alphamon Ouryuken (Extreme)',
        'alphamon ouryuken extreme' => 'Alphamon Ouryuken (Extreme)',
        'alphamon ouryouken awaken' => 'Alphamon Ouryuken (Awaken)',
        'alphamon ouryuken awaken' => 'Alphamon Ouryuken (Awaken)',
    ];
}

function getCandidateNames($clean) {
    $candidates = [];
    $seen = [];
    $normalized = normalizeName($clean);

    $add = function($v) use (&$candidates, &$seen) {
        $v = trim($v);
        $k = strtolower($v);
        if ($v && !isset($seen[$k])) {
            $seen[$k] = true;
            $candidates[] = $v;
        }
    };

    $add($clean);
    $aliases = loadNameAliases();
    if (isset($aliases[$normalized])) $add($aliases[$normalized]);

    $variants = [
        str_replace('Ouryouken', 'Ouryuken', $clean),
        str_replace('ouryouken', 'ouryuken', $clean),
        str_replace(' X Extreme', ' (Extreme)', $clean),
        str_replace(' x extreme', ' (Extreme)', $clean),
        str_replace(' Extreme', ' (Extreme)', $clean),
        str_replace(' Awaken', ' (Awaken)', $clean),
    ];
    foreach ($variants as $v) {
        if ($v !== $clean) {
            $add($v);
            $nk = normalizeName($v);
            if (isset($aliases[$nk])) $add($aliases[$nk]);
        }
    }

    return $candidates;
}

function normalizeStatText($value, $percent = false) {
    if ($value === null) return null;
    $text = str_replace("\xC2\xA0", ' ', trim($value));
    if ($text === '') return null;
    $text = preg_replace('/\s+/', '', $text);
    if ($percent) {
        if (strpos($text, '%') === false) return null;
        $text = str_replace('%', '', $text);
        if ($text === '') return null;
        if (strpos($text, ',') !== false && strpos($text, '.') !== false) {
            $text = str_replace(',', '', $text);
        } elseif (strpos($text, ',') !== false) {
            $text = str_replace(',', '.', $text);
        }
        return $text . '%';
    }
    if (strpos($text, ',') !== false && strpos($text, '.') !== false) {
        $text = str_replace(',', '', $text);
    } elseif (strpos($text, ',') !== false) {
        $text = str_replace(',', '', $text);
    }
    return $text;
}

function isValidStat($key, $value) {
    if ($value === null) return $key === 'ht_base';
    if (in_array($key, ['ct', 'ct_base'])) {
        return (bool) preg_match('/^\d+(?:\.\d+)?%$/', $value);
    }
    return (bool) preg_match('/^\d+(?:\.\d+)?$/', $value);
}

function parseWikiTable($html) {
    $doc = new DOMDocument();
    @$doc->loadHTML('<?xml encoding="UTF-8">' . $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD | LIBXML_NOERROR);
    $xpath = new DOMXPath($doc);

    $form = null;
    $tables = $xpath->query('//table[contains(@class, "wikitable")]');
    if ($tables->length > 0) {
        $rows = $xpath->query('.//tr', $tables->item(0));
        foreach ($rows as $tr) {
            $tds = $xpath->query('.//td', $tr);
            if ($tds->length >= 2) {
                $label = trim($tds->item(0)->textContent);
                if (strpos($label, 'Form:') !== false) {
                    $form = trim($tds->item(1)->textContent);
                    break;
                }
            }
        }
    }

    $statTable = null;
    foreach ($tables as $t) {
        $th = $xpath->query('.//th', $t);
        for ($i = 0; $i < $th->length; $i++) {
            if (strpos($th->item($i)->textContent, 'Digimon Stats') !== false) {
                $statTable = $t;
                break 2;
            }
        }
    }

    if ($statTable === null) {
        return $form ? ['form' => $form] : null;
    }

    $levelCap = 140;
    if (preg_match('/level\s+(\d+)/i', $html, $m)) {
        $levelCap = (int) $m[1];
    }

    $wikiRowMap = [
        'health points' => 'hp',
        'digi-soul' => 'ds',
        'attack' => 'at',
        'critical hit' => 'ct',
        'hit rate' => 'ht',
        'defense' => 'de',
    ];

    $result = ['form' => $form, 'level_cap' => $levelCap];
    $rows = $xpath->query('.//tr', $statTable);
    foreach ($rows as $tr) {
        $cells = $xpath->query('.//td|.//th', $tr);
        if ($cells->length < 3) continue;
        $label = strtolower(trim($cells->item(1)->textContent));
        $key = $wikiRowMap[$label] ?? null;
        if (!$key) continue;
        $result[$key] = trim($cells->item(2)->textContent);
        if ($cells->length > 3) {
            $result[$key . '_base'] = trim($cells->item(3)->textContent);
        } else {
            $result[$key . '_base'] = null;
        }
    }

    return $result;
}

function validateData($data) {
    if (!$data || empty($data['form']) || empty($data['level_cap'])) return null;
    $statKeys = ['hp', 'ds', 'at', 'ct', 'ht', 'de'];
    foreach ($statKeys as $sk) {
        $pct = ($sk === 'ct');
        $norm = normalizeStatText($data[$sk] ?? null, $pct);
        if (!isValidStat($sk, $norm)) return null;
        $data[$sk] = $norm;
        $baseKey = $sk . '_base';
        $normBase = normalizeStatText($data[$baseKey] ?? null, $pct);
        $data[$baseKey] = isValidStat($baseKey, $normBase) ? $normBase : null;
    }
    return $data;
}

function fetchUrl($url) {
    $ctx = stream_context_create([
        'http' => [
            'timeout' => 15,
            'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            'header' => "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8\r\nAccept-Language: pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7\r\n",
        ],
    ]);
    $content = @file_get_contents($url, false, $ctx);
    if ($content === false) return null;
    if (strpos($content, 'Just a moment') !== false || strpos($content, 'challenges.cloudflare.com') !== false) {
        return null;
    }
    return $content;
}

function searchDmowiki($name, $candidates) {
    foreach ($candidates as $candidate) {
        $pageName = str_replace(' ', '_', $candidate);
        $url = "https://dmowiki.com/$pageName";
        $html = fetchUrl($url);
        if ($html) {
            $data = validateData(parseWikiTable($html));
            if ($data) {
                $data['_source'] = 'dmowiki';
                $data['_name'] = $name;
                saveCache($name, $data);
                return $data;
            }
        }
    }
    return null;
}

function searchWayback($name, $candidates) {
    $snapYears = ['2026id_', '2025id_', '2024id_', '2023id_'];
    foreach ($candidates as $candidate) {
        $pageName = str_replace(' ', '_', $candidate);
        foreach ($snapYears as $snap) {
            $url = "https://web.archive.org/web/{$snap}/https://dmowiki.com/{$pageName}";
            $html = fetchUrl($url);
            if ($html) {
                $data = validateData(parseWikiTable($html));
                if ($data) {
                    $data['_source'] = "Wayback-{$snap}";
                    $data['_name'] = $name;
                    saveCache($name, $data);
                    return $data;
                }
            }
        }
    }
    return null;
}

function searchCache($name, $candidates) {
    $cache = loadCache();
    foreach ($candidates as $candidate) {
        if (isset($cache[$candidate])) {
            $data = validateData($cache[$candidate]);
            if ($data) {
                $data['_source'] = 'cache';
                $data['_name'] = $name;
                return $data;
            }
        }
        $normalized = normalizeName($candidate);
        foreach ($cache as $k => $v) {
            if (normalizeName($k) === $normalized) {
                $data = validateData($v);
                if ($data) {
                    $data['_source'] = 'cache';
                    $data['_name'] = $name;
                    return $data;
                }
                break;
            }
        }
    }
    return null;
}

$candidates = getCandidateNames($name);

$result = searchCache($name, $candidates);
if (!$result) $result = searchDmowiki($name, $candidates);
if (!$result) $result = searchWayback($name, $candidates);

if ($result) {
    echo json_encode($result, JSON_UNESCAPED_UNICODE);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'not found']);
}
