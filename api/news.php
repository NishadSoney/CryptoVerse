<?php
/**
 * CryptoVerse - Live News API Endpoint
 * Fetches and parses a public RSS feed (CoinDesk) and returns JSON.
 * Location: api/news.php
 */

declare(strict_types=1);

header('Content-Type: application/json');

// Cache handling for rate limits (cache for 10 minutes)
$cache_file = __DIR__ . '/../scratch/news_cache.json';
if (!file_exists(__DIR__ . '/../scratch')) {
    mkdir(__DIR__ . '/../scratch', 0777, true);
}

if (file_exists($cache_file) && (time() - filemtime($cache_file)) < 600) {
    // Serve from cache
    echo file_get_contents($cache_file);
    exit;
}

// Fetch RSS feeds
$feeds = [
    ['url' => 'https://www.coindesk.com/arc/outboundfeeds/rss/', 'source' => 'CoinDesk'],
    ['url' => 'https://cointelegraph.com/rss', 'source' => 'Cointelegraph']
];

$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => "User-Agent: CryptoVerse/1.0\r\n"
    ]
]);

$articles = [];

foreach ($feeds as $feed) {
    $rss_content = @file_get_contents($feed['url'], false, $context);
    
    if ($rss_content) {
        try {
            $xml = @new SimpleXMLElement($rss_content);
            $count = 0;
            
            foreach ($xml->channel->item as $item) {
                if ($count >= 6) break; // limit per feed before mixing
                
                $title = (string)$item->title;
                $link = (string)$item->link;
                $pubDate = (string)$item->pubDate;
                
                // Try to get an image from media:content or enclosure
                $thumb = '';
                $namespaces = $item->getNamespaces(true);
                if (isset($namespaces['media'])) {
                    $media = $item->children($namespaces['media']);
                    if (isset($media->content)) {
                        foreach($media->content as $c) {
                            if (isset($c->attributes()->url)) {
                                $thumb = (string)$c->attributes()->url;
                                break;
                            }
                        }
                    }
                }
                
                $timestamp = strtotime($pubDate);
                if (!$timestamp) $timestamp = time();
                
                $articles[] = [
                    'title' => $title,
                    'link' => $link,
                    'time_raw' => $timestamp,
                    'source' => $feed['source'],
                    'thumb' => $thumb
                ];
                
                $count++;
            }
        } catch (Exception $e) {
            // ignore failure for a single feed
        }
    }
}

// Sort by timestamp descending
usort($articles, function($a, $b) {
    return $b['time_raw'] <=> $a['time_raw'];
});

// Take top 6 overall
$articles = array_slice($articles, 0, 6);

// Format relative time strings
foreach ($articles as &$art) {
    $diff = time() - $art['time_raw'];
    if ($diff < 3600) {
        $art['time'] = max(1, floor($diff / 60)) . 'm ago';
    } elseif ($diff < 86400) {
        $art['time'] = floor($diff / 3600) . 'h ago';
    } else {
        $art['time'] = floor($diff / 86400) . 'd ago';
    }
    unset($art['time_raw']);
}

if (empty($articles)) {
    echo json_encode(['error' => 'Failed to fetch news feeds.']);
    exit;
}

$json = json_encode(['success' => true, 'articles' => $articles]);

// Save to cache
file_put_contents($cache_file, $json);

echo $json;

