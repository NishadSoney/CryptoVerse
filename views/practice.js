const { escapeHtml, renderHeader } = require('./header');

function formatNumber(num, minDec = 2, maxDec = 2) {
  return Number(num).toLocaleString('en-US', { minimumFractionDigits: minDec, maximumFractionDigits: maxDec });
}

function renderPractice({
  user,
  virtualCash = 100000,
  portfolioTotal = 100000,
  pnlDollar = 0,
  pnlPercent = 0,
  allocations = {},
  holdings = [],
  trades = [],
  preselectedAsset = 'BTC',
  currentPrices = {}
}) {
  const name = user.name || 'Alex';
  const xp = user.xp_total || 0;
  const current_level = user.current_level || 1;
  const streak = user.streak_days || 1;
  const cash = user.virtual_cash || virtualCash;

  const headerHtml = renderHeader({
    active_page: 'trade',
    name,
    xp,
    current_level,
    streak,
    cash,
    title: 'Trade'
  });

  const allocLabels = [];
  for (const [sym, data] of Object.entries(allocations)) {
    allocLabels.push(`${sym} ${formatNumber(data.pct, 0, 0)}%`);
  }

  return `${headerHtml}

<link rel="stylesheet" href="assets/css/trade.css">

<div class="trade-heading">
  <div>
    <div class="section-kicker"><span class="live-dot" style="display:inline-block; width:6px; height:6px; background:#5de3ca; border-radius:50%; margin-right:4px; box-shadow: 0 0 8px #5de3ca; animation: pulse 2s infinite;"></span> PAPER TRADING SIMULATION</div>
    <h1>Trade <em>with intent.</em></h1>
    <p>Practice reading the market, placing orders, and managing risk without real money.</p>
  </div>
  <div class="paper-balance">
    <i data-lucide="wallet" style="width: 16px; height: 16px;"></i>
    <span>Available cash</span>
    <strong id="head-balance-val">$${formatNumber(virtualCash, 2, 2)}</strong>
    <small style="color: #838091;">
      Total Value: <span id="head-pnl-val" style="color: ${pnlDollar >= 0 ? 'var(--mint)' : '#ef7f9b'};">$${formatNumber(portfolioTotal, 2, 2)}</span>
    </small>
  </div>
</div>

<div class="trade-layout">
  <section class="trade-main">
    <div class="pair-toolbar">
      <div class="pair-select">
        <span class="market-coin amber" id="asset-icon" style="background:#f3ad45; color:#191525;">₿</span>
        <div>
          <div class="custom-dropdown" id="asset-dropdown" tabindex="0">
            <div class="dropdown-selected" onclick="toggleDropdown(event)">
              <span id="selected-asset-text">${escapeHtml(preselectedAsset)} / USDC</span>
              <i data-lucide="chevron-down" style="width: 15px; height: 15px;"></i>
            </div>
            <div class="dropdown-options" id="dropdown-options-list">
              ${Object.keys(currentPrices).map(sym => `
                <div class="dropdown-option ${sym === preselectedAsset ? 'active' : ''}" onclick="selectAsset(event, '${sym}')">
                  ${sym} / USDC
                </div>
              `).join('')}
            </div>
          </div>
          <input type="hidden" id="trade-asset" value="${escapeHtml(preselectedAsset)}">
          <small id="trade-asset-name">Bitcoin</small>
        </div>
      </div>
      <div class="pair-price">
        <strong id="live-price-disp">$0.00</strong>
        <span class="market-positive" id="live-price-change">+0.00%</span>
      </div>
      <div class="pair-stats">
        <span>24h high <b id="stat-high">$0.00</b></span>
        <span>24h low <b id="stat-low">$0.00</b></span>
        <span>24h volume <b id="stat-vol">$0.00</b></span>
      </div>
      <button class="icon-button" aria-label="Refresh Graph" onclick="refreshGraph()" title="Refresh Graph">
        <i data-lucide="refresh-cw" style="width: 16px; height: 16px;"></i>
      </button>
    </div>

    <div class="chart-controls">
      <div>
        <button class="chart-tab active" id="tab-chart" onclick="switchChartTab('chart')">Chart</button>
        <button class="chart-tab" id="tab-depth" onclick="switchChartTab('depth')">Depth</button>
      </div>
      <div class="timeframes" id="timeframe-buttons">
        <button data-interval="1m">1m</button>
        <button data-interval="5m">5m</button>
        <button class="active" data-interval="1h">1h</button>
        <button data-interval="4h">4h</button>
        <button data-interval="1d">1D</button>
        <button data-interval="1w">1W</button>
        <button><i data-lucide="bar-chart-3" style="width: 14px; height: 14px;"></i></button>
      </div>
    </div>

    <div class="trade-chart" id="tv-chart-container" style="height: 380px;">
        <!-- TradingView Chart injected via JS -->
    </div>
    
    <div class="trade-chart" id="tv-depth-container" style="display: none; height: 380px;">
        <!-- Depth Chart injected via JS -->
    </div>

    <div class="indicator-strip">
      <div><span class="indicator-key violet-key"></span> MA (20) <strong id="ma-20">--</strong></div>
      <div><span class="indicator-key mint-key"></span> MA (50) <strong id="ma-50">--</strong></div>
      <div>Volume <strong id="vol-disp">--</strong></div>
    </div>

  </section>

  <aside class="order-panel">
    <div class="order-heading">
      <div>
        <div class="section-kicker">ORDER TICKET</div>
        <h2 id="order-pair-title">${escapeHtml(preselectedAsset)} / USDC</h2>
      </div>
      <button class="star-button"><i data-lucide="star" style="width: 16px; height: 16px;"></i></button>
    </div>

    <div class="order-type">
      <button class="active">Market</button>
      <button>Limit</button>
      <button>Stop-limit</button>
    </div>

    <form id="trade-form" onsubmit="executeTrade(event)">
        <div class="side-toggle">
          <button type="button" class="active buy" id="btn-side-buy" onclick="setSide('BUY')">Buy</button>
          <button type="button" id="btn-side-sell" onclick="setSide('SELL')">Sell</button>
        </div>

        <div class="order-available">
          <span>Available to trade</span>
          <strong id="available-balance-disp">$${formatNumber(virtualCash, 2, 2)} USDC</strong>
        </div>

        <label class="trade-field">
          Price <span>USDC</span>
          <input id="trade-price-input" value="0.00" readOnly />
        </label>

        <label class="trade-field">
          Amount <span id="amount-asset-label">${escapeHtml(preselectedAsset)}</span>
          <input id="trade-qty" type="number" step="any" min="0.0001" placeholder="0.00" oninput="calculateTotal()" required />
        </label>

        <div class="percent-row">
          <button type="button" onclick="setQuickSize(0.25)">25%</button>
          <button type="button" onclick="setQuickSize(0.50)">50%</button>
          <button type="button" onclick="setQuickSize(0.75)">75%</button>
          <button type="button" onclick="setQuickSize(1.00)">100%</button>
        </div>

        <label class="trade-field">
          Total <span>USDC</span>
          <input id="trade-total" type="text" placeholder="0.00" readonly style="color: #b6adff; font-weight:700;" />
        </label>

        <button type="submit" id="btn-submit-order" class="place-order buy">
          Buy ${escapeHtml(preselectedAsset)} <i data-lucide="arrow-up" style="width: 15px; height: 15px;"></i>
        </button>
        <div id="trade-result-msg" style="margin-top: 0.75rem; text-align: center; font-size: 0.8531rem; font-weight: 700;"></div>

        <p class="order-note">
          <i data-lucide="info" style="width: 13px; height: 13px;"></i> 
          Orders are simulated and do not use real funds. Risk safely.
        </p>
    </form>
  </aside>
</div>

<section class="portfolio-section">
  <div class="section-heading">
    <div>
      <div class="section-kicker">YOUR SIMULATED PORTFOLIO</div>
      <h2>Holdings & performance</h2>
    </div>
    <a href="/markets">View markets <i data-lucide="arrow-up" style="width: 14px; height: 14px;"></i></a>
  </div>
  
  <div class="portfolio-overview">
    <div>
      <span class="muted-label">ESTIMATED TOTAL</span>
      <strong id="est-total-val">$${formatNumber(portfolioTotal, 2, 2)}</strong>
      <span id="est-pnl-val" class="${pnlDollar >= 0 ? 'market-positive' : 'market-negative'}">
        <i data-lucide="${pnlDollar >= 0 ? 'arrow-up' : 'arrow-down'}" style="width: 13px; height: 13px;"></i> 
        ${pnlDollar >= 0 ? '+' : ''}${formatNumber(pnlPercent, 2, 2)}% <small>all-time</small>
      </span>
    </div>
    <div>
      <span class="muted-label">AVAILABLE BALANCE</span>
      <strong>$${formatNumber(virtualCash, 2, 2)} <small>USDC</small></strong>
      <span class="portfolio-muted">${formatNumber((virtualCash / Math.max(1, portfolioTotal)) * 100, 2, 2)}% of portfolio</span>
    </div>
    <div>
      <span class="muted-label">TOTAL PNL</span>
      <strong id="total-pnl-val" class="${pnlDollar >= 0 ? 'market-positive' : ''}" style="${pnlDollar < 0 ? 'color:#ef7f9b;' : ''}">
        ${pnlDollar >= 0 ? '+' : ''}$${formatNumber(pnlDollar, 2, 2)}
      </strong>
      <span class="portfolio-muted">Since simulation start</span>
    </div>
    <div class="allocation">
      <span class="muted-label">ALLOCATION</span>
      <div class="allocation-bar">
        ${Object.entries(allocations).map(([sym, data]) => `
          <i style="background:${data.color}; flex:${data.pct}" title="${sym} ${formatNumber(data.pct, 1, 1)}%"></i>
        `).join('')}
      </div>
      <small>
        ${allocLabels.join(' &middot; ')}
      </small>
    </div>
  </div>

  <div class="asset-table">
    <div class="asset-table-head">
      <span>Asset</span>
      <span>Avg Price</span>
      <span>PNL</span>
      <span>Balance</span>
      <span>Value</span>
      <span></span>
    </div>
    ${holdings.length === 0 ? `
      <div style="padding: 20px; color: #77758a; text-align: center; font-size: 12px;">No assets held.</div>
    ` : holdings.map(h => {
      const sym = h.asset_symbol;
      const qty = Number(h.quantity);
      const avg = Number(h.avg_buy_price);
      const cur = currentPrices[sym] !== undefined ? currentPrices[sym] : avg;
      const val = qty * cur;
      const pnl = (cur - avg) * qty;
      const pnlPct = avg > 0 ? ((cur - avg) / avg) * 100 : 0;
      return `
        <div class="asset-row">
          <div class="asset-cell">
            <span class="market-coin" style="background:#3b3857; color:#fff; font-size: 9px;">${sym.substring(0, 1)}</span>
            <div>
              <strong>${escapeHtml(sym)}</strong>
              <small>${escapeHtml(sym)}</small>
            </div>
          </div>
          <strong>$${formatNumber(avg, 2, 2)}</strong>
          <span class="${pnl >= 0 ? 'market-positive' : 'market-negative'}">
             ${pnl >= 0 ? '+' : ''}$${formatNumber(pnl, 2, 2)} (${formatNumber(pnlPct, 1, 1)}%)
          </span>
          <span>${formatNumber(qty, 4, 4)}</span>
          <strong>$${formatNumber(val, 2, 2)}</strong>
          <button class="asset-action" onclick="document.getElementById('trade-asset').value='${sym}'; updateAssetPrice(); window.scrollTo(0,0);">Trade</button>
        </div>
      `;
    }).join('')}
  </div>
</section>

<section class="recent-section">
  <div class="section-heading">
    <div>
      <div class="section-kicker">ACTIVITY</div>
      <h2>Recent trades</h2>
    </div>
    <button class="filter-button">All pairs <i data-lucide="chevron-down" style="width: 14px; height: 14px;"></i></button>
  </div>
  
  <div class="recent-table">
    <div class="recent-head">
      <span>Pair</span>
      <span>Side</span>
      <span>Amount</span>
      <span>Price</span>
      <span>Date</span>
      <span>Status</span>
    </div>
    ${trades.length === 0 ? `
      <div style="padding: 20px; color: #77758a; text-align: center; font-size: 12px;">No recorded trades yet.</div>
    ` : trades.map(trade => `
      <div class="recent-row">
        <strong>${escapeHtml(trade.asset_symbol)} / USDC</strong>
        <span class="${trade.trade_type === 'BUY' ? 'market-positive' : 'market-negative'}">
          <i data-lucide="${trade.trade_type === 'BUY' ? 'arrow-down' : 'arrow-up'}" style="width: 13px; height: 13px;"></i> 
          ${escapeHtml(trade.trade_type)}
        </span>
        <span>${formatNumber(trade.quantity, 4, 4)}</span>
        <span>$${formatNumber(trade.price, 2, 2)}</span>
        <span class="portfolio-muted"><i data-lucide="clock-3" style="width: 13px; height: 13px;"></i> ${escapeHtml(trade.created_at)}</span>
        <span class="status-pill">Completed</span>
      </div>
    `).join('')}
  </div>
</section>

<div class="dashboard-safety">
  <i data-lucide="shield-check" style="width: 17px; height: 17px;"></i>
  <span>CryptoVerse is an educational simulation. No real money, wallets, or trades are involved.</span>
</div>

<!-- Lightweight Charts -->
<script src="https://unpkg.com/lightweight-charts@3.8.0/dist/lightweight-charts.standalone.production.js"></script>

<script>
  if (typeof lucide !== 'undefined') lucide.createIcons();

  const prices = ${JSON.stringify(currentPrices)};
  const assetNames = {
      'BTC': 'Bitcoin', 'ETH': 'Ethereum', 'BNB': 'BNB', 'SOL': 'Solana', 
      'XRP': 'XRP', 'ADA': 'Cardano', 'DOGE': 'Dogecoin', 'AVAX': 'Avalanche', 
      'LINK': 'Chainlink', 'DOT': 'Polkadot', 'MATIC': 'Polygon', 'LTC': 'Litecoin', 
      'SHIB': 'Shiba Inu', 'BCH': 'Bitcoin Cash', 'UNI': 'Uniswap', 'TRX': 'TRON', 
      'NEAR': 'NEAR Protocol', 'APT': 'Aptos', 'ARB': 'Arbitrum', 'FIL': 'Filecoin', 
      'FET': 'Fetch.ai', 'RNDR': 'Render', 'GRT': 'The Graph', 'IMX': 'Immutable', 
      'GALA': 'Gala', 'ENJ': 'Enjin Coin', 'PEPE': 'Pepe'
  };
  const holdings = ${JSON.stringify(holdings)};
  let currentSide = 'BUY';
  let currentInterval = '1h';
  const availableCash = ${Number(virtualCash)};
  let currentAssetBalance = 0;

  // Chart instances
  let chart = null;
  let candlestickSeries = null;
  let volumeSeries = null;
  let ma20Series = null;
  let ma50Series = null;
  let socket = null;
  
  // Depth Chart instances
  let depthChart = null;
  let bidsSeries = null;
  let asksSeries = null;
  let currentTab = 'chart';
  
  // Drawing state
  let drawingState = { active: false, startPoint: null, lines: [] };

  function initChart() {
    const container = document.getElementById('tv-chart-container');
    chart = LightweightCharts.createChart(container, {
      width: container.clientWidth,
      height: 380,
      layout: {
          backgroundColor: 'transparent',
          textColor: '#6e6b7f',
      },
      grid: {
          vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
          horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
      },
      crosshair: {
          mode: LightweightCharts.CrosshairMode.Normal,
      },
      rightPriceScale: {
          borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      timeScale: {
          borderColor: 'rgba(255, 255, 255, 0.1)',
          timeVisible: true,
          secondsVisible: false,
      },
    });

    candlestickSeries = chart.addCandlestickSeries({
        upColor: '#5de3ca',
        downColor: '#ef7f9b',
        borderDownColor: '#ef7f9b',
        borderUpColor: '#5de3ca',
        wickDownColor: '#ef7f9b',
        wickUpColor: '#5de3ca',
    });

    volumeSeries = chart.addHistogramSeries({
        color: 'rgba(93, 227, 202, 0.3)',
        priceFormat: { type: 'volume' },
        priceScaleId: '',
        scaleMargins: { top: 0.8, bottom: 0 },
    });
    
    ma20Series = chart.addLineSeries({
        color: '#9d8cff',
        lineWidth: 1.5,
        crosshairMarkerVisible: false,
        lastValueVisible: false,
        priceLineVisible: false
    });
    
    ma50Series = chart.addLineSeries({
        color: '#5de3ca',
        lineWidth: 1.5,
        crosshairMarkerVisible: false,
        lastValueVisible: false,
        priceLineVisible: false
    });

    // Crosshair legend update
    chart.subscribeCrosshairMove(param => {
        if (param.time && param.seriesData) {
            const vData = param.seriesData.get(volumeSeries);
            const m20 = param.seriesData.get(ma20Series);
            const m50 = param.seriesData.get(ma50Series);
            
            if(vData) document.getElementById('vol-disp').textContent = vData.value.toLocaleString();
            if(m20) document.getElementById('ma-20').textContent = m20.value.toFixed(2);
            if(m50) document.getElementById('ma-50').textContent = m50.value.toFixed(2);
        }
    });

    initDepthChart();
    setupTimeframeButtons();
  }

  function initDepthChart() {
    const container = document.getElementById('tv-depth-container');
    depthChart = LightweightCharts.createChart(container, {
      width: container.clientWidth,
      height: 380,
      layout: {
          backgroundColor: 'transparent',
          textColor: '#6e6b7f',
      },
      grid: {
          vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
          horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
      },
      rightPriceScale: {
          borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      timeScale: {
          borderColor: 'rgba(255, 255, 255, 0.1)',
      },
    });

    bidsSeries = depthChart.addAreaSeries({
        topColor: 'rgba(93, 227, 202, 0.4)',
        bottomColor: 'rgba(93, 227, 202, 0.01)',
        lineColor: '#5de3ca',
        lineWidth: 2,
    });

    asksSeries = depthChart.addAreaSeries({
        topColor: 'rgba(239, 127, 155, 0.4)',
        bottomColor: 'rgba(239, 127, 155, 0.01)',
        lineColor: '#ef7f9b',
        lineWidth: 2,
    });
  }

  function setupTimeframeButtons() {
    const btns = document.querySelectorAll('#timeframe-buttons button');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const interval = btn.getAttribute('data-interval');
        if (!interval) return;
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentInterval = interval;
        const sym = document.getElementById('trade-asset').value;
        fetchKlineData(sym, currentInterval);
      });
    });
  }

  function switchChartTab(tab) {
    currentTab = tab;
    const tabChart = document.getElementById('tab-chart');
    const tabDepth = document.getElementById('tab-depth');
    const cChart = document.getElementById('tv-chart-container');
    const cDepth = document.getElementById('tv-depth-container');

    if (tab === 'chart') {
      tabChart.classList.add('active');
      tabDepth.classList.remove('active');
      cChart.style.display = 'block';
      cDepth.style.display = 'none';
      chart.resize(cChart.clientWidth, 380);
    } else {
      tabDepth.classList.add('active');
      tabChart.classList.remove('active');
      cChart.style.display = 'none';
      cDepth.style.display = 'block';
      depthChart.resize(cDepth.clientWidth, 380);
      const sym = document.getElementById('trade-asset').value;
      fetchDepthData(sym);
    }
  }

  function fetchDepthData(symbol) {
    fetch(\`https://api.binance.com/api/v3/depth?symbol=\${symbol}USDT&limit=100\`)
      .then(res => res.json())
      .then(data => {
        if (!data.bids || !data.asks) return;
        
        let bidTotal = 0;
        const bids = data.bids.map(b => {
          bidTotal += parseFloat(b[1]);
          return { time: parseFloat(b[0]), value: bidTotal };
        }).sort((a,b) => a.time - b.time);

        let askTotal = 0;
        const asks = data.asks.map(a => {
          askTotal += parseFloat(a[1]);
          return { time: parseFloat(a[0]), value: askTotal };
        }).sort((a,b) => a.time - b.time);

        if (bidsSeries && asksSeries) {
          bidsSeries.setData(bids);
          asksSeries.setData(asks);
          depthChart.timeScale().fitContent();
        }
      })
      .catch(err => console.error('Error fetching depth data:', err));
  }

  function calculateSMA(data, count) {
    const avg = function(vals) {
      let sum = 0;
      for (let i = 0; i < vals.length; i++) sum += vals[i];
      return sum / vals.length;
    };
    const result = [];
    for (let i = count - 1, len = data.length; i < len; i++) {
      const valSlice = data.slice(i - count + 1, i + 1).map(d => d.close);
      result.push({ time: data[i].time, value: avg(valSlice) });
    }
    return result;
  }

  function fetchKlineData(symbol, interval) {
    fetch(\`https://api.binance.com/api/v3/klines?symbol=\${symbol}USDT&interval=\${interval}&limit=500\`)
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;

        const candles = [];
        const volumes = [];

        data.forEach(d => {
          const t = Math.floor(d[0] / 1000);
          const o = parseFloat(d[1]);
          const h = parseFloat(d[2]);
          const l = parseFloat(d[3]);
          const c = parseFloat(d[4]);
          const v = parseFloat(d[5]);

          candles.push({ time: t, open: o, high: h, low: l, close: c });
          volumes.push({
            time: t,
            value: v,
            color: c >= o ? 'rgba(93, 227, 202, 0.3)' : 'rgba(239, 127, 155, 0.3)'
          });
        });

        if (candlestickSeries && volumeSeries) {
          candlestickSeries.setData(candles);
          volumeSeries.setData(volumes);

          const ma20 = calculateSMA(candles, 20);
          const ma50 = calculateSMA(candles, 50);
          ma20Series.setData(ma20);
          ma50Series.setData(ma50);

          chart.timeScale().fitContent();
        }
      })
      .catch(err => console.error('Error fetching kline data:', err));
  }

  function toggleDropdown(e) {
    e.stopPropagation();
    const dropdown = document.getElementById('asset-dropdown');
    dropdown.classList.toggle('active');
  }

  document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('asset-dropdown');
    if (dropdown && !dropdown.contains(e.target)) {
      dropdown.classList.remove('active');
    }
  });

  function selectAsset(e, sym) {
    e.stopPropagation();
    document.getElementById('trade-asset').value = sym;
    document.getElementById('selected-asset-text').textContent = sym + ' / USDC';
    
    const options = document.querySelectorAll('.dropdown-option');
    options.forEach(opt => opt.classList.remove('active'));
    e.target.classList.add('active');

    document.getElementById('asset-dropdown').classList.remove('active');
    updateAssetPrice();
  }

  function setSide(side) {
    currentSide = side;
    const btnBuy = document.getElementById('btn-side-buy');
    const btnSell = document.getElementById('btn-side-sell');
    const btnSubmit = document.getElementById('btn-submit-order');
    const availDisp = document.getElementById('available-balance-disp');
    const sym = document.getElementById('trade-asset').value;

    if (side === 'BUY') {
      btnBuy.classList.add('active', 'buy');
      btnSell.classList.remove('active', 'sell');
      btnSubmit.className = 'place-order buy';
      btnSubmit.innerHTML = \`Buy \${sym} <i data-lucide="arrow-up" style="width: 15px; height: 15px;"></i>\`;
      availDisp.textContent = '$' + availableCash.toLocaleString(undefined, {minimumFractionDigits: 2}) + ' USDC';
    } else {
      btnSell.classList.add('active', 'sell');
      btnBuy.classList.remove('active', 'buy');
      btnSubmit.className = 'place-order sell';
      btnSubmit.innerHTML = \`Sell \${sym} <i data-lucide="arrow-down" style="width: 15px; height: 15px;"></i>\`;
      availDisp.textContent = currentAssetBalance.toLocaleString(undefined, {maximumFractionDigits: 4}) + ' ' + sym;
    }
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
    calculateTotal();
  }

  function updateAssetPrice() {
    const sym = document.getElementById('trade-asset').value;
    const name = assetNames[sym] || sym;
    
    document.getElementById('trade-asset-name').textContent = name;
    document.getElementById('order-pair-title').textContent = sym + ' / USDC';
    document.getElementById('amount-asset-label').textContent = sym;
    
    const pr = prices[sym] || 0;
    document.getElementById('live-price-disp').textContent = '$' + pr.toLocaleString(undefined, {minimumFractionDigits: 2});
    document.getElementById('trade-price-input').value = pr.toFixed(2);
    
    const h = holdings.find(x => x.asset_symbol === sym);
    currentAssetBalance = h ? parseFloat(h.quantity) : 0;
    
    if (currentTab === 'chart') {
        fetchKlineData(sym, currentInterval);
    } else {
        fetchDepthData(sym);
    }
    
    setSide(currentSide);
  }

  function calculateTotal() {
    const sym = document.getElementById('trade-asset').value;
    const pr = prices[sym] || 0;
    const qty = parseFloat(document.getElementById('trade-qty').value) || 0;
    const total = qty * pr;
    document.getElementById('trade-total').value = total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
  }

  function setQuickSize(fraction) {
    const sym = document.getElementById('trade-asset').value;
    const pr = prices[sym] || 1;
    if (currentSide === 'BUY') {
      const cashToUse = availableCash * fraction;
      const qty = cashToUse / pr;
      document.getElementById('trade-qty').value = qty.toFixed(4);
    } else {
      document.getElementById('trade-qty').value = (currentAssetBalance * fraction).toFixed(4);
    }
    calculateTotal();
  }

  async function executeTrade(e) {
    e.preventDefault();
    const sym = document.getElementById('trade-asset').value;
    const qty = parseFloat(document.getElementById('trade-qty').value);
    const pr = prices[sym] || 0;

    const formData = new FormData();
    formData.append('symbol', sym);
    formData.append('type', currentSide);
    formData.append('quantity', qty);
    formData.append('price', pr);

    const msgDiv = document.getElementById('trade-result-msg');
    msgDiv.innerHTML = '<span style="color: #b6adff;">Executing...</span>';

    try {
      const res = await fetch('/api/trade', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        msgDiv.innerHTML = \`<span style="color: #5de3ca;">✓ \${data.message}</span>\`;
        setTimeout(() => location.reload(), 1200);
      } else {
        msgDiv.innerHTML = \`<span style="color: #F43F5E;">✕ \${data.error}</span>\`;
      }
    } catch (err) {
      msgDiv.innerHTML = '<span style="color: #F43F5E;">✕ Execution error.</span>';
    }
  }

  async function resetSandbox() {
    if (!confirm('Reset your paper wallet back to $100,000 USD? All virtual positions will be liquidated.')) return;
    try {
      const res = await fetch('/api/wallet-reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) location.reload();
    } catch (e) {
      alert('Reset failed.');
    }
  }

  function refreshGraph() {
      const sym = document.getElementById('trade-asset').value;
      if (currentTab === 'chart') {
          fetchKlineData(sym, currentInterval);
      } else {
          fetchDepthData(sym);
      }
  }

  // Initialize
  initChart();
  updateAssetPrice();
</script>
</body>
</html>`;
}

module.exports = {
  renderPractice
};
