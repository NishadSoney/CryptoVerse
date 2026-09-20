<?php
/**
 * CryptoVerse - Dashboard
 * Location: dashboard.php
 */

declare(strict_types=1);

require_once __DIR__ . '/config/config.php';
$active_page = 'home';
require_once __DIR__ . '/includes/header.php';

// Progression Logic based on XP
if ($xp == 0) {
    $progress_label = "0 of 6 complete";
    $progress_percent = 0;
    $lesson_tag = "FOUNDATIONS A LESSON 01";
    $lesson_title = "What is cryptocurrency?";
    $lesson_desc = "Start your journey by learning the absolute basics of digital money.";
    $lesson_time = "8 minutes";
    $xp_to_next = 60;
} else {
    $progress_label = "2 of 6 complete";
    $progress_percent = 33;
    $lesson_tag = "BLOCKCHAIN A LESSON 02";
    $lesson_title = "How blockchains keep score";
    $lesson_desc = "Understand the shared ledger that makes crypto work.";
    $lesson_time = "12 minutes";
    $xp_to_next = 60 - ($xp % 60);
    if ($xp_to_next == 60 && $xp > 0) $xp_to_next = 0; // if exactly on level boundary
}

// Calculate XP bar percentage
$xp_percent = 0;
if ($xp > 0) {
    $xp_percent = ($xp % 60) / 60 * 100;
    if ($xp_percent == 0) $xp_percent = 100; // full bar if exactly on boundary
}
?>

    <section class="dashboard-grid">
      <article class="continue-card">
        <div class="card-topline">
          <span class="section-kicker">CONTINUE LEARNING</span>
          <span class="progress-label"><?= $progress_label ?></span>
        </div>
        <div class="progress-track">
          <span style="width: <?= $progress_percent ?>%"></span>
        </div>
        <div class="continue-body">
          <div class="lesson-art">
            <i data-lucide="book-open" style="width: 28px; height: 28px;"></i>
          </div>
          <div>
            <span class="lesson-tag"><?= $lesson_tag ?></span>
            <h2><?= $lesson_title ?></h2>
            <p><?= $lesson_desc ?></p>
            <div class="lesson-meta">
              <i data-lucide="clock-3" style="width: 14px; height: 14px;"></i> <?= $lesson_time ?>
            </div>
          </div>
          <a href="learn.php" class="button button-small">Continue <i data-lucide="arrow-right" style="width: 15px; height: 15px;"></i></a>
        </div>
      </article>

      <article class="xp-card">
        <div class="xp-ring">
          <strong><?= $xp ?></strong>
          <span>XP</span>
        </div>
        <div>
          <span class="section-kicker">YOUR PROGRESS</span>
          <h3>Curious mind</h3>
          <p><?= $xp_to_next ?> XP until your next level.</p>
        </div>
        <div class="xp-bar">
          <span style="width: <?= $xp_percent ?>%"></span>
        </div>
      </article>
    </section>

    <!-- NEW: Live Market Insights -->
    <section class="dashboard-markets">
      <div class="panel-heading" style="margin-bottom: 25px;">
        <div>
          <div class="section-kicker"><i data-lucide="zap" style="width: 14px; height: 14px; margin-right: 4px; display:inline-block; vertical-align:-3px;"></i> LIVE SIMULATION</div>
          <h2>Market insights</h2>
          <p style="color: #838091; font-size: 11px; margin-top: 5px;">Understand the market without the noise.</p>
        </div>
        <div class="updated-badge"><i data-lucide="refresh-cw" style="width: 12px; height: 12px; margin-right:4px;"></i> UPDATED JUST NOW</div>
      </div>
      
      <div class="market-insights-grid">
        <!-- Coin List -->
        <div class="coin-list" id="dashboard-coin-list">
          <div class="coin-row active" data-coin="BTC">
            <div class="coin-icon" style="background: #F7931A; color: #fff;">B</div>
            <div class="coin-info">
              <strong>BTC</strong>
              <span>Bitcoin</span>
            </div>
            <div class="coin-price">
              <strong id="price-BTC">--</strong>
              <span class="change positive" id="change-BTC">--</span>
            </div>
          </div>
          <div class="coin-row" data-coin="ETH">
            <div class="coin-icon" style="background: #627EEA; color: #fff;">E</div>
            <div class="coin-info">
              <strong>ETH</strong>
              <span>Ethereum</span>
            </div>
            <div class="coin-price">
              <strong id="price-ETH">--</strong>
              <span class="change positive" id="change-ETH">--</span>
            </div>
          </div>
          <div class="coin-row" data-coin="SOL">
            <div class="coin-icon" style="background: #14F195; color: #111;">S</div>
            <div class="coin-info">
              <strong>SOL</strong>
              <span>Solana</span>
            </div>
            <div class="coin-price">
              <strong id="price-SOL">--</strong>
              <span class="change negative" id="change-SOL">--</span>
            </div>
          </div>
        </div>
        
        <!-- Graph Area -->
        <div class="market-chart-area">
          <div class="chart-header">
            <div>
              <span class="chart-pair" id="chart-pair-label">BTC / USD</span>
              <h3 id="chart-current-price">--</h3>
            </div>
            <div style="display:flex; flex-direction:column; align-items:flex-end; gap: 8px;">
              <div class="chart-change positive" id="chart-current-change">--</div>
              <div class="chart-toggle-group">
                <button class="chart-toggle active" data-type="line">Line</button>
                <button class="chart-toggle" data-type="candle">Candles</button>
              </div>
            </div>
          </div>
          <div class="chart-container" style="position: relative; height: 200px; width: 100%;">
            <div id="tvchart" style="width: 100%; height: 100%;"></div>
          </div>
        </div>
      </div>
    </section>
    
    <section class="dashboard-lower" id="learn">

      <div class="lessons-panel">
        <div class="panel-heading">
          <div>
            <div class="section-kicker">YOUR PATH</div>
            <h2>Learning journey</h2>
          </div>
          <a href="learn.php">View all <i data-lucide="arrow-right" style="width: 15px; height: 15px;"></i></a>
        </div>
        <div class="lesson-list">
          <?php if ($xp == 0): ?>
            <div class="lesson-row selected">
              <span class="lesson-number">01</span>
              <div class="lesson-row-copy">
                <strong>What is cryptocurrency?</strong>
                <span>8 min &middot; Foundations</span>
              </div>
              <i data-lucide="play" fill="currentColor" style="width: 16px; height: 16px;"></i>
            </div>
            <div class="lesson-row">
              <span class="lesson-number"><i data-lucide="lock-keyhole" style="width: 14px; height: 14px;"></i></span>
              <div class="lesson-row-copy">
                <strong>How blockchains keep score</strong>
                <span>12 min &middot; Blockchain</span>
              </div>
            </div>
          <?php else: ?>
            <div class="lesson-row">
              <span class="lesson-number"><i data-lucide="check" style="width: 16px; height: 16px;"></i></span>
              <div class="lesson-row-copy">
                <strong>What is cryptocurrency?</strong>
                <span>8 min &middot; Foundations</span>
              </div>
              <span class="complete-label">COMPLETE</span>
            </div>
            <div class="lesson-row selected">
              <span class="lesson-number">02</span>
              <div class="lesson-row-copy">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <strong>How blockchains keep score</strong>
                  <span class="section-kicker" style="margin: 0; padding: 2px 6px; background: rgba(16, 185, 129, 0.2); color: var(--mint); border: 1px solid rgba(16, 185, 129, 0.3);">START HERE</span>
                </div>
                <span>12 min &middot; Blockchain</span>
              </div>
              <i data-lucide="play" fill="currentColor" style="width: 16px; height: 16px;"></i>
            </div>
          <?php endif; ?>
          
          <div class="lesson-row">
            <span class="lesson-number"><i data-lucide="lock-keyhole" style="width: 14px; height: 14px;"></i></span>
            <div class="lesson-row-copy">
              <div style="display: flex; align-items: center; gap: 8px;">
                <strong>Wallets, keys & ownership</strong>
                <span class="section-kicker" style="margin: 0; padding: 2px 6px; background: rgba(97, 80, 213, 0.2); color: #8d7aff; border: 1px solid rgba(97, 80, 213, 0.3);">GOAL</span>
              </div>
              <span>10 min &middot; Foundations</span>
            </div>
          </div>
        </div>
      </div>

      
      <aside class="news-panel">
        <div class="panel-heading" style="margin-bottom: 20px;">
          <div style="display:flex; align-items:center; gap: 8px;">
            <div class="insight-icon" style="margin:0; height: 24px; width: 24px;"><i data-lucide="newspaper" style="width: 13px; height: 13px;"></i></div>
            <span class="section-kicker" style="margin:0;">CURRENT MARKET NEWS</span>
          </div>
        </div>
        
        <div class="news-scroller" id="dashboard-news-list">
          <div style="padding: 20px; text-align: center; color: #838091; font-size: 11px;">
            <i data-lucide="loader-2" class="spin" style="margin-bottom: 10px;"></i><br/>Loading latest news...
          </div>
        </div>
        
        <a href="markets.php" class="button" style="width: 100%; margin-top: 15px; justify-content: center; background: linear-gradient(90deg, #8d7aff, var(--mint)); color: #111; font-weight: 600;">View all market news <i data-lucide="arrow-right" style="width: 15px; height: 15px;"></i></a>
      </aside>
    </section>


    <div class="dashboard-safety">
      <i data-lucide="shield-check" style="width: 17px; height: 17px;"></i>
      <span>CryptoVerse is an educational simulation. No real money, wallets, or trades are involved.</span>
    </div>
    
  </div>
</main>


<script src="https://unpkg.com/lucide@latest"></script>
<script src="https://unpkg.com/lightweight-charts@3.8.0/dist/lightweight-charts.standalone.production.js"></script>
<script src="assets/js/dashboard-chart.js"></script>
<script>
  lucide.createIcons();
</script>


</body>
</html>
