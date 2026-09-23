<?php
/**
 * CryptoVerse - User Profile
 * Location: profile.php
 */

require_once __DIR__ . '/config/config.php';
$active_page = 'profile';
require_once __DIR__ . '/includes/header.php';

// At this point, $name, $xp, $current_level, $streak, and $cash are available from header.php.
// We also need the user's email, and full portfolio values (holdings).
$db = \CryptoVerse\Config\Database::getConnection();

// Handle Profile Updates
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'update_profile') {
    $newUsername = trim($_POST['username'] ?? '');
    $newEmail = trim($_POST['email'] ?? '');
    
    if ($newUsername && $newEmail) {
        try {
            $updateStmt = $db->prepare("UPDATE users SET username = :uname, email = :email WHERE id = :id");
            $updateStmt->execute([
                ':uname' => $newUsername,
                ':email' => $newEmail,
                ':id' => $_SESSION['user_id']
            ]);
            
            // If the session stores username (wait, header uses $name which is from users.name, not username).
            // But we can update the session if needed.
            // Let's also update the name if we want, but the UI only shows "Username" input. 
            // We'll update the username and email.
            $_SESSION['username'] = $newUsername;
            
            $successMessage = "Profile updated successfully!";
        } catch (\PDOException $e) {
            $errorMessage = "Could not update profile. Username or email might be taken.";
        }
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add_funds') {
    $amount = (float)($_POST['amount'] ?? 0);
    if ($amount > 0 && $amount <= 1000000) {
        $updateWallet = $db->prepare("UPDATE wallets SET virtual_cash = virtual_cash + :amount WHERE user_id = :id");
        $updateWallet->execute([':amount' => $amount, ':id' => $_SESSION['user_id']]);
        $successMessage = "$" . number_format($amount, 2) . " paper funds added to your wallet!";
        
        // Refresh the cash value in the current session view
        $cash += $amount;
    }
}

// Fetch email and username
$stmtUser = $db->prepare("SELECT name, username, email, created_at FROM users WHERE id = :id");
$stmtUser->execute([':id' => $_SESSION['user_id']]);
$userRow = $stmtUser->fetch();
$email = $userRow['email'] ?? '';
$memberSince = $userRow['created_at'] ? date('F Y', strtotime($userRow['created_at'])) : 'Recently';

// Fetch holdings to calculate Estimated Total and for "Assets Held" panel
$stmtHoldings = $db->prepare("
    SELECT wa.asset_symbol, wa.quantity, wa.avg_buy_price 
    FROM wallet_assets wa
    JOIN wallets w ON wa.wallet_id = w.id
    WHERE w.user_id = :id AND wa.quantity > 0
");
$stmtHoldings->execute([':id' => $_SESSION['user_id']]);
$holdings = $stmtHoldings->fetchAll(\PDO::FETCH_ASSOC);

// We need current prices to calculate true estimated total, but since it's server-side, 
// we will just use avg_buy_price for invested assets on the first render, and let JS update it if we wanted.
// Or we can just calculate 'Invested Assets' cost basis for now.
$investedAssets = 0;
foreach ($holdings as $h) {
    $investedAssets += ($h['quantity'] * $h['avg_buy_price']);
}

$estimatedTotal = $cash + $investedAssets;
$buyingPower = $cash;

// Calculate Level Progress
// Level boundary is every 600 XP (or as per prototype, 60 XP for level 1? Prototype says "240 of 600 XP to Level 2" for Level 1, which implies 600 XP per level).
// Let's assume 600 XP per level.
$xpNeeded = 600;
$currentXpInLevel = $xp % 600;
$progressPercent = ($currentXpInLevel / $xpNeeded) * 100;
$xpToNext = 600 - $currentXpInLevel;

// 1. Fetch trades for Activity Log
$stmtTrades = $db->prepare("SELECT trade_type, asset_symbol, quantity, created_at FROM trades WHERE user_id = :id ORDER BY created_at DESC LIMIT 10");
$stmtTrades->execute([':id' => $_SESSION['user_id']]);
$recentTrades = $stmtTrades->fetchAll(\PDO::FETCH_ASSOC);

// 2. Fetch completed lessons for Activity Log
$stmtLessons = $db->prepare("
    SELECT l.title as lesson_title, m.title as module_title, up.completed_at 
    FROM user_progress up
    JOIN lessons l ON up.lesson_id = l.id
    JOIN modules m ON l.module_id = m.id
    WHERE up.user_id = :id AND up.status = 'COMPLETED'
    ORDER BY up.completed_at DESC LIMIT 10
");
$stmtLessons->execute([':id' => $_SESSION['user_id']]);
$recentLessons = $stmtLessons->fetchAll(\PDO::FETCH_ASSOC);

$activity = [];

foreach ($recentTrades as $trade) {
    $action = $trade['trade_type'] === 'BUY' ? 'Bought' : 'Sold';
    $qty = rtrim(rtrim(number_format($trade['quantity'], 8), '0'), '.');
    $activity[] = [
        'title' => "{$action} {$trade['asset_symbol']}",
        'detail' => "{$qty} {$trade['asset_symbol']} &middot; Paper trade",
        'timestamp' => strtotime($trade['created_at']),
        'icon' => 'wallet',
        'tone' => $trade['trade_type'] === 'BUY' ? 'violet' : 'orange'
    ];
}

foreach ($recentLessons as $lesson) {
    $activity[] = [
        'title' => 'Completed "' . $lesson['lesson_title'] . '"',
        'detail' => $lesson['module_title'],
        'timestamp' => strtotime($lesson['completed_at']),
        'icon' => 'check',
        'tone' => 'mint'
    ];
}

// Add account creation
$activity[] = [
    'title' => 'Started your journey',
    'detail' => 'Joined CryptoVerse',
    'timestamp' => strtotime($userRow['created_at'] ?? 'now'),
    'icon' => 'zap',
    'tone' => 'amber'
];

// Sort descending by timestamp
usort($activity, function($a, $b) {
    return $b['timestamp'] <=> $a['timestamp'];
});

// Format timestamps for display and limit to 6
$activity = array_slice($activity, 0, 6);
foreach ($activity as &$act) {
    $act['time'] = date('M j, Y, g:i A', $act['timestamp']);
}
unset($act);

// Helper for Lucide icons
function getIconHtml($iconName) {
    return "<i data-lucide=\"{$iconName}\" style=\"width: 14px; height: 14px;\"></i>";
}

// Helpers for tones
$tones = ['orange' => '#f7931a', 'blue' => '#627eea', 'green' => '#14d99a', 'pink' => '#e979ad', 'violet' => '#a99eff'];
?>

<link rel="stylesheet" href="assets/css/profile.css?v=<?= time() ?>">

<div class="profile-content">
  <a href="dashboard.php" style="display:flex; align-items:center; gap:6px; color:#898798; font-size:12px; text-decoration:none; margin-bottom: 20px;">
    <i data-lucide="arrow-left" style="width: 14px; height: 14px;"></i> Back to dashboard
  </a>
  <div class="profile-heading">
    <div>
      <span class="section-kicker">ACCOUNT CENTER</span>
      <h1>Your <em>profile.</em></h1>
      <p>Manage your account, paper portfolio, and learning progress in one place.</p>
    </div>
    <button id="global-save-btn" class="button button-small" style="display:flex; align-items:center; gap:6px; background:#fff; color:#131422; border:none; padding:8px 16px; border-radius:6px; font-weight:600; cursor:pointer; opacity:0.7;" disabled onclick="document.getElementById('profile-form').submit();">
      <i data-lucide="check" style="width: 14px; height: 14px;"></i> Saved
    </button>
  </div>

  <div class="profile-grid">
    <section class="profile-card account-card">
      <div class="card-heading">
        <div>
          <span class="section-kicker">PERSONAL DETAILS</span>
          <h2>Account settings</h2>
        </div>
        <i data-lucide="user-round" style="width: 18px; height: 18px; color: #9184ed;"></i>
      </div>
      
      <?php if (isset($successMessage)): ?>
      <div style="background: rgba(93, 227, 202, 0.1); color: var(--mint); padding: 10px; border-radius: 6px; font-size: 11px; margin-top: 15px; border: 1px solid rgba(93, 227, 202, 0.2);">
        <?= $successMessage ?>
      </div>
      <?php endif; ?>
      
      <?php if (isset($errorMessage)): ?>
      <div style="background: rgba(239, 127, 155, 0.1); color: #ef7f9b; padding: 10px; border-radius: 6px; font-size: 11px; margin-top: 15px; border: 1px solid rgba(239, 127, 155, 0.2);">
        <?= $errorMessage ?>
      </div>
      <?php endif; ?>

      <div class="profile-identity">
        <div class="profile-photo">
          <span><?= $avatar_initial ?></span>
          <button aria-label="Change profile photo">
            <i data-lucide="camera" style="width: 12px; height: 12px;"></i>
          </button>
        </div>
        <div>
          <strong><?= htmlspecialchars($userRow['name']) ?></strong>
          <small>Member since <?= $memberSince ?></small>
        </div>
      </div>
      
      <form id="profile-form" method="POST" action="profile.php" style="margin-top: 15px; margin-bottom: 25px;">
        <input type="hidden" name="action" value="update_profile">
        <div class="form-grid" style="gap: 20px;">
          <div style="display: flex; flex-direction: column;">
            <label>
              Username
              <div class="input-wrap">
                <i data-lucide="user-round" style="width: 14px; height: 14px; color:#777489;"></i>
                <input type="text" name="username" id="username-input" value="<?= htmlspecialchars($userRow['username']) ?>" readonly required />
              </div>
            </label>
            <button type="button" class="text-action" onclick="document.getElementById('username-input').readOnly = false; document.getElementById('username-input').focus();" style="align-self: flex-start; margin-top: 6px; font-size: 11px;">
              <i data-lucide="pencil" style="width: 11px; height: 11px;"></i> Edit username
            </button>
          </div>
          <div style="display: flex; flex-direction: column;">
            <label>
              Email address
              <div class="input-wrap">
                <i data-lucide="mail" style="width: 14px; height: 14px; color:#777489;"></i>
                <input type="email" name="email" id="email-input" value="<?= htmlspecialchars($email) ?>" readonly required />
              </div>
            </label>
            <button type="button" class="text-action" onclick="document.getElementById('email-input').readOnly = false; document.getElementById('email-input').focus();" style="align-self: flex-start; margin-top: 6px; font-size: 11px;">
              <i data-lucide="pencil" style="width: 11px; height: 11px;"></i> Edit email
            </button>
          </div>
        </div>
        <button type="submit" id="form-save-btn" class="text-action" style="margin-top: 20px; font-weight: 600; font-size: 13px; opacity:0.6;" disabled>
          <i data-lucide="check" style="width: 14px; height: 14px;"></i> Saved
        </button>
      </form>

      <div class="setting-row">
        <div class="setting-icon"><i data-lucide="key-round" style="width: 15px; height: 15px;"></i></div>
        <div>
          <strong>Password</strong>
          <small>Last changed recently</small>
        </div>
        <button class="row-button">Change <i data-lucide="chevron-right" style="width: 14px; height: 14px;"></i></button>
      </div>
      <div class="setting-row">
        <div class="setting-icon"><i data-lucide="sliders-horizontal" style="width: 15px; height: 15px;"></i></div>
        <div>
          <strong>Trading preferences</strong>
          <small>Advanced charting mode is enabled</small>
        </div>
        <button class="row-button">Review <i data-lucide="chevron-right" style="width: 14px; height: 14px;"></i></button>
      </div>
    </section>

    <section class="profile-card theme-card">
      <div class="card-heading">
        <div>
          <span class="section-kicker">APPEARANCE</span>
          <h2>Make it yours</h2>
        </div>
        <i data-lucide="sun" style="width: 18px; height: 18px; color: #9184ed;"></i>
      </div>
      <p class="card-lede">Choose the visual atmosphere that feels right for your learning journey.</p>
      <div class="theme-picker">
        <button class="theme-option" id="theme-btn-dark" onclick="setTheme('dark')">
          <span class="theme-preview dark-preview"><i data-lucide="moon" style="width: 18px; height: 18px;"></i></span>
          <strong>Dark mode</strong>
          <small>Easy on the eyes</small>
        </button>
        <button class="theme-option" id="theme-btn-light" onclick="setTheme('light')">
          <span class="theme-preview light-preview"><i data-lucide="sun" style="width: 18px; height: 18px;"></i></span>
          <strong>Light mode</strong>
          <small>Bright and focused</small>
        </button>
      </div>
      <div class="privacy-note">
        <i data-lucide="lock-keyhole" style="width: 15px; height: 15px;"></i>
        <span>
          <strong>Your data stays yours.</strong>
          <small>CryptoVerse is a paper-trading simulation. No real funds are connected.</small>
        </span>
      </div>
    </section>

    <section class="profile-card funds-card">
      <div class="card-heading">
        <div>
          <span class="section-kicker">PAPER WALLET</span>
          <h2>Funds & portfolio</h2>
        </div>
        <i data-lucide="wallet" style="width: 18px; height: 18px; color: #9184ed;"></i>
      </div>
      <div class="funds-total">
        <small>ESTIMATED TOTAL VALUE (COST BASIS)</small>
        <strong>$<?= number_format($estimatedTotal, 2) ?></strong>
      </div>
      <div class="funds-actions">
        <a href="practice.php" style="text-decoration: none; padding: 6px 12px; background: rgba(255,255,255,0.1); color: #fff; border-radius: 4px; display: flex; align-items: center; gap: 6px; font-size: 10px;">
          <i data-lucide="plus" style="width: 12px; height: 12px;"></i> Trade Assets
        </a>
        <button onclick="promptAddFunds()" style="border: none; padding: 6px 12px; background: rgba(93, 227, 202, 0.15); color: var(--mint); border-radius: 4px; display: flex; align-items: center; gap: 6px; font-size: 10px; cursor: pointer; font-family: inherit; font-weight: 600;">
          <i data-lucide="banknote" style="width: 12px; height: 12px;"></i> Add Funds
        </button>
        <a href="export_history.php" target="_blank" style="text-decoration: none; padding: 6px 12px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #fff; border-radius: 4px; display: flex; align-items: center; gap: 6px; font-size: 10px;">
          <i data-lucide="download" style="width: 12px; height: 12px;"></i> Export history
        </a>
      </div>
      
      <form id="add-funds-form" method="POST" style="display: none;">
        <input type="hidden" name="action" value="add_funds">
        <input type="hidden" name="amount" id="add-funds-amount" value="0">
      </form>
      <div class="funds-breakdown">
        <div>
          <span>Available balance</span>
          <strong>$<?= number_format($cash, 2) ?></strong>
        </div>
        <div>
          <span>Invested assets</span>
          <strong>$<?= number_format($investedAssets, 2) ?></strong>
        </div>
        <div>
          <span>Buying power</span>
          <strong>$<?= number_format($buyingPower, 2) ?></strong>
        </div>
      </div>
    </section>

    <section class="profile-card progress-card">
      <div class="card-heading">
        <div>
          <span class="section-kicker">LEARNING PROGRESS</span>
          <h2>Your journey</h2>
        </div>
        <span class="level-pill">LEVEL <?= $current_level ?></span>
      </div>
      <div class="progress-main">
        <div class="progress-ring">
          <strong><?= round($progressPercent) ?>%</strong>
          <small>XP</small>
        </div>
        <div>
          <h3>Curious mind</h3>
          <p><?= $currentXpInLevel ?> of <?= $xpNeeded ?> XP to Level <?= $current_level + 1 ?></p>
          <div class="progress-bar">
            <span style="width: <?= $progressPercent ?>%;"></span>
          </div>
          <small class="muted-text"><?= $xpToNext ?> XP needed for the next level</small>
        </div>
      </div>
      <div class="progress-stats">
        <div>
          <strong><?= $streak ?></strong>
          <span>Day streak</span>
        </div>
        <div>
          <strong><?= $xp ?></strong>
          <span>Total XP</span>
        </div>
      </div>
    </section>

    <section class="profile-card favorites-card">
      <div class="card-heading">
        <div>
          <span class="section-kicker">PORTFOLIO</span>
          <h2>Assets Held</h2>
        </div>
        <i data-lucide="briefcase" style="width: 18px; height: 18px; color: #9184ed;"></i>
      </div>
      <div class="favorite-list">
        <?php if (empty($holdings)): ?>
            <p style="color: #777489; font-size: 12px; padding: 10px 0;">You have no active holdings.</p>
        <?php else: ?>
            <?php foreach ($holdings as $idx => $coin): 
                $toneKeys = array_keys($tones);
                $tone = $toneKeys[$idx % count($toneKeys)];
            ?>
            <div class="favorite-row">
              <span class="coin-dot" style="background: <?= $tones[$tone] ?>"><?= substr($coin['asset_symbol'], 0, 1) ?></span>
              <div>
                <strong><?= $coin['asset_symbol'] ?></strong>
                <small><?= number_format($coin['quantity'], 4) ?> coins</small>
              </div>
              <div class="favorite-price">
                <strong>$<?= number_format($coin['avg_buy_price'], 2) ?> avg</strong>
                <span class="positive">In Wallet</span>
              </div>
            </div>
            <?php endforeach; ?>
        <?php endif; ?>
      </div>
      <a href="practice.php" class="text-action" style="text-decoration:none; margin-top:15px; display:inline-flex;">
        Manage portfolio <i data-lucide="chevron-right" style="width: 13px; height: 13px;"></i>
      </a>
    </section>

    <section class="profile-card history-card">
      <div class="card-heading">
        <div>
          <span class="section-kicker">ACTIVITY LOG</span>
          <h2>Recent history</h2>
        </div>
        <i data-lucide="clock-3" style="width: 18px; height: 18px; color: #9184ed;"></i>
      </div>
      <div class="activity-list">
        <?php foreach ($activity as $item): ?>
        <div class="activity-row">
          <span class="activity-icon <?= $item['tone'] ?>">
            <?= getIconHtml($item['icon']) ?>
          </span>
          <div>
            <strong><?= $item['title'] ?></strong>
            <small><?= $item['detail'] ?></small>
          </div>
          <time><?= $item['time'] ?></time>
        </div>
        <?php endforeach; ?>
      </div>
    </section>
  </div>
  <footer class="profile-footer">
    <span>CryptoVerse is an educational simulation. No real money, wallets, or trades are involved.</span>
    <span>Privacy &middot; Terms &middot; Help</span>
  </footer>
</div>

<script>
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Dynamic Save Buttons Logic
    const usernameInput = document.getElementById('username-input');
    const emailInput = document.getElementById('email-input');
    const globalSaveBtn = document.getElementById('global-save-btn');
    const formSaveBtn = document.getElementById('form-save-btn');
    
    if (usernameInput && emailInput) {
        const initialUsername = usernameInput.value;
        const initialEmail = emailInput.value;
        
        function checkChanges() {
            if (usernameInput.value !== initialUsername || emailInput.value !== initialEmail) {
                // Changes detected
                globalSaveBtn.disabled = false;
                globalSaveBtn.style.opacity = '1';
                globalSaveBtn.innerHTML = '<i data-lucide="save" style="width: 14px; height: 14px;"></i> Save changes';
                
                formSaveBtn.disabled = false;
                formSaveBtn.style.opacity = '1';
                formSaveBtn.innerHTML = '<i data-lucide="save" style="width: 14px; height: 14px;"></i> Save changes';
            } else {
                // No changes
                globalSaveBtn.disabled = true;
                globalSaveBtn.style.opacity = '0.7';
                globalSaveBtn.innerHTML = '<i data-lucide="check" style="width: 14px; height: 14px;"></i> Saved';
                
                formSaveBtn.disabled = true;
                formSaveBtn.style.opacity = '0.6';
                formSaveBtn.innerHTML = '<i data-lucide="check" style="width: 14px; height: 14px;"></i> Saved';
            }
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
        
        usernameInput.addEventListener('input', checkChanges);
        emailInput.addEventListener('input', checkChanges);
    }
    
    // Theme Switcher Logic
    function setTheme(mode) {
        localStorage.setItem('cryptoverse_theme', mode);
        
        const btnDark = document.getElementById('theme-btn-dark');
        const btnLight = document.getElementById('theme-btn-light');
        
        if (mode === 'light') {
            document.documentElement.classList.add('light-theme');
            if(btnLight) btnLight.classList.add('active');
            if(btnDark) btnDark.classList.remove('active');
        } else {
            document.documentElement.classList.remove('light-theme');
            if(btnDark) btnDark.classList.add('active');
            if(btnLight) btnLight.classList.remove('active');
        }
    }
    
    // Set initial UI state for theme
    (function() {
        var currentTheme = localStorage.getItem('cryptoverse_theme');
        if (!currentTheme) currentTheme = 'light';
        setTheme(currentTheme);
    })();
    
    function promptAddFunds() {
        const amount = prompt("How much demo money would you like to add to your paper wallet? (e.g. 10000)");
        if (amount !== null) {
            const parsed = parseFloat(amount);
            if (!isNaN(parsed) && parsed > 0 && parsed <= 1000000) {
                document.getElementById('add-funds-amount').value = parsed;
                document.getElementById('add-funds-form').submit();
            } else {
                alert("Please enter a valid amount between 1 and 1,000,000.");
            }
        }
    }
</script>

</body>
</html>
