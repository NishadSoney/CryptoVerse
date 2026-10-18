function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderHeader({
  active_page = 'home',
  name = 'Alex',
  xp = 0,
  current_level = 1,
  streak = 1,
  cash = 100000,
  title = ''
}) {
  const firstName = name.split(' ')[0] || name;
  const avatar_initial = firstName.charAt(0).toUpperCase();

  const now = new Date();
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  const current_date_str = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

  const hour = now.getHours();
  let greeting = 'Good evening';
  if (hour >= 5 && hour < 12) {
    greeting = 'Good morning';
  } else if (hour >= 12 && hour < 17) {
    greeting = 'Good afternoon';
  }

  const pageTitle = title || (active_page.charAt(0).toUpperCase() + active_page.slice(1));
  const shellClass = active_page === 'learn' ? 'lessons-shell' : (active_page === 'markets' ? 'markets-shell' : (active_page === 'trade' ? 'trade-shell' : 'dashboard-shell'));
  const contentClass = active_page === 'markets' ? 'markets-content' : (active_page === 'trade' ? 'trade-content' : 'dashboard-content');
  const bodyStyle = active_page !== 'home' ? 'background-color: #080914; color: #F8FAFC; margin: 0; font-family: \'Plus Jakarta Sans\', sans-serif;' : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <style>

    /* Page Load Animation */
    @keyframes smoothPageLoad {
      0% { opacity: 0; }
      100% { opacity: 1; }
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
  <title>${escapeHtml(pageTitle)} &mdash; CryptoVerse</title>
  <link rel="stylesheet" href="assets/css/landing.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body style="${bodyStyle}">

<main class="${shellClass}">
  <!-- Top Navigation -->
  <header class="dashboard-nav">
    <a href="dashboard.php" class="brand"><span class="brand-mark">C</span><span class="logo-text"><span class="large-letter">C</span>RYPTO<span class="large-letter">V</span>ERSE</span></a>
    <nav class="centered-nav">
      <a class="${active_page === 'home' ? 'active' : ''}" href="dashboard.php">Home</a>
      <a class="${active_page === 'learn' ? 'active' : ''}" href="learn.php">Learn</a>
      <a class="${active_page === 'markets' ? 'active' : ''}" href="markets.php">Markets</a>
      <a class="${active_page === 'trade' ? 'active' : ''}" href="practice.php">Trade</a>
    </nav>
    <div class="dashboard-user" id="user-menu-trigger" style="position: relative; cursor: pointer;">
      <span class="avatar">${escapeHtml(avatar_initial)}</span>
      <span>${escapeHtml(firstName)}</span>
      <span class="user-caret"><i data-lucide="chevron-down" style="width: 14px; height: 14px;"></i></span>
      
      <!-- Dropdown Menu -->
      <div id="user-dropdown-menu" style="display: none; position: absolute; top: 100%; right: 0; margin-top: 0.5rem; background: #131422; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; width: 160px; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.5); padding: 0.5rem 0; flex-direction: column;">
        <a href="profile.php" style="display: flex; align-items: center; gap: 8px; padding: 0.5rem 1rem; color: #fff; text-decoration: none; font-size: 0.9188rem;">
          <i data-lucide="user-round" style="width: 15px; height: 15px;"></i> Your Profile
        </a>
        <div style="height: 1px; background: rgba(255,255,255,0.1); margin: 0.25rem 0;"></div>
        <a href="#" onclick="showLogoutModal(event)" style="display: flex; align-items: center; gap: 8px; padding: 0.5rem 1rem; color: #ef7f9b; text-decoration: none; font-size: 0.9188rem;">
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
      <h2 style="font-size: 1.3125rem; font-weight: 700; margin: 0 0 0.5rem;">Sign out of CryptoVerse?</h2>
      <p style="color: #77758a; margin: 0 0 1.5rem; font-size: 0.9188rem; line-height: 1.5;">You will be safely logged out of your session. Your paper trading progress and lessons will be saved.</p>
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
      document.body.style.overflow = 'hidden';
    }

    function hideLogoutModal() {
      logoutBackdrop.style.display = 'none';
      document.body.style.overflow = '';
    }

    logoutBackdrop.addEventListener('click', function(e) {
      if (e.target === logoutBackdrop) {
        hideLogoutModal();
      }
    });
  </script>

  <!-- Dashboard Content Container -->
  <div class="${contentClass}">
    
    <!-- Unified Hero Panel -->
    ${active_page === 'home' ? `
    <div class="dashboard-welcome">
      <div>
        <div class="section-kicker">${escapeHtml(current_date_str)}</div>
        <h1>${escapeHtml(greeting)}, <em>${escapeHtml(firstName)}.</em></h1>
        <p>Keep your momentum going. You are building a better mental model one lesson at a time.</p>
      </div>
      <div style="display:flex; gap: 10px;">
        <div class="streak-card">
          <i data-lucide="sparkles" style="width: 18px; height: 18px;"></i>
          <strong>${streak} day streak</strong>
          <span>Best: ${streak} days</span>
        </div>
        <div class="streak-card level-card">
          <i data-lucide="award" style="width: 18px; height: 18px;"></i>
          <strong>Level ${current_level}</strong>
          <span>${xp} XP</span>
        </div>
      </div>
    </div>
    ` : ''}`;
}

module.exports = {
  escapeHtml,
  renderHeader
};
