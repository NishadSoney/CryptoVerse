<?php
/**
 * CryptoVerse - Live Market Overview
 * Location: markets.php
 */

declare(strict_types=1);

require_once __DIR__ . '/config/config.php';
$active_page = 'markets';
require_once __DIR__ . '/includes/header.php';
?>

<!-- No need for <main class="markets-shell"> because header.php already wraps the content,
     but we need to ensure the styles from .markets-shell are applied. 
     We'll just wrap the content below in a div that acts as the shell's content area -->

<link rel="stylesheet" href="assets/css/markets.css">
<div class="markets-shell">
    <div class="markets-content">
      
      <!-- HERO -->
      <div class="markets-hero">
        <div>
            <div class="section-kicker"><span class="live-dot" style="display:inline-block; width:6px; height:6px; background:#5de3ca; border-radius:50%; margin-right:4px; box-shadow: 0 0 8px #5de3ca; animation: pulse 2s infinite;"></span> SIMULATED MARKET DATA</div>
            <h1>Market <em>overview.</em></h1>
            <p>Explore live-style crypto data and learn how traders read the market. No real money or trading involved.</p>
        </div>
        <div class="market-total">
            <span class="muted-label" style="font-size:0.6875rem; color:#8c899c;">TOTAL MARKET CAP</span>
            <strong id="hero-total-cap" style="font-size:28px; font-weight:500;">$0.00T</strong>
            <span id="hero-total-change" class="market-positive" style="display:flex; align-items:center; gap:4px;"><i data-lucide="arrow-up" style="width:13px; height:13px;"></i> 0.00% today</span>
        </div>
      </div>
      
      <div class="market-tabs">
        <button id="tab-overview" class="selected">Overview</button>
        <button id="tab-trading-data">Trading data</button>
        <button id="tab-token-unlock">Token unlock</button>
      </div>
      
      <!-- SPOTLIGHT CARDS -->
      <section id="overview-grid" class="spotlight-grid">
        
        <!-- Hot -->
        <article class="spotlight-card">
            <div class="spotlight-heading"><strong>Hot</strong><button>More <span>›</span></button></div>
            <div id="spotlight-hot"></div>
        </article>

        <!-- New -->
        <article class="spotlight-card">
            <div class="spotlight-heading"><strong>New</strong><button>More <span>›</span></button></div>
            <div id="spotlight-new"></div>
        </article>

        <!-- Top Gainer -->
        <article class="spotlight-card">
            <div class="spotlight-heading"><strong>Top gainer</strong><button>More <span>›</span></button></div>
            <div id="spotlight-gainers"></div>
        </article>

        <!-- Top Volume -->
        <article class="spotlight-card">
            <div class="spotlight-heading"><strong>Top volume</strong><button>More <span>›</span></button></div>
            <div id="spotlight-volume"></div>
        </article>

      </section>

      <!-- TRADING DATA CARDS -->
      <section id="trading-data-grid" class="spotlight-grid" style="display:none;">
        <article class="spotlight-card">
            <div class="spotlight-heading"><strong>Top Losers</strong><button>More <span>›</span></button></div>
            <div id="spotlight-losers"></div>
        </article>
        <article class="spotlight-card">
            <div class="spotlight-heading"><strong>High Volatility</strong><button>More <span>›</span></button></div>
            <div id="spotlight-volatility"></div>
        </article>
        <article class="spotlight-card">
            <div class="spotlight-heading"><strong>High Turnover</strong><button>More <span>›</span></button></div>
            <div id="spotlight-turnover"></div>
        </article>
        <article class="spotlight-card">
            <div class="spotlight-heading"><strong>Most Trades</strong><button>More <span>›</span></button></div>
            <div id="spotlight-trades"></div>
        </article>
      </section>

      <!-- TOKEN UNLOCK CARDS -->
      <section id="token-unlock-grid" class="spotlight-grid" style="display:none;">
        <article class="spotlight-card">
            <div class="spotlight-heading"><strong>Upcoming Unlocks</strong><button>More <span>›</span></button></div>
            <div class="spotlight-row">
                <span class="coin-icon" style="background:#28a0f0; color:#191525">A</span>
                <div><strong>ARB</strong><span>Arbitrum</span></div>
                <div style="text-align:right">
                    <b style="color:#FFF; display:block;">$87.5M</b>
                    <span style="color:#f3ad45; font-size:10px;">In 3 Days</span>
                </div>
            </div>
            <div class="spotlight-row">
                <span class="coin-icon" style="background:#66dfc9; color:#191525">S</span>
                <div><strong>SOL</strong><span>Solana</span></div>
                <div style="text-align:right">
                    <b style="color:#FFF; display:block;">$42.1M</b>
                    <span style="color:#f3ad45; font-size:10px;">In 5 Days</span>
                </div>
            </div>
            <div class="spotlight-row">
                <span class="coin-icon" style="background:#0a649d; color:#191525">I</span>
                <div><strong>IMX</strong><span>Immutable</span></div>
                <div style="text-align:right">
                    <b style="color:#FFF; display:block;">$12.3M</b>
                    <span style="color:#f3ad45; font-size:10px;">In 8 Days</span>
                </div>
            </div>
        </article>
        <article class="spotlight-card" style="grid-column: span 2;">
            <div class="spotlight-heading"><strong>Recent Unlocks</strong><button>More <span>›</span></button></div>
            <div style="display:flex; gap:16px;">
                <div style="flex:1; background:rgba(255,255,255,0.02); border-radius:6px; padding:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span class="coin-icon" style="background:#111; color:#FFF; width:24px; height:24px; font-size:12px;">A</span>
                            <span style="color:#FFF; font-weight:500;">Aptos</span>
                        </div>
                        <span style="color:#817e90; font-size:10px;">Unlocked Yesterday</span>
                    </div>
                    <div style="color:#5de3ca; font-size:20px; font-family:'Space Mono', monospace;">$24.5M</div>
                    <div style="color:#817e90; font-size:11px; margin-top:4px;">1.5% of Circulating Supply</div>
                </div>
                <div style="flex:1; background:rgba(255,255,255,0.02); border-radius:6px; padding:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span class="coin-icon" style="background:#8f2323; color:#191525; width:24px; height:24px; font-size:12px;">R</span>
                            <span style="color:#FFF; font-weight:500;">Render</span>
                        </div>
                        <span style="color:#817e90; font-size:10px;">Unlocked 3 days ago</span>
                    </div>
                    <div style="color:#5de3ca; font-size:20px; font-family:'Space Mono', monospace;">$18.2M</div>
                    <div style="color:#817e90; font-size:11px; margin-top:4px;">0.8% of Circulating Supply</div>
                </div>
            </div>
        </article>
        <article class="spotlight-card">
            <div class="spotlight-heading"><strong>Vesting Progress</strong><button>More <span>›</span></button></div>
            <div style="margin-top:16px;">
                <div style="display:flex; justify-content:space-between; color:#FFF; font-size:12px; margin-bottom:8px;">
                    <span>SUI Vesting</span>
                    <span>45% Unlocked</span>
                </div>
                <div style="width:100%; height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;">
                    <div style="width:45%; height:100%; background:#8497f5;"></div>
                </div>
                <div style="color:#817e90; font-size:10px; margin-top:8px;">Next cliff: 12% in 24 days</div>
            </div>
        </article>
      </section>
      
      <!-- MARKET TABLE -->
      <section class="market-table-card">
        <div class="market-table-top">
            <div>
                <div class="section-kicker" style="font-size:10px; color:#817e90; letter-spacing:0.1em; margin-bottom:4px;">CRYPTO ASSETS</div>
                <h2 style="font-size:23px; font-weight:500; margin:0 0 6px 0;">Top tokens by market capitalization</h2>
                <p style="color:#817e90; font-size:11px; margin:0;">A clear snapshot of prices, momentum, volume, and market behavior.</p>
            </div>
            <div class="market-tools">
                <button id="open-compare-btn" style="background:transparent; border:1px solid rgba(255,255,255,0.11); border-radius:4px; color:#aaa7b8; display:flex; align-items:center; gap:7px; padding:10px 12px; font-size:10px; cursor:pointer; transition:all 0.2s;"><i data-lucide="bar-chart-3" style="width:14px; height:14px;"></i> Compare</button>
            </div>
        </div>
        
        <div class="asset-tabs">
            <button class="selected">Favorites</button>
            <button class="selected strong">Cryptos</button>
            <button>Spot</button>
            <button>Futures</button>
            <button>TradFi</button>
            <button>New</button>
            <button>Zones</button>
            <label style="display:flex; align-items:center; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.11); border-radius:4px; color:#777489; margin-left:auto; padding:8px 10px; gap:7px;">
                <i data-lucide="search" style="width:14px; height:14px;"></i>
                <input id="coin-search-input" placeholder="Search coin name" style="background:none; border:0; color:#FFF; font-size:10px; outline:0; width:125px;" />
            </label>
        </div>
        
        <div class="category-tabs">
            <button class="selected">All</button>
            <button>Layer 1 / Layer 2</button>
            <button>DeFi</button>
            <button>AI</button>
            <button>Gaming</button>
            <button>Payments</button>
            <button>MEME</button>
        </div>
        
        <div class="asset-table" role="table" aria-label="Cryptocurrency market prices">
            <div class="asset-head" role="row">
                <span>Name</span>
                <span>Price</span>
                <span>24h change</span>
                <span>24h volume</span>
                <span>7D trend</span>
                <span></span>
            </div>
            
            <div id="market-table-body">
                <!-- Populated by JS -->
                <div style="padding:4rem; text-align:center; color:#94A3B8; font-size:14px; grid-column:1/-1;">
                    <i data-lucide="loader-2" style="width:24px; height:24px; animation:spin 1s linear infinite; margin-bottom:10px;"></i><br/>
                    Connecting to live market stream...
                </div>
            </div>
            
        </div>
      </section>
      
      <div class="market-disclaimer" style="display:flex; align-items:center; gap:9px; color:#777489; font-size:10px; margin-top:24px;">
        <i data-lucide="trending-up" style="width:16px; height:16px; color:#5de3ca;"></i>
        <span>Prices update in simulation mode. Use these views to practice spotting patterns, not to predict the future.</span>
        <i data-lucide="wallet" style="width:16px; height:16px; color:#a294ff; margin-left:auto;"></i>
        <span>Educational only</span>
      </div>
      
    </div>
