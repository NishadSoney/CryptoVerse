
<?php
/**
 * CryptoVerse - Dashboard
 * Location: dashboard.php
 */
//l;
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

      <?php
      // Fetch completed lessons for summary
      $completedStmt = $db->prepare("SELECT l.title, l.key_takeaway FROM user_progress up JOIN lessons l ON up.lesson_id = l.id WHERE up.user_id = :id AND up.status = 'COMPLETED' ORDER BY up.completed_at DESC LIMIT 5");
      $completedStmt->execute([':id' => $_SESSION['user_id']]);
      $completedLessons = $completedStmt->fetchAll();
      ?>
      <div class="lessons-panel">
        <div class="panel-heading">
          <div>
            <div class="section-kicker">YOUR PROGRESS</div>
            <h2>Knowledge Unlocked</h2>
          </div>
        </div>
        <div class="lesson-list">
          <?php if (empty($completedLessons)): ?>
            <div class="lesson-row" style="padding: 25px 0; border: none;">
              <div class="lesson-row-copy">
                <strong style="font-size: 14px; margin-bottom: 6px;">You haven't completed any lessons yet.</strong>
                <span style="font-size: 11px;">Start your journey to unlock new insights!</span>
              </div>
            </div>
          <?php else: ?>
            <?php foreach ($completedLessons as $cl): ?>
            <div class="lesson-row" style="align-items: start; gap: 14px;">
              <span class="lesson-number" style="margin-top: 2px;"><i data-lucide="check" style="width: 14px; height: 14px; color: var(--mint);"></i></span>
              <div class="lesson-row-copy">
                <strong><?= htmlspecialchars($cl['title']) ?></strong>
                <span style="line-height: 1.5; margin-top: 4px;"><?= htmlspecialchars($cl['key_takeaway']) ?></span>
              </div>
            </div>
            <?php endforeach; ?>
          <?php endif; ?>
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
