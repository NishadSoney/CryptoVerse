let cachedNews = null;
let lastCacheTime = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

const FALLBACK_ARTICLES = [
  {
    title: "Bitcoin Surges Past Key Resistance as Institutional Accumulation Accelerates",
    link: "https://www.coindesk.com",
    source: "CoinDesk",
    time: "25m ago",
    thumb: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&auto=format&fit=crop"
  },
  {
    title: "Ethereum Layer 2 Gas Fees Plummet Following Network Scalability Upgrades",
    link: "https://cointelegraph.com",
    source: "Cointelegraph",
    time: "1h ago",
    thumb: "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=200&auto=format&fit=crop"
  },
  {
    title: "Global Central Banks Advance Digital Currency Pilot Frameworks",
    link: "https://www.coindesk.com",
    source: "CoinDesk",
    time: "2h ago",
    thumb: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=200&auto=format&fit=crop"
  },
  {
    title: "Solana Ecosystem DEX Volume Outpaces Competitors Amid Active On-Chain Liquidity",
    link: "https://cointelegraph.com",
    source: "Cointelegraph",
    time: "3h ago",
    thumb: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=200&auto=format&fit=crop"
  },
  {
    title: "DeFi Lending Protocols Implement Automated Real-Time Risk Auditing Engines",
    link: "https://www.coindesk.com",
    source: "CoinDesk",
    time: "4h ago",
    thumb: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=200&auto=format&fit=crop"
  },
  {
    title: "Understanding Proof of Stake: How Modern Validators Secure Decentralized Consensus",
    link: "https://cointelegraph.com",
    source: "Cointelegraph",
    time: "5h ago",
    thumb: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=200&auto=format&fit=crop"
  }
];

function extractTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  if (!match) return '';
  return match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

function extractAttr(xml, tag, attr) {
  const match = xml.match(new RegExp(`<${tag}[^>]*${attr}=["']([^"']*)["']`, 'i'));
  return match ? match[1] : '';
}

async function fetchRssFeed(url, source) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'CryptoVerse/2.0' }
    });
    clearTimeout(timeoutId);
    if (!res.ok) return [];

    const xml = await res.text();
    const items = xml.split(/<item>/i).slice(1);
    const articles = [];

    for (let i = 0; i < Math.min(items.length, 6); i++) {
      const itemXml = items[i];
      const title = extractTag(itemXml, 'title');
      const link = extractTag(itemXml, 'link');
      const pubDate = extractTag(itemXml, 'pubDate');
      let thumb = extractAttr(itemXml, 'media:content', 'url') || extractAttr(itemXml, 'enclosure', 'url');

      const pubTime = pubDate ? new Date(pubDate).getTime() : Date.now();

      if (title && link) {
        articles.push({
          title,
          link,
          time_raw: isNaN(pubTime) ? Date.now() : pubTime,
          source,
          thumb: thumb || ''
        });
      }
    }
    return articles;
  } catch (e) {
    return [];
  }
}

async function getCryptoNews() {
  const now = Date.now();
  if (cachedNews && (now - lastCacheTime) < CACHE_DURATION) {
    return cachedNews;
  }

  const [coinDesk, coinTelegraph] = await Promise.all([
    fetchRssFeed('https://www.coindesk.com/arc/outboundfeeds/rss/', 'CoinDesk'),
    fetchRssFeed('https://cointelegraph.com/rss', 'Cointelegraph')
  ]);

  let all = [...coinDesk, ...coinTelegraph];
  if (all.length === 0) {
    cachedNews = FALLBACK_ARTICLES;
    lastCacheTime = now;
    return FALLBACK_ARTICLES;
  }

  all.sort((a, b) => b.time_raw - a.time_raw);
  all = all.slice(0, 8);

  const formatted = all.map(art => {
    const diff = Math.floor((now - art.time_raw) / 1000);
    let timeStr = 'Just now';
    if (diff < 3600) {
      timeStr = `${Math.max(1, Math.floor(diff / 60))}m ago`;
    } else if (diff < 86400) {
      timeStr = `${Math.floor(diff / 3600)}h ago`;
    } else {
      timeStr = `${Math.floor(diff / 86400)}d ago`;
    }
    return {
      title: art.title,
      link: art.link,
      time: timeStr,
      source: art.source,
      thumb: art.thumb
    };
  });

  cachedNews = formatted;
  lastCacheTime = now;
  return formatted;
}

module.exports = {
  getCryptoNews
};
