<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$name = isset($_GET['name']) ? trim($_GET['name']) : '';

if ($name === '' || $name === '_ping_') {
    http_response_code(400);
    echo json_encode(['error' => 'missing name']);
    exit;
}

// Load cache
$cachePath = __DIR__ . '/digimon_stats_cache.json';
$cache = [];
if (file_exists($cachePath)) {
    $raw = file_get_contents($cachePath);
    if ($raw !== false) {
        $cache = json_decode($raw, true);
        if (!is_array($cache)) $cache = [];
    }
}

// Search cache (exact match)
if (isset($cache[$name])) {
    $result = $cache[$name];
    $result['_source'] = 'cache';
    $result['_name'] = $name;
    echo json_encode($result, JSON_UNESCAPED_UNICODE);
    exit;
}

// Search cache (normalized match)
$normalizedName = strtolower(trim($name));
foreach ($cache as $k => $v) {
    if (strtolower($k) === $normalizedName) {
        $result = $v;
        $result['_source'] = 'cache';
        $result['_name'] = $name;
        echo json_encode($result, JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// Try dmowiki (with allow_url_fopen check)
if (function_exists('file_get_contents') && ini_get('allow_url_fopen')) {
    $pageName = str_replace(' ', '_', $name);
    $url = "https://dmowiki.com/" . urlencode($pageName);
    
    $ctx = stream_context_create([
        'http' => [
            'timeout' => 10,
            'user_agent' => 'Mozilla/5.0 (compatible)',
            'ignore_errors' => true,
        ],
    ]);
    
    $html = @file_get_contents($url, false, $ctx);
    if ($html !== false && strpos($html, 'Just a moment') === false) {
        // Simple parsing for wiki table
        if (preg_match('/Form:\s*<\/td>\s*<td[^>]*>(.*?)<\/td>/is', $html, $mForm)) {
            if (preg_match_all('/<tr>\s*<td[^>]*>.*?<\/td>\s*<td[^>]*>\s*(Health Points|Digi-Soul|Attack|Critical Hit|Hit Rate|Defense)\s*<\/td>\s*<td[^>]*>\s*(.*?)\s*<\/td>/is', $html, $mStats)) {
                $result = [
                    'form' => trim(strip_tags($mForm[1])),
                    'level_cap' => 140,
                ];
                if (preg_match('/level\s+(\d+)/i', $html, $mLv)) {
                    $result['level_cap'] = (int)$mLv[1];
                }
                
                $map = [
                    'health points' => 'hp',
                    'digi-soul' => 'ds',
                    'attack' => 'at',
                    'critical hit' => 'ct',
                    'hit rate' => 'ht',
                    'defense' => 'de',
                ];
                
                for ($i = 0; $i < count($mStats[1]); $i++) {
                    $label = strtolower(trim($mStats[1][$i]));
                    $value = trim(strip_tags($mStats[2][$i]));
                    if (isset($map[$label])) {
                        $result[$map[$label]] = $value;
                    }
                }
                
                // Validate
                $hasForm = !empty($result['form']);
                $hasHP = isset($result['hp']) && preg_match('/^\d+/', $result['hp']);
                
                if ($hasForm && $hasHP) {
                    $result['_source'] = 'dmowiki';
                    $result['_name'] = $name;
                    
                    // Save to cache
                    $cache[$name] = $result;
                    file_put_contents($cachePath, json_encode($cache, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                    
                    echo json_encode($result, JSON_UNESCAPED_UNICODE);
                    exit;
                }
            }
        }
    }
}

http_response_code(404);
echo json_encode(['error' => 'not found']);
