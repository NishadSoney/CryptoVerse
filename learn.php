<?php
/**
 * CryptoVerse - Curriculum & Learning Roadmap Hub
 * Location: learn.php
 * Target: WAMP Server / Apache / PHP 8+
 */

declare(strict_types=1);

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';

use CryptoVerse\Config\Database;

// Enforce student authentication
if (!AuthService::check()) {
    header('Location: /login.php');
    exit;
}

$db = Database::getConnection();

// Seed new lesson if missing
$checkNew = $db->query("SELECT id FROM lessons WHERE slug = 'market-graph-trading'")->fetch();
if (!$checkNew) {
    $db->exec("INSERT INTO `lessons` (`module_id`, `slug`, `title`, `summary`, `simple_explanation`, `analogy`, `technical_explanation`, `key_takeaway`, `xp_reward`, `estimated_minutes`, `sort_order`) VALUES
    (3, 'market-graph-trading', 'Reading Market Graphs & Trading', 'Learn how to combine various chart indicators to make informed and calculated trading decisions.', 'Once you understand candlesticks, support/resistance, and momentum indicators like RSI, you can put them all together. When multiple signals align, you have a high-probability setup for a trade. Taking a trade based on data instead of emotion is what separates a professional from a gambler.', 'Imagine you are a detective trying to solve a case. A single clue (like a fingerprint) is helpful, but finding a fingerprint, a motive, and an alibi all pointing to the same suspect gives you a solid case. In trading, using multiple indicators is like gathering multiple clues before making your move.', 'Confluence trading involves overlaying price action patterns, horizontal support/resistance zones, and momentum oscillators. When an asset approaches a major support zone (demand area) concurrently with a bullish divergence on the RSI and prints a bullish engulfing candlestick, the probabilistic edge is skewed heavily in favor of a long position. Entry triggers should always be accompanied by a predefined invalidation level (stop loss).', 'Always look for confluence—multiple technical signals agreeing—before executing a trade.', 60, 7, 16)");
    $lessonId = $db->lastInsertId();
    $stmtQuiz = $db->prepare("INSERT INTO `quizzes` (`lesson_id`, `title`, `pass_score`, `xp_reward`) VALUES (?, 'Assessment: Market Graphs & Trading', 80, 75)");
    $stmtQuiz->execute([$lessonId]);
}
$userId = (int)$_SESSION['user_id'];

// Retrieve student profile & XP
$profileStmt = $db->prepare("SELECT xp_total, current_level, streak_days FROM user_profiles WHERE user_id = :uid");
$profileStmt->execute([':uid' => $userId]);
$profile = $profileStmt->fetch() ?: ['xp_total' => 0, 'current_level' => 1, 'streak_days' => 1];

// Retrieve all lessons along with completion status for this student
$lessonsStmt = $db->prepare("
    SELECT l.*, 
           m.title AS category_title,
           m.sort_order AS module_order,
           l.sort_order AS order_num,
           'Beginner' AS difficulty,
           COALESCE(p.completed, 0) AS is_completed,
           COALESCE(p.score, 0) AS best_score
    FROM lessons l
    JOIN modules m ON l.module_id = m.id
    LEFT JOIN user_lesson_progress p ON l.id = p.lesson_id AND p.user_id = :uid
    ORDER BY m.sort_order ASC, l.sort_order ASC
");
$lessonsStmt->execute([':uid' => $userId]);
$allLessons = $lessonsStmt->fetchAll();

$totalLessons = count($allLessons);
$completedCount = 0;
$runningCompletedCount = 0;
$currentLesson = null;

// Determine states for each lesson strictly linear
foreach ($allLessons as &$l) {
    $isCompleted = (bool)$l['is_completed'];
    if ($isCompleted) {
        $completedCount++;
        $runningCompletedCount++;
        $l['state'] = 'complete';
    } else {
        // Unlock if it's the first lesson or the immediately previous one is completed
        $isUnlocked = ($l['order_num'] === 1) || ($runningCompletedCount >= ($l['order_num'] - 1));
        
        if ($isUnlocked) {
            if (!$currentLesson) {
                $l['state'] = 'current';
                $currentLesson = $l;
            } else {
                $l['state'] = 'available'; // If linear, shouldn't happen, but just in case
            }
        } else {
            $l['state'] = 'locked';
        }
    }
}
unset($l);

// Fallback if all completed
if (!$currentLesson && $totalLessons > 0) {
    $currentLesson = $allLessons[$totalLessons - 1];
    $currentLesson['state'] = 'complete';
}

$tracks = [
    ['label' => 'All lessons', 'count' => $totalLessons],
    ['label' => 'Foundations', 'count' => 4],
    ['label' => 'Blockchain', 'count' => 3],
    ['label' => 'Markets', 'count' => 3],
    ['label' => 'Security', 'count' => 2],
];

?>
<?php
$active_page = 'learn';
require_once __DIR__ . '/includes/header.php';
?>

    <div class="lessons-content">
      <a href="dashboard.php" class="back-link"><i data-lucide="arrow-left" style="width: 14px; height: 14px;"></i> Back to overview</a>
      
      <section class="lessons-hero">
        <div>
          <div class="section-kicker"><span class="live-dot"></span> YOUR LEARNING PATH</div>
          <h1>Learn the language<br /><em>of the new economy.</em></h1>
          <p>Short, focused lessons that turn crypto complexity into clear, useful understanding.</p>
        </div>
        <div class="learning-progress">
          <div class="progress-orbit">
            <strong><?= $completedCount ?></strong><span>/ <?= $totalLessons ?></span>
          </div>
          <div>
            <span class="section-kicker">LESSONS COMPLETE</span>
            <strong>Keep your momentum</strong>
            <small><?= $profile['xp_total'] ?> XP earned so far</small>
          </div>
        </div>
      </section>
      
      <section class="lesson-controls">
        <div style="display: flex; align-items: center; width: 100%; overflow-x: auto; padding: 0.5rem 0; margin: 0 -0.5rem; padding-left: 0.5rem; padding-right: 0.5rem; scrollbar-width: none;" class="lesson-indicators">
          <?php foreach ($allLessons as $idx => $l): ?>
            <?php
              $bg = 'rgba(255,255,255,0.1)';
              $color = '#94A3B8';
              $shadow = 'none';
              if ($l['state'] === 'complete') {
                  $bg = 'rgba(93,227,202,0.2)';
                  $color = '#5de3ca';
              } elseif ($l['state'] === 'current') {
                  $bg = '#5de3ca';
                  $color = '#111';
                  $shadow = '0 0 10px rgba(93,227,202,0.5)';
              }
            ?>
            <a href="<?= $l['state'] !== 'locked' ? 'lesson.php?id=' . (int)$l['id'] : '#' ?>" title="<?= htmlspecialchars($l['title']) ?>" style="text-decoration: none; width: 28px; height: 28px; flex-shrink: 0; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: <?= $bg ?>; color: <?= $color ?>; font-size: 0.75rem; font-weight: 700; transition: all 0.3s; box-shadow: <?= $shadow ?>; cursor: <?= $l['state'] !== 'locked' ? 'pointer' : 'default' ?>; z-index: 2; position: relative;">
              <?= $idx + 1 ?>
            </a>

            <?php if ($idx < count($allLessons) - 1): ?>
              <?php 
                 $lineBg = ($l['state'] === 'complete') ? '#5de3ca' : 'rgba(255,255,255,0.1)';
              ?>
              <div style="flex-grow: 1; min-width: 1.5rem; height: 2px; background: <?= $lineBg ?>; transition: all 0.3s; z-index: 1;"></div>
            <?php endif; ?>
          <?php endforeach; ?>
        </div>
      </section>

      <?php if ($currentLesson): ?>
      <section class="featured-lesson">
        <div class="featured-art">
          <div class="art-orbit orbit-a"></div>
          <div class="art-orbit orbit-b"></div>
          <div class="art-core"><i data-lucide="book-open" style="width: 32px; height: 32px;"></i></div>
          <span class="art-label"><?= str_pad((string)$currentLesson['order_num'], 2, '0', STR_PAD_LEFT) ?></span>
        </div>
        <div class="featured-copy">
          <div class="card-topline">
            <span class="lesson-tag"><?= strtoupper(htmlspecialchars($currentLesson['category_title'])) ?> &middot; LESSON <?= str_pad((string)$currentLesson['order_num'], 2, '0', STR_PAD_LEFT) ?></span>
            <span class="current-pill"><span></span> CURRENT LESSON</span>
          </div>
          <h2><?= htmlspecialchars($currentLesson['title']) ?></h2>
          <p><?= htmlspecialchars($currentLesson['summary']) ?></p>
          <div class="lesson-meta">
            <span><i data-lucide="clock-3" style="width: 14px; height: 14px;"></i> <?= (int)$currentLesson['estimated_minutes'] ?> minutes</span>
            <span><i data-lucide="sparkles" style="width: 14px; height: 14px;"></i> <?= (int)$currentLesson['xp_reward'] ?> XP</span>
          </div>
          <a href="lesson.php?id=<?= (int)$currentLesson['id'] ?>" class="button" style="text-decoration: none; display: inline-flex;">
            Continue lesson <i data-lucide="arrow-right" style="width: 15px; height: 15px; margin-left: 6px;"></i>
          </a>
        </div>
        <div class="featured-index">
          <?= str_pad((string)$currentLesson['order_num'], 2, '0', STR_PAD_LEFT) ?><span>/<?= str_pad((string)$totalLessons, 2, '0', STR_PAD_LEFT) ?></span>
        </div>
      </section>
      <?php endif; ?>
      
      <div class="lesson-section-heading">
        <div>
          <div class="section-kicker">THE CURRICULUM</div>
          <h2>Build your foundation</h2>
        </div>
        <span>Progress unlocks as you learn</span>
      </div>
      
      <section class="lesson-grid">
        <?php foreach ($allLessons as $l): ?>
          <?php if ($l['state'] === 'current' && $l['id'] === $currentLesson['id']) continue; ?>
          <article class="lesson-card <?= $l['state'] ?>">
            <a href="<?= $l['state'] !== 'locked' ? 'lesson.php?id=' . (int)$l['id'] : '#' ?>" style="text-decoration: none; color: inherit; display: block; height: 100%;">
              <div class="lesson-card-top">
                <span class="lesson-state <?= $l['state'] ?>">
                  <?php if ($l['state'] === 'complete'): ?>
                    <i data-lucide="check" style="width: 16px; height: 16px;"></i>
                  <?php elseif ($l['state'] === 'locked'): ?>
                    <i data-lucide="lock" style="width: 14px; height: 14px;"></i>
                  <?php elseif ($l['state'] === 'current'): ?>
                    <i data-lucide="play" style="width: 15px; height: 15px; fill: currentColor;"></i>
                  <?php else: ?>
                    <i data-lucide="book-open" style="width: 15px; height: 15px;"></i>
                  <?php endif; ?>
                </span>
                <span class="lesson-number"><?= str_pad((string)$l['order_num'], 2, '0', STR_PAD_LEFT) ?></span>
              </div>
              <div class="section-kicker"><?= strtoupper(htmlspecialchars($l['category_title'])) ?></div>
              <h3><?= htmlspecialchars($l['title']) ?></h3>
              <p><?= htmlspecialchars($l['summary']) ?></p>
              <div class="lesson-card-footer">
                <span><i data-lucide="clock-3" style="width: 13px; height: 13px;"></i> <?= (int)$l['estimated_minutes'] ?> min</span>
                <span><?= (int)$l['xp_reward'] ?> XP</span>
                <?php if ($l['state'] === 'complete'): ?>
                  <span class="complete-label">COMPLETE</span>
                <?php elseif ($l['state'] === 'locked'): ?>
                  <i data-lucide="lock" style="width: 14px; height: 14px; margin-left: auto; color: #777489;"></i>
                <?php elseif ($l['state'] === 'available'): ?>
                  <i data-lucide="arrow-right" style="width: 14px; height: 14px; margin-left: auto; color: #777489;"></i>
                <?php endif; ?>
              </div>
            </a>
          </article>
        <?php endforeach; ?>
      </section>

      <div class="dashboard-safety">
        <span>CryptoVerse is an educational simulation. No real money, wallets, or trades are involved.</span>
      </div>
    </div>
  </main>

  <script>
    if (typeof lucide !== 'undefined') lucide.createIcons();
  </script>
</body>
</html>
