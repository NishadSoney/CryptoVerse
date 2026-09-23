<?php
/**
 * CryptoVerse - Risk-Free Paper Trading Sandbox ($100k Virtual Capital)
 * Location: practice.php
 * Target: WAMP Server / Apache / PHP 8+
 */

declare(strict_types=1);

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/auth.php';

use CryptoVerse\Config\Database;

if (!AuthService::check()) {
    header('Location: /login.php');
    exit;
}

$db = Database::getConnection();
$userId = (int)$_SESSION['user_id'];

// Get user's wallet
$walletStmt = $db->prepare("SELECT id, virtual_cash FROM wallets WHERE user_id = :uid");
$walletStmt->execute([':uid' => $userId]);
$wallet = $walletStmt->fetch();

if (!$wallet) {
    // Bootstrap wallet with $100k virtual cash
    $createW = $db->prepare("INSERT INTO wallets (user_id, virtual_cash, updated_at) VALUES (:uid, 100000.00, NOW())");
    $createW->execute([':uid' => $userId]);
    $wallet = ['id' => $db->lastInsertId(), 'virtual_cash' => 100000.00];
}

$walletId = (int)$wallet['id'];
$virtualCash = (float)$wallet['virtual_cash'];

// Fetch user's asset holdings
$holdingsStmt = $db->prepare("SELECT * FROM wallet_assets WHERE wallet_id = :wid ORDER BY updated_at DESC");
$holdingsStmt->execute([':wid' => $walletId]);
$holdings = $holdingsStmt->fetchAll();

// Mock live prices for portfolio calculation
$currentPrices = [
    'BTC' => 64120.00, 'ETH' => 3480.50, 'BNB' => 585.40, 'SOL' => 154.20, 
    'XRP' => 0.60, 'ADA' => 0.38, 'DOGE' => 0.16, 'AVAX' => 30.00, 
    'LINK' => 14.50, 'DOT' => 6.20, 'MATIC' => 0.70, 'LTC' => 85.00, 
    'SHIB' => 0.00002, 'BCH' => 450.00, 'UNI' => 7.80, 'TRX' => 0.11, 
    'NEAR' => 6.50, 'APT' => 8.20, 'ARB' => 1.10, 'FIL' => 5.80, 
    'FET' => 2.10, 'RNDR' => 9.50, 'GRT' => 0.30, 'IMX' => 2.20, 
    'GALA' => 0.04, 'ENJ' => 0.30, 'PEPE' => 0.000008
];

// Calculate portfolio total value
$holdingsValue = 0.0;
$holdingVals = [];
foreach ($holdings as $h) {
    $sym = $h['asset_symbol'];
    $price = $currentPrices[$sym] ?? 1.0;
    $val = ((float)$h['quantity'] * $price);
    $holdingsValue += $val;
    if ($val > 0) {
        $holdingVals[$sym] = $val;
    }
}
$portfolioTotal = $virtualCash + $holdingsValue;
$pnlDollar = $portfolioTotal - 100000.00;
$pnlPercent = ($pnlDollar / 100000.00) * 100.0;

// Calculate allocations for the UI
$allocations = [];
if ($portfolioTotal > 0) {
    arsort($holdingVals);
    $colors = ['#f6a623', '#9d8cff', '#5de3ca', '#e84142', '#8247e5', '#f06427'];
    $cIdx = 0;
    
    foreach ($holdingVals as $sym => $val) {
        $pct = ($val / $portfolioTotal) * 100;
        if ($pct >= 0.1) {
            $allocations[$sym] = ['pct' => $pct, 'color' => $colors[$cIdx % count($colors)]];
            $cIdx++;
        }
    }
    
    $cashPct = ($virtualCash / $portfolioTotal) * 100;
    if ($cashPct >= 0.1) {
        $allocations['Cash'] = ['pct' => $cashPct, 'color' => '#7195ff'];
    }
} else {
    $allocations['Cash'] = ['pct' => 100, 'color' => '#7195ff'];
}

// Fetch last 10 trades
$tradesStmt = $db->prepare("SELECT * FROM trades WHERE user_id = :uid ORDER BY created_at DESC LIMIT 10");
$tradesStmt->execute([':uid' => $userId]);
$trades = $tradesStmt->fetchAll();

$preselectedAsset = isset($_GET['asset']) ? strtoupper(trim($_GET['asset'])) : 'BTC';
if (!array_key_exists($preselectedAsset, $currentPrices)) {
    $preselectedAsset = 'BTC';
}
?>
<?php
$active_page = 'trade';
require_once __DIR__ . '/includes/header.php';
?>

