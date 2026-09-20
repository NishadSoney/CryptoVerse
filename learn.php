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
$userId = (int)$_SESSION['user_id'];

// Retrieve student profile & XP
$profileStmt = $db->prepare("SELECT xp_total, current_level, streak_days FROM user_profiles WHERE user_id = :uid");
$profileStmt->execute([':uid' => $userId]);
$profile = $profileStmt->fetch() ?: ['xp_total' => 0, 'current_level' => 1, 'streak_days' => 1];

// Retrieve all lessons along with completion status for this student
$lessonsStmt = $db->prepare("
    SELECT l.*, 
           CONCAT('MODULE_', m.id) AS module,
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

// Fetch modules to build dynamic groups
$modulesStmt = $db->query("SELECT * FROM modules ORDER BY sort_order ASC");
$modules = [];
while ($m = $modulesStmt->fetch()) {
    $key = 'MODULE_' . $m['id'];
    $modules[$key] = [
        'name' => $m['level_badge'] . ': ' . $m['title'],
        'lessons' => []
    ];
}

foreach ($allLessons as $lesson) {
    $mod = $lesson['module'] ?? 'MODULE_1';
    if (isset($modules[$mod])) {
        $modules[$mod]['lessons'][] = $lesson;
    }
}
?>
<?php
$active_page = 'learn';
require_once __DIR__ . '/includes/header.php';
?>
<!-- Inner Content Wrapper -->
<div style="max-width: 72rem; margin: 0 auto; padding: 2rem 1.5rem;">
    <div style="margin-bottom: 2rem;">
      <h1 style="font-size: 1.875rem; font-weight: 800; margin: 0 0 0.5rem 0;">Curriculum Roadmap</h1>
      <p style="font-size: 0.875rem; color: #94A3B8; margin: 0;">
        15 sequential lessons structured from first principles to advanced market dynamics. Pass scenario quizzes to advance.
      </p>
    </div>

    <!-- MODULE LIST -->
    <div style="display: flex; flex-direction: column; gap: 2rem;">
      <?php 
      $globalCompletedCount = 0;
      foreach ($modules as $modKey => $modData): 
      ?>
        <div style="background: #14142b; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 1rem; padding: 1.5rem;">
          <div style="border-bottom: 1px solid rgba(255, 255, 255, 0.06); padding-bottom: 0.75rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center;">
            <h2 style="font-size: 1.125rem; font-weight: 700; margin: 0; color: #E2E8F0;"><?= htmlspecialchars($modData['name']) ?></h2>
            <span style="font-size: 0.75rem; font-family: 'Space Mono', monospace; color: #64748B;">
              <?= count($modData['lessons']) ?> Lessons
            </span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <?php foreach ($modData['lessons'] as $idx => $l): 
              $isCompleted = (bool)$l['is_completed'];
              if ($isCompleted) $globalCompletedCount++;
              
              // A lesson is unlocked if it's the very first lesson OR the previous one is completed
              $isUnlocked = ($l['order_num'] === 1) || ($globalCompletedCount >= ($l['order_num'] - 1));
            ?>
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; border-radius: 0.75rem; background: <?= $isCompleted ? 'rgba(16, 185, 129, 0.04)' : 'rgba(0, 0, 0, 0.2)' ?>; border: 1px solid <?= $isCompleted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)' ?>;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <div style="width: 2.25rem; height: 2.25rem; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; font-family: 'Space Mono', monospace; font-size: 0.8125rem; font-weight: 700; background: <?= $isCompleted ? 'rgba(16, 185, 129, 0.15)' : ($isUnlocked ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)') ?>; color: <?= $isCompleted ? '#5de3ca' : ($isUnlocked ? '#b6adff' : '#64748B') ?>;">
                    <?php if ($isCompleted): ?>
                      <i data-lucide="check" style="width: 1.25rem; height: 1.25rem;"></i>
                    <?php else: ?>
                      <?= str_pad((string)$l['order_num'], 2, '0', STR_PAD_LEFT) ?>
                    <?php endif; ?>
                  </div>

                  <div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <h3 style="font-size: 0.9375rem; font-weight: 700; margin: 0; color: <?= $isUnlocked ? '#FFF' : '#64748B' ?>;">
                        <?= htmlspecialchars($l['title']) ?>
                      </h3>
                      <span style="font-size: 0.6875rem; padding: 1px 6px; border-radius: 4px; font-weight: 600; background: rgba(255, 255, 255, 0.05); color: #94A3B8;">
                        <?= htmlspecialchars($l['difficulty']) ?>
                      </span>
                    </div>
                    <p style="font-size: 0.75rem; color: #94A3B8; margin: 0.25rem 0 0 0;">
                      <?= htmlspecialchars($l['summary']) ?>
                    </p>
                  </div>
                </div>

                <div style="display: flex; align-items: center; gap: 1rem;">
                  <span style="font-size: 0.75rem; font-family: 'Space Mono', monospace; color: #5de3ca; font-weight: 700;">
                    +<?= (int)$l['xp_reward'] ?> XP
                  </span>

                  <?php if ($isUnlocked): ?>
                    <a href="lesson.php?id=<?= (int)$l['id'] ?>" style="padding: 0.5rem 1rem; font-size: 0.75rem; font-weight: 700; color: #FFF; background: <?= $isCompleted ? '#334155' : '#6150d5' ?>; border-radius: 0.5rem; text-decoration: none;">
                      <?= $isCompleted ? 'Review' : 'Start Lesson' ?>
                    </a>
                  <?php else: ?>
                    <div style="padding: 0.5rem 0.75rem; font-size: 0.75rem; color: #64748B; display: flex; align-items: center; gap: 0.25rem;">
                      <i data-lucide="lock" style="width: 0.875rem; height: 0.875rem;"></i>
                      <span>Locked</span>
                    </div>
                  <?php endif; ?>
                </div>
              </div>
            <?php endforeach; ?>
          </div>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
  </div>
</main>

  <script>
    if (typeof lucide !== 'undefined') lucide.createIcons();
  </script>
</body>
</html>
