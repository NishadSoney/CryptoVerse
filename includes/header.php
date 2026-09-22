<?php
/**
 * CryptoVerse - Unified Header & Hero Panel
 * Location: includes/header.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/auth.php';

AuthService::requireAuth();

// Fetch fresh data for the user
$db = \CryptoVerse\Config\Database::getConnection();
$stmt = $db->prepare("
    SELECT u.name, u.email, p.xp_total, p.current_level, p.streak_days, w.virtual_cash
    FROM users u
    LEFT JOIN user_profiles p ON u.id = p.user_id
    LEFT JOIN wallets w ON u.id = w.user_id
    WHERE u.id = :id
");

// Fallbacks
$name = $_SESSION['name'] ?? 'Alex';
$xp = 0;
$current_level = 1;
$streak = 1;
$cash = 100000;

try {
    $stmt->execute([':id' => $_SESSION['user_id']]);
    $row = $stmt->fetch();
    if ($row) {
        $name = explode(' ', $row['name'])[0] ?? $row['name'];
        $xp = (int)($row['xp_total'] ?? 0);
        $current_level = (int)($row['current_level'] ?? 1);
        $streak = (int)($row['streak_days'] ?? 1);
        $cash = (float)($row['virtual_cash'] ?? 100000);
    }
} catch (\PDOException $e) {
    error_log("Header query failed: " . $e->getMessage());
}

$avatar_initial = strtoupper(substr($name, 0, 1));
$current_date_str = strtoupper(date('l, F j, Y'));

if (!isset($active_page)) {
    $active_page = 'home';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= ucfirst($active_page) ?> &mdash; CryptoVerse</title>
  <link rel="stylesheet" href="assets/css/landing.css?v=<?= time() ?>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body style="<?= ($active_page !== 'home') ? 'background-color: #080914; color: #F8FAFC; margin: 0; font-family: \'Plus Jakarta Sans\', sans-serif;' : '' ?>">

<main class="<?= $active_page === 'learn' ? 'lessons-shell' : 'dashboard-shell' ?>">
  <!-- Top Navigation -->
  <header class="dashboard-nav">
    <a href="dashboard.php" class="brand"><span class="brand-mark">C</span><span class="logo-text"><span class="large-letter">C</span>RYPTO<span class="large-letter">V</span>ERSE</span></a>
    <nav class="centered-nav">
      <a class="<?= $active_page === 'home' ? 'active' : '' ?>" href="dashboard.php">Home</a>
      <a class="<?= $active_page === 'learn' ? 'active' : '' ?>" href="learn.php">Learn</a>
      <a class="<?= $active_page === 'markets' ? 'active' : '' ?>" href="markets.php">Markets</a>
      <a class="<?= $active_page === 'trade' ? 'active' : '' ?>" href="practice.php">Trade</a>
    </nav>
    <div class="dashboard-user">
      <span class="avatar"><?= htmlspecialchars($avatar_initial) ?></span>
      <span><?= htmlspecialchars($name) ?></span>
      <span class="user-caret"><i data-lucide="chevron-down" style="width: 14px; height: 14px;"></i></span>
    </div>
  </header>

  <!-- Dashboard Content Container -->
  <div class="dashboard-content">
    
    <!-- Unified Hero Panel -->
    <?php if ($active_page === 'home'): ?>
    <div class="dashboard-welcome">
      <div>
        <div class="section-kicker"><?= $current_date_str ?></div>
        <h1>Good morning, <em><?= htmlspecialchars($name) ?>.</em></h1>
        <p>Keep your momentum going. You are building a better mental model one lesson at a time.</p>
      </div>
      <div style="display:flex; gap: 10px;">
        <div class="streak-card">
          <i data-lucide="sparkles" style="width: 18px; height: 18px;"></i>
          <strong><?= $streak ?> day streak</strong>
          <span>Best: <?= $streak ?> days</span>
        </div>
        <div class="streak-card level-card">
          <i data-lucide="award" style="width: 18px; height: 18px;"></i>
          <strong>Level <?= $current_level ?></strong>
          <span><?= $xp ?> XP</span>
        </div>
      </div>
    </div>
    <?php endif; ?>