<link rel="stylesheet" href="assets/css/trade.css?v=<?= time() ?>">

<div class="trade-heading">
  <div>
    <div class="section-kicker"><span class="live-dot" style="display:inline-block; width:6px; height:6px; background:#5de3ca; border-radius:50%; margin-right:4px; box-shadow: 0 0 8px #5de3ca; animation: pulse 2s infinite;"></span> PAPER TRADING SIMULATION</div>
    <h1>Trade <em>with intent.</em></h1>
    <p>Practice reading the market, placing orders, and managing risk without real money.</p>
  </div>
  <div class="paper-balance">
    <i data-lucide="wallet" style="width: 16px; height: 16px;"></i>
    <span>Paper balance</span>
    <strong id="head-balance-val">$<?= number_format($portfolioTotal, 2) ?></strong>
    <small id="head-pnl-val" style="color: <?= $pnlDollar >= 0 ? 'var(--mint)' : '#ef7f9b' ?>;">
      <?= $pnlDollar >= 0 ? '+' : '' ?>$<?= number_format($pnlDollar, 2) ?> all-time
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
              <span id="selected-asset-text"><?= $preselectedAsset ?> / USDC</span>
              <i data-lucide="chevron-down" style="width: 15px; height: 15px;"></i>
            </div>
            <div class="dropdown-options" id="dropdown-options-list">
              <?php foreach ($currentPrices as $sym => $pr): ?>
                <div class="dropdown-option <?= $sym === $preselectedAsset ? 'active' : '' ?>" onclick="selectAsset(event, '<?= $sym ?>')">
                  <?= $sym ?> / USDC
                </div>
              <?php endforeach; ?>
            </div>
          </div>
          <input type="hidden" id="trade-asset" value="<?= $preselectedAsset ?>">
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
      <button class="icon-button" aria-label="Reset Sandbox" onclick="resetSandbox()" title="Reset Sandbox to $100k">
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
        <h2 id="order-pair-title"><?= $preselectedAsset ?> / USDC</h2>
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
          <strong id="available-balance-disp">$<?= number_format($virtualCash, 2) ?> USDC</strong>
        </div>

        <label class="trade-field">
          Price <span>USDC</span>
          <input id="trade-price-input" value="0.00" readOnly />
        </label>

        <label class="trade-field">
          Amount <span id="amount-asset-label"><?= $preselectedAsset ?></span>
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
          Buy <?= $preselectedAsset ?> <i data-lucide="arrow-up" style="width: 15px; height: 15px;"></i>
        </button>
        <div id="trade-result-msg" style="margin-top: 0.75rem; text-align: center; font-size: 0.8125rem; font-weight: 700;"></div>

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
    <a href="markets.php">View markets <i data-lucide="arrow-up" style="width: 14px; height: 14px;"></i></a>
  </div>
  
  <div class="portfolio-overview">
    <div>
      <span class="muted-label">ESTIMATED TOTAL</span>
      <strong id="est-total-val">$<?= number_format($portfolioTotal, 2) ?></strong>
      <span id="est-pnl-val" class="<?= $pnlDollar >= 0 ? 'market-positive' : 'market-negative' ?>">
        <i data-lucide="<?= $pnlDollar >= 0 ? 'arrow-up' : 'arrow-down' ?>" style="width: 13px; height: 13px;"></i> 
        <?= $pnlDollar >= 0 ? '+' : '' ?><?= number_format($pnlPercent, 2) ?>% <small>all-time</small>
      </span>
    </div>
    <div>
      <span class="muted-label">AVAILABLE BALANCE</span>
      <strong>$<?= number_format($virtualCash, 2) ?> <small>USDC</small></strong>
      <span class="portfolio-muted"><?= number_format(($virtualCash / max(1, $portfolioTotal)) * 100, 2) ?>% of portfolio</span>
    </div>
    <div>
      <span class="muted-label">TOTAL PNL</span>
      <strong id="total-pnl-val" class="<?= $pnlDollar >= 0 ? 'market-positive' : '' ?>" style="<?= $pnlDollar < 0 ? 'color:#ef7f9b;' : '' ?>">
        <?= $pnlDollar >= 0 ? '+' : '' ?>$<?= number_format($pnlDollar, 2) ?>
      </strong>
      <span class="portfolio-muted">Since simulation start</span>
    </div>
    <div class="allocation">
      <span class="muted-label">ALLOCATION</span>
      <div class="allocation-bar">
        <?php foreach($allocations as $sym => $data): ?>
          <i style="background:<?= $data['color'] ?>; flex:<?= $data['pct'] ?>" title="<?= $sym ?> <?= number_format($data['pct'], 1) ?>%"></i>
        <?php endforeach; ?>
      </div>
      <small>
        <?php 
          $allocLabels = [];
          foreach($allocations as $sym => $data) {
              $allocLabels[] = $sym . ' ' . number_format($data['pct'], 0) . '%';
          }
          echo implode(' &middot; ', $allocLabels);
        ?>
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
    <?php if (empty($holdings)): ?>
      <div style="padding: 20px; color: #77758a; text-align: center; font-size: 11px;">No assets held.</div>
    <?php else: ?>
      <?php foreach ($holdings as $h): 
        $sym = $h['asset_symbol'];
        $qty = (float)$h['quantity'];
        $avg = (float)$h['avg_buy_price'];
        $cur = $currentPrices[$sym] ?? $avg;
        $val = $qty * $cur;
        $pnl = ($cur - $avg) * $qty;
        $pnlPct = $avg > 0 ? (($cur - $avg) / $avg) * 100 : 0;
      ?>
      <div class="asset-row">
        <div class="asset-cell">
          <span class="market-coin" style="background:#3b3857; color:#fff; font-size:9px;"><?= substr($sym, 0, 1) ?></span>
          <div>
            <strong><?= htmlspecialchars($sym) ?></strong>
            <small><?= htmlspecialchars($sym) ?></small>
          </div>
        </div>
        <strong>$<?= number_format($avg, 2) ?></strong>
        <span class="<?= $pnl >= 0 ? 'market-positive' : 'market-negative' ?>">
           <?= $pnl >= 0 ? '+' : '' ?>$<?= number_format($pnl, 2) ?> (<?= number_format($pnlPct, 1) ?>%)
        </span>
        <span><?= number_format($qty, 4) ?></span>
        <strong>$<?= number_format($val, 2) ?></strong>
        <button class="asset-action" onclick="document.getElementById('trade-asset').value='<?= $sym ?>'; updateAssetPrice(); window.scrollTo(0,0);">Trade</button>
      </div>
      <?php endforeach; ?>
    <?php endif; ?>
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
    <?php if (empty($trades)): ?>
      <div style="padding: 20px; color: #77758a; text-align: center; font-size: 11px;">No recorded trades yet.</div>
    <?php else: ?>
      <?php foreach ($trades as $trade): ?>
      <div class="recent-row">
        <strong><?= htmlspecialchars($trade['asset_symbol']) ?> / USDC</strong>
        <span class="<?= $trade['trade_type'] === 'BUY' ? 'market-positive' : 'market-negative' ?>">
          <i data-lucide="<?= $trade['trade_type'] === 'BUY' ? 'arrow-down' : 'arrow-up' ?>" style="width: 13px; height: 13px;"></i> 
          <?= htmlspecialchars($trade['trade_type']) ?>
        </span>
        <span><?= number_format((float)$trade['quantity'], 4) ?></span>
        <span>$<?= number_format((float)$trade['price'], 2) ?></span>
        <span class="portfolio-muted"><i data-lucide="clock-3" style="width: 13px; height: 13px;"></i> <?= htmlspecialchars($trade['created_at']) ?></span>
        <span class="status-pill">Completed</span>
      </div>
      <?php endforeach; ?>
    <?php endif; ?>
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

  const prices = <?= json_encode($currentPrices) ?>;
  const assetNames = {
      'BTC': 'Bitcoin', 'ETH': 'Ethereum', 'BNB': 'BNB', 'SOL': 'Solana', 
      'XRP': 'XRP', 'ADA': 'Cardano', 'DOGE': 'Dogecoin', 'AVAX': 'Avalanche', 
      'LINK': 'Chainlink', 'DOT': 'Polkadot', 'MATIC': 'Polygon', 'LTC': 'Litecoin', 
      'SHIB': 'Shiba Inu', 'BCH': 'Bitcoin Cash', 'UNI': 'Uniswap', 'TRX': 'TRON', 
      'NEAR': 'NEAR Protocol', 'APT': 'Aptos', 'ARB': 'Arbitrum', 'FIL': 'Filecoin', 
      'FET': 'Fetch.ai', 'RNDR': 'Render', 'GRT': 'The Graph', 'IMX': 'Immutable', 
      'GALA': 'Gala', 'ENJ': 'Enjin Coin', 'PEPE': 'Pepe'
  };
  const holdings = <?= json_encode($holdings) ?>;
  let currentSide = 'BUY';
  let currentInterval = '1h';
  const availableCash = <?= (float)$virtualCash ?>;
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

    // Custom Marker Drawing (Trend lines)
    chart.subscribeClick(param => {
        if(!param.point || !param.time) return;
        const price = candlestickSeries.coordinateToPrice(param.point.y);
        const time = param.time;

        if (!drawingState.startPoint) {
            drawingState.startPoint = { time, value: price };
        } else {
            const endPoint = { time, value: price };
            const lineSeries = chart.addLineSeries({
                color: '#fff',
                lineWidth: 2,
                lineStyle: 1, // Dotted
                crosshairMarkerVisible: false,
                lastValueVisible: false,
                priceLineVisible: false
            });
            const p1 = drawingState.startPoint;
            const p2 = endPoint;
            const data = (p1.time < p2.time) ? [p1, p2] : [p2, p1];
            
            lineSeries.setData(data);
            drawingState.lines.push(lineSeries);
            drawingState.startPoint = null;
        }
    });

    // Right click to undo drawings
    container.addEventListener('contextmenu', e => {
        e.preventDefault();
        if (drawingState.startPoint) {
            drawingState.startPoint = null; // Cancel current draw
        } else if (drawingState.lines.length > 0) {
            const lastLine = drawingState.lines.pop();
            chart.removeSeries(lastLine);
        }
    });

    // Initialize Depth Chart
    const depthContainer = document.getElementById('tv-depth-container');
    depthChart = LightweightCharts.createChart(depthContainer, {
      width: depthContainer.clientWidth,
      height: 380,
      layout: { backgroundColor: 'transparent', textColor: '#6e6b7f' },
      grid: { vertLines: { color: 'rgba(255, 255, 255, 0.03)' }, horzLines: { color: 'rgba(255, 255, 255, 0.03)' } },
      crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
      rightPriceScale: { borderColor: 'rgba(255, 255, 255, 0.1)' },
      timeScale: { borderColor: 'rgba(255, 255, 255, 0.1)' } // will hold prices instead of time
    });

    bidsSeries = depthChart.addAreaSeries({
        lineColor: '#5de3ca',
        topColor: 'rgba(93, 227, 202, 0.4)',
        bottomColor: 'rgba(93, 227, 202, 0.0)',
        lineWidth: 2,
        priceFormat: { type: 'volume' }
    });
    
    asksSeries = depthChart.addAreaSeries({
        lineColor: '#ef7f9b',
        topColor: 'rgba(239, 127, 155, 0.4)',
        bottomColor: 'rgba(239, 127, 155, 0.0)',
        lineWidth: 2,
        priceFormat: { type: 'volume' }
    });

    window.addEventListener('resize', () => {
        chart.resize(container.clientWidth, 380);
        depthChart.resize(depthContainer.clientWidth, 380);
    });
  }

  function switchChartTab(tab) {
      currentTab = tab;
      const btnChart = document.getElementById('tab-chart');
      const btnDepth = document.getElementById('tab-depth');
      const chartContainer = document.getElementById('tv-chart-container');
      const depthContainer = document.getElementById('tv-depth-container');
      const indicatorStrip = document.querySelector('.indicator-strip');
      const timeframeButtons = document.getElementById('timeframe-buttons');

      if (tab === 'chart') {
          btnChart.classList.add('active');
          btnDepth.classList.remove('active');
          chartContainer.style.display = 'block';
          depthContainer.style.display = 'none';
          indicatorStrip.style.display = 'flex';
          timeframeButtons.style.visibility = 'visible';
          
          // Re-fetch kline data to ensure it's up to date and websocket is active
          const sym = document.getElementById('trade-asset').value;
          fetchKlineData(sym, currentInterval);
      } else {
          btnDepth.classList.add('active');
          btnChart.classList.remove('active');
          chartContainer.style.display = 'none';
          depthContainer.style.display = 'block';
          indicatorStrip.style.display = 'none';
          timeframeButtons.style.visibility = 'hidden';
          
          if (socket) socket.close(); // Stop kline websocket to save resources
          const sym = document.getElementById('trade-asset').value;
          fetchDepthData(sym);
          depthChart.timeScale().fitContent();
      }
  }

  function fetchDepthData(symbol) {
      fetch(`https://api.binance.com/api/v3/depth?symbol=${symbol}USDT&limit=100`)
        .then(res => res.json())
        .then(data => {
            let bidsAcc = 0;
            const bidsData = data.bids.map(b => {
                const price = parseFloat(b[0]);
                const qty = parseFloat(b[1]);
                bidsAcc += qty;
                return { time: price, value: bidsAcc };
            }).reverse(); // Reverse so prices go from low to high

            let asksAcc = 0;
            const asksData = data.asks.map(a => {
                const price = parseFloat(a[0]);
                const qty = parseFloat(a[1]);
                asksAcc += qty;
                return { time: price, value: asksAcc };
            });

            bidsSeries.setData(bidsData);
            asksSeries.setData(asksData);
            depthChart.timeScale().fitContent();
        })
        .catch(err => console.error("Could not fetch depth data", err));
  }

  function calculateSMA(data, period) {
      const result = [];
      for (let i = 0; i < data.length; i++) {
          if (i < period - 1) continue;
          let sum = 0;
          for (let j = 0; j < period; j++) sum += data[i - j].close;
          result.push({ time: data[i].time, value: sum / period });
      }
      return result;
  }

  function fetchKlineData(symbol, interval = '1h') {
    if (socket) {
      socket.close();
    }
    
    // Clear old drawing lines on asset/interval change
    drawingState.lines.forEach(line => chart.removeSeries(line));
    drawingState.lines = [];
    drawingState.startPoint = null;

    fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=${interval}&limit=500`)
      .then(res => res.json())
      .then(data => {
          const formattedData = data.map(d => ({
              time: d[0] / 1000,
              open: parseFloat(d[1]),
              high: parseFloat(d[2]),
              low: parseFloat(d[3]),
              close: parseFloat(d[4])
          }));
          
          const volumeData = data.map(d => ({
              time: d[0] / 1000,
              value: parseFloat(d[5]),
              color: parseFloat(d[4]) >= parseFloat(d[1]) ? 'rgba(93, 227, 202, 0.4)' : 'rgba(239, 127, 155, 0.4)'
          }));

          candlestickSeries.setData(formattedData);
          volumeSeries.setData(volumeData);
          
          ma20Series.setData(calculateSMA(formattedData, 20));
          ma50Series.setData(calculateSMA(formattedData, 50));

          // Connect websocket for live updates
          socket = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}usdt@kline_${interval}`);
          socket.onmessage = function (event) {
              const message = JSON.parse(event.data);
              const kline = message.k;
              const isUp = parseFloat(kline.c) >= parseFloat(kline.o);
              
              candlestickSeries.update({
                  time: kline.t / 1000,
                  open: parseFloat(kline.o),
                  high: parseFloat(kline.h),
                  low: parseFloat(kline.l),
                  close: parseFloat(kline.c)
              });
              
              volumeSeries.update({
                  time: kline.t / 1000,
                  value: parseFloat(kline.v),
                  color: isUp ? 'rgba(93, 227, 202, 0.4)' : 'rgba(239, 127, 155, 0.4)'
              });
              
              // Note: Live updating MAs for the current incomplete candle requires a bit more logic,
              // for simplicity and performance we rely on the static SMA lines for historical and just update candles.
              
              const closePrice = parseFloat(kline.c);
              const openPrice = parseFloat(kline.o);
              const change = ((closePrice - openPrice) / openPrice) * 100;
              
              document.getElementById('live-price-disp').textContent = '$' + closePrice.toLocaleString(undefined, {minimumFractionDigits:2});
              prices[symbol] = closePrice; // update local mock price
              document.getElementById('trade-price-input').value = closePrice.toFixed(2);
              
              const changeDisp = document.getElementById('live-price-change');
              changeDisp.textContent = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
              changeDisp.className = change >= 0 ? 'market-positive' : 'market-negative';
              
              document.getElementById('stat-high').textContent = '$' + parseFloat(kline.h).toLocaleString();
              document.getElementById('stat-low').textContent = '$' + parseFloat(kline.l).toLocaleString();
              document.getElementById('stat-vol').textContent = parseFloat(kline.v).toLocaleString(undefined, {maximumFractionDigits:0});
              
              calculateTotal();
              updatePortfolioRealTime();
          };
      })
      .catch(err => console.error("Could not fetch kline data", err));
  }

  function updatePortfolioRealTime() {
      let currentVal = 0;
      holdings.forEach(h => {
          const sym = h.asset_symbol;
          const pr = prices[sym] || parseFloat(h.avg_buy_price);
          currentVal += (parseFloat(h.quantity) * pr);
      });
      
      const total = availableCash + currentVal;
      const pnlDollar = total - 100000.00;
      const pnlPercent = (pnlDollar / 100000.00) * 100.0;
      
      document.getElementById('est-total-val').textContent = '$' + total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
      document.getElementById('head-balance-val').textContent = '$' + total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
      
      const pnlPrefix = pnlDollar >= 0 ? '+' : '';
      const pnlColor = pnlDollar >= 0 ? 'market-positive' : 'market-negative';
      const headColor = pnlDollar >= 0 ? 'var(--mint)' : '#ef7f9b';
      
      const estPnl = document.getElementById('est-pnl-val');
      estPnl.className = pnlColor;
      estPnl.innerHTML = `<i data-lucide="${pnlDollar >= 0 ? 'arrow-up' : 'arrow-down'}" style="width: 13px; height: 13px;"></i> ${pnlPrefix}${pnlPercent.toFixed(2)}% <small>all-time</small>`;
      
      const headPnl = document.getElementById('head-pnl-val');
      headPnl.style.color = headColor;
      headPnl.textContent = `${pnlPrefix}$${pnlDollar.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} all-time`;
      
      const totPnl = document.getElementById('total-pnl-val');
      totPnl.className = pnlDollar >= 0 ? 'market-positive' : '';
      totPnl.style.color = pnlDollar < 0 ? '#ef7f9b' : '';
      totPnl.textContent = `${pnlPrefix}$${pnlDollar.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
      
      if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function toggleDropdown(e) {
      document.getElementById('asset-dropdown').classList.toggle('open');
  }

  function selectAsset(e, sym) {
      e.stopPropagation();
      document.getElementById('trade-asset').value = sym;
      document.getElementById('selected-asset-text').textContent = sym + ' / USDC';
      
      const options = document.querySelectorAll('.dropdown-option');
      options.forEach(opt => opt.classList.remove('active'));
      e.currentTarget.classList.add('active');
      
      document.getElementById('asset-dropdown').classList.remove('open');
      
      updateAssetPrice();
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
      const dropdown = document.getElementById('asset-dropdown');
      if (dropdown && !dropdown.contains(e.target)) {
          dropdown.classList.remove('open');
      }
  });

  // Timeframe listeners
  document.querySelectorAll('#timeframe-buttons button[data-interval]').forEach(btn => {
      btn.addEventListener('click', (e) => {
          document.querySelectorAll('#timeframe-buttons button').forEach(b => b.classList.remove('active'));
          e.currentTarget.classList.add('active');
          currentInterval = e.currentTarget.dataset.interval;
          const sym = document.getElementById('trade-asset').value;
          fetchKlineData(sym, currentInterval);
      });
  });

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
      btnSubmit.innerHTML = `Buy ${sym} <i data-lucide="arrow-up" style="width: 15px; height: 15px;"></i>`;
      availDisp.textContent = '$' + availableCash.toLocaleString(undefined, {minimumFractionDigits: 2}) + ' USDC';
    } else {
      btnSell.classList.add('active', 'sell');
      btnBuy.classList.remove('active', 'buy');
      btnSubmit.className = 'place-order sell';
      btnSubmit.innerHTML = `Sell ${sym} <i data-lucide="arrow-down" style="width: 15px; height: 15px;"></i>`;
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
      const res = await fetch('/api/trade_execute.php', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        msgDiv.innerHTML = `<span style="color: #5de3ca;">✓ ${data.message}</span>`;
        setTimeout(() => location.reload(), 1200);
      } else {
        msgDiv.innerHTML = `<span style="color: #F43F5E;">✕ ${data.error}</span>`;
      }
    } catch (err) {
      msgDiv.innerHTML = '<span style="color: #F43F5E;">✕ Execution error.</span>';
    }
  }

  async function resetSandbox() {
    if (!confirm('Reset your paper wallet back to $100,000 USD? All virtual positions will be liquidated.')) return;
    try {
      const res = await fetch('/api/wallet_reset.php', { method: 'POST' });
      const data = await res.json();
      if (data.success) location.reload();
    } catch (e) {
      alert('Reset failed.');
    }
  }

  // Initialize
  initChart();
  updateAssetPrice();
</script>
</body>
</html>