</div>

<!-- STUDY MODAL -->
<div id="study-modal" class="study-modal-overlay" style="display:none;">
    <div class="study-modal-content">
        <button id="close-modal" class="study-modal-close"><i data-lucide="x" style="width:20px; height:20px;"></i></button>
        <div class="study-modal-header">
            <div id="study-asset-title" style="display:flex; align-items:center; gap:12px; font-size:24px; font-weight:600; color:#FFF;">
                <!-- Injected via JS -->
            </div>
            <div id="study-asset-price" style="position:absolute; left:50%; transform:translateX(-50%); text-align:center;">
                <!-- Injected via JS -->
            </div>
        </div>
        <div class="study-modal-body">
            <div id="study-chart-container" style="width: 100%; height: 350px; margin-bottom: 20px;"></div>
            <div class="study-analysis-grid">
                <div class="study-stat-box">
                    <span>24h High</span>
                    <strong id="study-stat-high">--</strong>
                </div>
                <div class="study-stat-box">
                    <span>24h Low</span>
                    <strong id="study-stat-low">--</strong>
                </div>
                <div class="study-stat-box">
                    <span>24h Volume</span>
                    <strong id="study-stat-vol">--</strong>
                </div>
                <div class="study-stat-box">
                    <span>Analysis</span>
                    <strong id="study-stat-trend">--</strong>
                </div>
                <div class="study-stat-box">
                    <span>Avg Price</span>
                    <strong id="study-stat-avg">--</strong>
                </div>
                <div class="study-stat-box">
                    <span>Total Trades</span>
                    <strong id="study-stat-trades">--</strong>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- COMPARE MODAL -->
