/**
 * CryptoVerse - Dashboard Market Chart (Lightweight Charts) & News Integration
 * Location: assets/js/dashboard-chart.js
 */

document.addEventListener('DOMContentLoaded', () => {
  initNewsFeed();
  initMarketChart();
});

/* =====================================================================
 * NEWS FEED INTEGRATION
 * ===================================================================== */
async function initNewsFeed() {
  const newsContainer = document.getElementById('dashboard-news-list');
  if (!newsContainer) return;

  try {
    const res = await fetch('api/news.php');
    const data = await res.json();
    
    if (data.success && data.articles.length > 0) {
      newsContainer.innerHTML = '';
      
      data.articles.forEach(article => {
        const item = document.createElement('a');
        item.href = article.link;
        item.target = '_blank';
        item.className = 'news-item';
        
        const contentDiv = document.createElement('div');
        
        const metaDiv = document.createElement('div');
        metaDiv.className = 'news-meta';
        const initial = article.source.charAt(0).toUpperCase();
        metaDiv.innerHTML = `<span class="news-source-icon">${initial}</span> <span>${article.source}</span>`;
        
        const titleDiv = document.createElement('div');
        titleDiv.className = 'news-title';
        titleDiv.textContent = article.title;
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'news-time';
        timeDiv.textContent = article.time;
        
        contentDiv.appendChild(metaDiv);
        contentDiv.appendChild(titleDiv);
        contentDiv.appendChild(timeDiv);
        
        item.appendChild(contentDiv);
        
        if (article.thumb) {
          const img = document.createElement('img');
          img.src = article.thumb;
          img.className = 'news-thumb';
          item.appendChild(img);
        } else {
          const placeholder = document.createElement('div');
          placeholder.className = 'news-thumb';
          item.appendChild(placeholder);
        }
        
        newsContainer.appendChild(item);
      });
      if (window.lucide) window.lucide.createIcons();
    } else {
      newsContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #838091; font-size: 11px;">No news available at the moment.</div>';
    }
  } catch (err) {
    newsContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #ff6b6b; font-size: 11px;">Failed to load news.</div>';
  }
}

/* =====================================================================
 * TRADINGVIEW LIGHTWEIGHT CHARTS INTEGRATION
 * ===================================================================== */
let chart = null;
let areaSeries = null;
let candleSeries = null;
let currentSymbol = 'BTC';
let currentType = 'line';

async function initMarketChart() {
  const container = document.getElementById('tvchart');
  if (!container || !window.LightweightCharts) return;
  
  // Create Chart Instance
  chart = LightweightCharts.createChart(container, {
    layout: {
      background: { type: 'solid', color: 'transparent' },
      textColor: '#777489',
    },
    grid: {
      vertLines: { visible: false },
      horzLines: { visible: false },
    },
    rightPriceScale: {
      borderVisible: false,
      visible: false,
    },
    timeScale: {
      borderVisible: false,
      timeVisible: true,
      secondsVisible: false,
    },
    crosshair: {
      vertLine: {
        color: 'rgba(168, 155, 255, 0.4)',
        width: 1,
        style: 1,
      },
      horzLine: {
        color: 'rgba(168, 155, 255, 0.4)',
        width: 1,
        style: 1,
      }
    }
  });

  // Create Series
  areaSeries = chart.addAreaSeries({
    lineColor: '#a89bff',
    topColor: 'rgba(168, 155, 255, 0.4)',
    bottomColor: 'rgba(168, 155, 255, 0.0)',
    lineWidth: 2,
  });
  
  candleSeries = chart.addCandlestickSeries({
    upColor: '#5DE3CA',
    downColor: '#FF6B6B',
    borderVisible: false,
    wickUpColor: '#5DE3CA',
    wickDownColor: '#FF6B6B',
  });
  
  // Initially hide candle series (since default is line)
  candleSeries.applyOptions({ visible: false });

  // Make chart responsive
  window.addEventListener('resize', () => {
    chart.applyOptions({ width: container.clientWidth, height: container.clientHeight });
  });

  // Setup coin row clicks
  const rows = document.querySelectorAll('.coin-row');
  rows.forEach(row => {
    row.addEventListener('click', () => {
      rows.forEach(r => r.classList.remove('active'));
      row.classList.add('active');
      currentSymbol = row.getAttribute('data-coin');
      loadCoinData(currentSymbol);
    });
  });

  // Setup Chart Toggle Buttons
  const toggles = document.querySelectorAll('.chart-toggle');
  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      toggles.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentType = btn.getAttribute('data-type');
      
      if (currentType === 'line') {
        candleSeries.applyOptions({ visible: false });
        areaSeries.applyOptions({ visible: true });
      } else {
        areaSeries.applyOptions({ visible: false });
        candleSeries.applyOptions({ visible: true });
      }
      
      chart.timeScale().fitContent();
    });
  });

  // Initial load
  await updateAllTickers();
  loadCoinData(currentSymbol);
  
  setInterval(updateAllTickers, 60000);
}

async function updateAllTickers() {
  const coins = ['BTC', 'ETH', 'SOL'];
  
  for (const coin of coins) {
    try {
      const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${coin}USDT`);
      const data = await res.json();
      
      const priceEl = document.getElementById(`price-${coin}`);
      const changeEl = document.getElementById(`change-${coin}`);
      
      if (priceEl && changeEl && data.lastPrice) {
        const price = parseFloat(data.lastPrice);
        const change = parseFloat(data.priceChangePercent);
        
        priceEl.textContent = '$' + price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
        
        changeEl.textContent = (change > 0 ? '+' : '') + change.toFixed(2) + '%';
        changeEl.className = 'change ' + (change >= 0 ? 'positive' : 'negative');
      }
    } catch (e) {
      console.warn(`Failed to update ticker for ${coin}`);
    }
  }
}

async function loadCoinData(symbol) {
  document.getElementById('chart-pair-label').textContent = `${symbol} / USD`;
  document.getElementById('chart-current-price').textContent = 'Loading...';
  
  try {
    // 1. Update Header Ticker
    const tickerRes = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}USDT`);
    const tickerData = await tickerRes.json();
    
    if (tickerData.lastPrice) {
      const price = parseFloat(tickerData.lastPrice);
      const change = parseFloat(tickerData.priceChangePercent);
      
      document.getElementById('chart-current-price').textContent = '$' + price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
      
      const changeEl = document.getElementById('chart-current-change');
      changeEl.textContent = (change > 0 ? '+' : '') + change.toFixed(2) + '%';
      changeEl.className = 'chart-change ' + (change >= 0 ? 'positive' : 'negative');
    }

    // 2. Fetch Historical Klines (1h interval, 100 periods)
    const klineRes = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=1h&limit=100`);
    const klineData = await klineRes.json();
    
    const areaData = [];
    const candleData = [];
    
    klineData.forEach(candle => {
      // Lightweight charts requires time in seconds for timestamps
      const timestamp = Math.floor(candle[0] / 1000);
      const open = parseFloat(candle[1]);
      const high = parseFloat(candle[2]);
      const low = parseFloat(candle[3]);
      const close = parseFloat(candle[4]);
      
      areaData.push({ time: timestamp, value: close });
      candleData.push({ time: timestamp, open, high, low, close });
    });
    
    // Set data for both series instantly
    areaSeries.setData(areaData);
    candleSeries.setData(candleData);
    
    chart.timeScale().fitContent();
    
  } catch (err) {
    console.error(`Error loading chart data for ${symbol}:`, err);
    document.getElementById('chart-current-price').textContent = 'API Error';
  }
}
