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
  <style>

    /* Page Load Animation */
    @keyframes smoothPageLoad {
      0% { opacity: 0; transform: translateY(12px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    body {
      animation: smoothPageLoad 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    /* Universal Button & Interaction Transitions */
    a, button, input, .nav-item, .setting-row {
      transition: all 0.2s ease-in-out;
    }
    
    /* Button Click "Squish" Effect */
    button:active, a.button:active {
      transform: scale(0.96) !important;
    }
    
    /* Card Hover Lift Effects */
    .profile-card, .market-table-card, .spotlight-card, .feature-card, .portfolio-card {
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.3s ease, box-shadow 0.3s ease;
    }
    .profile-card:hover, .market-table-card:hover, .spotlight-card:hover, .feature-card:hover, .portfolio-card:hover {
      transform: translateY(-4px);
      border-color: rgba(141, 122, 255, 0.4);
      box-shadow: 0 12px 32px rgba(141, 122, 255, 0.08);
    }
    
    /* Inputs Focus Polish */
    input:focus {
      background: rgba(141, 122, 255, 0.05) !important;
    }
  </style>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= ucfirst($active_page) ?> &mdash; CryptoVerse</title>
  <link rel="stylesheet" href="assets/css/landing.css?v=<?= time() ?>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body style="<?= ($active_page !== 'home') ? 'background-color: #080914; color: #F8FAFC; margin: 0; font-family: \'Plus Jakarta Sans\', sans-serif;' : '' ?>">

<main class="<?= $active_page === 'learn' ? 'lessons-shell' : ($active_page === 'markets' ? 'markets-shell' : ($active_page === 'trade' ? 'trade-shell' : 'dashboard-shell')) ?>">
  <!-- Top Navigation -->
  <header class="dashboard-nav">
    <a href="dashboard.php" class="brand"><span class="brand-mark">C</span><span class="logo-text"><span class="large-letter">C</span>RYPTO<span class="large-letter">V</span>ERSE</span></a>
    <nav class="centered-nav">
      <a class="<?= $active_page === 'home' ? 'active' : '' ?>" href="dashboard.php">Home</a>
      <a class="<?= $active_page === 'learn' ? 'active' : '' ?>" href="learn.php">Learn</a>
      <a class="<?= $active_page === 'markets' ? 'active' : '' ?>" href="markets.php">Markets</a>
      <a class="<?= $active_page === 'trade' ? 'active' : '' ?>" href="practice.php">Trade</a>
    </nav>
    <div class="dashboard-user" id="user-menu-trigger" style="position: relative; cursor: pointer;">
      <span class="avatar"><?= htmlspecialchars($avatar_initial) ?></span>
      <span><?= htmlspecialchars($name) ?></span>
      <span class="user-caret"><i data-lucide="chevron-down" style="width: 14px; height: 14px;"></i></span>
      
      <!-- Dropdown Menu -->
      <div id="user-dropdown-menu" style="display: none; position: absolute; top: 100%; right: 0; margin-top: 0.5rem; background: #131422; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; width: 160px; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.5); padding: 0.5rem 0; flex-direction: column;">
        <a href="profile.php" style="display: flex; align-items: center; gap: 8px; padding: 0.5rem 1rem; color: #fff; text-decoration: none; font-size: 0.875rem;">
          <i data-lucide="user-round" style="width: 15px; height: 15px;"></i> Your Profile
        </a>
        <div style="height: 1px; background: rgba(255,255,255,0.1); margin: 0.25rem 0;"></div>
        <a href="#" onclick="showLogoutModal(event)" style="display: flex; align-items: center; gap: 8px; padding: 0.5rem 1rem; color: #ef7f9b; text-decoration: none; font-size: 0.875rem;">
          <i data-lucide="log-out" style="width: 15px; height: 15px;"></i> Sign Out
        </a>
      </div>
    </div>
  </header>

  <!-- Logout Confirmation Modal -->
  <div id="logout-modal-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(8, 9, 20, 0.8); z-index: 9999; justify-content: center; align-items: center;">
    <div style="background: #131422; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 2rem; width: 100%; max-width: 400px; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.5);">
      <div style="width: 48px; height: 48px; background: rgba(239, 127, 155, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: #ef7f9b;">
        <i data-lucide="log-out" style="width: 24px; height: 24px;"></i>
      </div>
      <h2 style="font-size: 1.25rem; font-weight: 700; margin: 0 0 0.5rem;">Sign out of CryptoVerse?</h2>
      <p style="color: #77758a; margin: 0 0 1.5rem; font-size: 0.875rem; line-height: 1.5;">You will be safely logged out of your session. Your paper trading progress and lessons will be saved.</p>
      <div style="display: flex; gap: 1rem; justify-content: center;">
        <button onclick="hideLogoutModal()" style="padding: 0.625rem 1.25rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #fff; font-weight: 600; cursor: pointer; flex: 1; transition: background 0.2s;">Cancel</button>
        <button onclick="window.location.href='logout.php'" style="padding: 0.625rem 1.25rem; border-radius: 8px; border: none; background: #ef7f9b; color: #191525; font-weight: 700; cursor: pointer; flex: 1; transition: opacity 0.2s;">Sign Out</button>
      </div>
    </div>
  </div>

  <script>
    // Dropdown Toggle Logic
    const trigger = document.getElementById('user-menu-trigger');
    const menu = document.getElementById('user-dropdown-menu');

    trigger.addEventListener('click', function(e) {
      if (e.target.closest('#user-dropdown-menu')) return;
      menu.style.display = menu.style.display === 'none' ? 'flex' : 'none';
    });

    document.addEventListener('click', function(e) {
      if (!trigger.contains(e.target)) {
        menu.style.display = 'none';
      }
    });

    // Logout Modal Logic
    const logoutBackdrop = document.getElementById('logout-modal-backdrop');

    function showLogoutModal(e) {
      e.preventDefault();
      menu.style.display = 'none';
      logoutBackdrop.style.display = 'flex';
    }

    function hideLogoutModal() {
      logoutBackdrop.style.display = 'none';
    }

    logoutBackdrop.addEventListener('click', function(e) {
      if (e.target === logoutBackdrop) {
        hideLogoutModal();
      }
    });
  </script>

  <!-- Dashboard Content Container -->
  <div class="<?= $active_page === 'markets' ? 'markets-content' : ($active_page === 'trade' ? 'trade-content' : 'dashboard-content') ?>">
    
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