<div id="compare-modal" class="study-modal-overlay" style="display:none;">
    <div class="study-modal-content compare-modal-content">
        <button id="close-compare-modal" class="study-modal-close"><i data-lucide="x" style="width:20px; height:20px;"></i></button>
        
        <div class="compare-header">
            <h3 style="margin:0; font-size:20px; font-weight:500;">Compare Assets</h3>
            <div class="compare-selectors">
                <div class="compare-select-wrapper">
                    <span class="compare-dot" style="background:#8d7aff;"></span>
                    <select id="compare-coin-a" class="compare-dropdown">
                        <!-- Populated by JS -->
                    </select>
                </div>
                <span style="color:#817e90; font-size:12px;">VS</span>
                <div class="compare-select-wrapper">
                    <span class="compare-dot" style="background:#5de3ca;"></span>
                    <select id="compare-coin-b" class="compare-dropdown">
                        <!-- Populated by JS -->
                    </select>
                </div>
            </div>
        </div>

        <div class="study-modal-body">
            <!-- Normalised % Chart -->
            <div id="compare-chart-container" style="width: 100%; height: 320px; margin-bottom: 20px;"></div>
            
            <!-- Side-by-side Stats Grid -->
            <div class="compare-analysis-grid">
                <!-- Coin A Stats -->
                <div class="compare-stat-col" id="compare-col-a" style="border-left: 3px solid #8d7aff;">
                    <div class="compare-stat-item">
                        <span>Market Price</span>
                        <strong id="cmp-price-a">--</strong>
                    </div>
                    <div class="compare-stat-item">
                        <span>24h Growth</span>
                        <strong id="cmp-growth-a">--</strong>
                    </div>
                    <div class="compare-stat-item">
                        <span>24h Volume</span>
                        <strong id="cmp-vol-a">--</strong>
                    </div>
                </div>
                
                <!-- Coin B Stats -->
                <div class="compare-stat-col" id="compare-col-b" style="border-left: 3px solid #5de3ca;">
                    <div class="compare-stat-item">
                        <span>Market Price</span>
                        <strong id="cmp-price-b">--</strong>
                    </div>
                    <div class="compare-stat-item">
                        <span>24h Growth</span>
                        <strong id="cmp-growth-b">--</strong>
                    </div>
                    <div class="compare-stat-item">
                        <span>24h Volume</span>
                        <strong id="cmp-vol-b">--</strong>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
