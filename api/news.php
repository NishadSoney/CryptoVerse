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

// Fetch RSS feed
$rss_url = 'https://www.coindesk.com/arc/outboundfeeds/rss/';
$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => "User-Agent: CryptoVerse/1.0\r\n"
    ]
]);

$rss_content = @file_get_contents($rss_url, false, $context);

if (!$rss_content) {
    echo json_encode(['error' => 'Failed to fetch news feed.']);
    exit;
}

try {
    $xml = new SimpleXMLElement($rss_content);
    $articles = [];
    $count = 0;
    
    foreach ($xml->channel->item as $item) {
        if ($count >= 5) break; // Get top 5
        
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
        
        // Calculate relative time (e.g. "12m ago")
        $timestamp = strtotime($pubDate);
        $diff = time() - $timestamp;
        
        if ($diff < 3600) {
            $time_str = floor($diff / 60) . 'm ago';
        } elseif ($diff < 86400) {
            $time_str = floor($diff / 3600) . 'h ago';
        } else {
            $time_str = floor($diff / 86400) . 'd ago';
        }
        
        $articles[] = [
            'title' => $title,
            'link' => $link,
            'time' => $time_str,
            'source' => 'CoinDesk',
            'thumb' => $thumb
        ];
        
        $count++;
    }
    
    $json = json_encode(['success' => true, 'articles' => $articles]);
    
    // Save to cache
    file_put_contents($cache_file, $json);
    
    echo $json;
    
} catch (Exception $e) {
    echo json_encode(['error' => 'Failed to parse news feed.']);
}