@keyframes spin { 100% { transform: rotate(360deg); } }
@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
/* Flash Animations */
@keyframes flashGreen { 0% { background-color: rgba(93, 227, 202, 0.15); } 100% { background-color: transparent; } }
@keyframes flashRed { 0% { background-color: rgba(244, 63, 94, 0.15); } 100% { background-color: transparent; } }
.flash-up { animation: flashGreen 1s ease-out; }
.flash-down { animation: flashRed 1s ease-out; }

/* Study Modal Styles */
.study-modal-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(8, 9, 20, 0.85); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.study-modal-content {
    background: #111024; border: 1px solid rgba(141,122,255,0.25); border-radius: 12px;
    width: 90%; max-width: 800px; padding: 24px; position: relative;
    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
}
.study-modal-close {
    position: absolute; top: 20px; right: 20px; background: none; border: none;
    color: #8c899c; cursor: pointer; transition: color 0.2s;
}
.study-modal-close:hover { color: #FFF; }
.study-modal-header {
    display: flex; align-items: center; position: relative; min-height: 50px;
    border-bottom: 1px solid rgba(255,255,255,0.07); padding-bottom: 16px; margin-bottom: 20px;
}
.study-analysis-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
}
.study-stat-box {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 4px;
}
.study-stat-box span { color: #777489; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
.study-stat-box strong { color: #FFF; font-size: 14px; font-weight: 500; font-family: 'Space Mono', monospace; }

/* Compare Modal Styles */
.compare-header {
    display: flex; flex-direction: column; gap: 16px;
    border-bottom: 1px solid rgba(255,255,255,0.07); padding-bottom: 20px; margin-bottom: 20px;
}
.compare-selectors {
    display: flex; align-items: center; gap: 16px;
}
.compare-select-wrapper {
    display: flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.11);
    padding: 6px 12px; border-radius: 6px;
}
.compare-dot {
    width: 8px; height: 8px; border-radius: 50%;
}
.compare-dropdown {
    background: transparent; border: none; color: #FFF; font-size: 14px; font-weight: 500; outline: none; cursor: pointer;
}
.compare-dropdown option {
    background: #111024; color: #FFF;
}
.compare-analysis-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
}
.compare-stat-col {
    background: rgba(255,255,255,0.02); border-radius: 8px; padding: 16px;
    display: flex; flex-direction: column; gap: 16px;
}
.compare-stat-item {
    display: flex; justify-content: space-between; align-items: center;
    border-bottom: 1px dashed rgba(255,255,255,0.05); padding-bottom: 8px;
}
.compare-stat-item:last-child {
    border-bottom: none; padding-bottom: 0;
}
.compare-stat-item span { color: #8c899c; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
.compare-stat-item strong { color: #FFF; font-size: 14px; font-family: 'Space Mono', monospace; }
  /* Custom styling for chart */
  #compare-chart-container {
      width: 100%;
      height: 350px;
      margin-top: 15px;
  }
  
  /* Hide the TradingView watermark/logo in Lightweight Charts */
  #compare-chart-container a, 
  #compare-chart-container svg,
  .tv-lightweight-charts table a,
  .tv-lightweight-charts-watermark,
  #tv-attr-logo {
      display: none !important;
  }
</style>

<!-- Lightweight Charts -->
<script src="https://unpkg.com/lightweight-charts@3.8.0/dist/lightweight-charts.standalone.production.js"></script>
<script src="assets/js/market-hub.js?v=<?= time() ?>"></script>

<script>
  if (window.lucide) {
    lucide.createIcons();
  }
</script>
</body>
</html>
