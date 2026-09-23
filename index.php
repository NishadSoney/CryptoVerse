<!DOCTYPE html>
<html lang="en">
<head>
  <script>
    (function() {
      var currentTheme = localStorage.getItem('cryptoverse_theme');
      if (!currentTheme) currentTheme = 'light'; // Default to light mode
      if (currentTheme === 'light') {
        document.documentElement.classList.add('light-theme');
      }
    })();
  </script>
  <style>
    /* Global Smooth Theme Transitions */
    html {
      transition: filter 0.5s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* CSS Filter Inversion for Light Theme */
    html.light-theme {
      filter: invert(1) hue-rotate(180deg);
      background: #ffffff;
    }
    
    /* Revert inversion for graphics and charts to keep them normal */
    html.light-theme img,
    html.light-theme .tv-lightweight-charts,
    html.light-theme .profile-photo,
    html.light-theme .coin-icon,
    html.light-theme .path-visual,
    html.light-theme .scene-core {
      filter: invert(1) hue-rotate(180deg);
    }
    
    /* Revert inversion transitions */
    img, .tv-lightweight-charts, .profile-photo, .coin-icon, .path-visual, .scene-core {
      transition: filter 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Page Load Animation */
    @keyframes smoothPageLoad {
      0% { opacity: 0; transform: translateY(12px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    body {
      animation: smoothPageLoad 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    /* Universal Button & Interaction Transitions */
    a, button, input, .nav-item, .theme-option, .setting-row {
      transition: all 0.2s ease-in-out;
    }
    
    /* Button Click "Squish" Effect */
    button:active, a.button:active, .theme-option:active {
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
  <title>CryptoVerse - Understand Crypto. Practice without the risk.</title>
  
  <!-- CSS Links -->
  <link rel="stylesheet" href="assets/css/landing.css">

  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body class="site-shell">

  <nav class="top-nav" aria-label="Main navigation">
    <a href="#top" class="brand" aria-label="CryptoVerse home">
      <span class="brand-mark">C</span>
      <span class="logo-text"><span class="large-letter">C</span>RYPTO<span class="large-letter">V</span>ERSE</span>
    </a>
    <div class="nav-links">
      <a href="index.php">Home</a>
      <a href="learn.php">Learn</a>
      <a href="markets.php">Markets</a>
      <a href="practice.php">Trade</a>
    </div>
    <div class="nav-actions">
      <a href="login.php" class="nav-login">Log in</a>
      <a href="signup.php" class="button button-small">Get started <i data-lucide="arrow-right" style="width: 15px; height: 15px;"></i></a>
    </div>
  </nav>

  <section id="top" class="hero-section">
    <div class="hero-copy">
      <div class="eyebrow"><span class="eyebrow-dot"></span> EDUCATION, WITHOUT THE NOISE</div>
      <h1>Understand crypto.<br /><em>Practice without</em><br />the risk.</h1>
      <p class="hero-subtitle">Learn how cryptocurrency works, explore live markets, and build trading confidence using virtual money.</p>
      
      <div class="hero-actions">
        <a id="start" href="signup.php" class="button">Start learning <i data-lucide="arrow-right" style="width: 17px; height: 17px;"></i></a>
        <a href="#journey" class="text-link">Explore the journey <i data-lucide="chevron-down" style="width: 16px; height: 16px;"></i></a>
      </div>
      
      <div class="trust-row">
        <i data-lucide="shield-check" style="width: 16px; height: 16px;"></i>
        <span>Educational only</span>
        <span class="trust-separator"></span>
        <span>No deposits</span>
        <span class="trust-separator"></span>
        <span>No real trading</span>
      </div>
    </div>
    
    <!-- 3D Scene Container -->
    <div id="hero-3d-container" class="hero-scene" aria-label="Interactive CryptoVerse learning map">
      <!-- three-scene.js will mount here -->
    </div>

    <div class="scroll-note"><span class="scroll-line"></span> SCROLL TO EXPLORE</div>
  </section>

  <section class="intro-section section-pad" id="journey">
    <div class="section-kicker">THE CRYPTOVERSE METHOD</div>
    <div class="intro-heading">
      <h2>Simple on the surface.<br /><span>Powerful underneath.</span></h2>
      <p>There is a lot to learn. We turn it into a path that always makes the next step feel possible.</p>
    </div>
    <div class="feature-grid">
      <article class="feature-card">
        <div class="feature-icon"><i data-lucide="book-open" style="width: 19px; height: 19px;"></i></div>
        <div class="feature-eyebrow">01 / LEARN</div>
        <h3>Start with the why.</h3>
        <p>Build a clear mental model of crypto, from money and wallets to blockchains and smart contracts.</p>
        <a href="signup.php" aria-label="Learn about Start with the why.">Learn more <i data-lucide="arrow-right" style="width: 15px; height: 15px;"></i></a>
      </article>
      <article class="feature-card">
        <div class="feature-icon"><i data-lucide="bar-chart-3" style="width: 19px; height: 19px;"></i></div>
        <div class="feature-eyebrow">02 / EXPLORE</div>
        <h3>See the bigger picture.</h3>
        <p>Explore live market context without the noise. Learn what price, volume, and volatility actually mean.</p>
        <a href="signup.php" aria-label="Learn about See the bigger picture.">Learn more <i data-lucide="arrow-right" style="width: 15px; height: 15px;"></i></a>
      </article>
      <article class="feature-card">
        <div class="feature-icon"><i data-lucide="wallet-cards" style="width: 19px; height: 19px;"></i></div>
        <div class="feature-eyebrow">03 / PRACTICE</div>
        <h3>Build confidence safely.</h3>
        <p>Test ideas with a virtual portfolio and learn from every decision before it costs anything.</p>
        <a href="signup.php" aria-label="Learn about Build confidence safely.">Learn more <i data-lucide="arrow-right" style="width: 15px; height: 15px;"></i></a>
      </article>
    </div>
  </section>

  <section class="path-section section-pad">
    <div class="path-visual">
      <div class="path-orb"></div>
      <div class="path-label">YOUR LEARNING PATH</div>
      <div class="path-number">01</div>
    </div>
    <div class="path-content">
      <div class="section-kicker">A GUIDED JOURNEY</div>
      <h2>From curious<br /><span>to confident.</span></h2>
      <p>Move through bite-sized lessons at your own pace. Earn XP, complete challenges, and unlock deeper concepts only when you are ready.</p>
      <div class="path-list">
        <div class="path-item is-current"><span class="path-index">01</span><span>Foundations</span><span class="path-status">START HERE</span></div>
        <div class="path-item"><span class="path-index">02</span><span>Blockchain</span><i data-lucide="lock-keyhole" style="width: 14px; height: 14px;"></i></div>
        <div class="path-item"><span class="path-index">03</span><span>Markets</span><i data-lucide="lock-keyhole" style="width: 14px; height: 14px;"></i></div>
        <div class="path-item"><span class="path-index">04</span><span>Charts</span><i data-lucide="lock-keyhole" style="width: 14px; height: 14px;"></i></div>
        <div class="path-item"><span class="path-index">05</span><span>Risk</span><i data-lucide="lock-keyhole" style="width: 14px; height: 14px;"></i></div>
        <div class="path-item"><span class="path-index">06</span><span>Advanced</span><div style="margin-left: auto; display: flex; align-items: center; gap: 12px;"><span class="path-status" style="margin-left: 0;">GOAL</span><i data-lucide="lock-keyhole" style="width: 14px; height: 14px;"></i></div></div>
      </div>
    </div>
  </section>

  <section class="preview-section section-pad" id="preview">
    <div class="section-kicker">PRACTICE MODE</div>
    <div class="preview-heading">
      <h2>Learn by doing.<br /><span>Never by risking.</span></h2>
      <div class="simulation-badge"><span></span> SIMULATION ONLY</div>
    </div>
    <div class="portfolio-card">
      <div class="portfolio-top">
        <div><span class="muted-label">VIRTUAL BALANCE</span><strong>$100,000<span>.00</span></strong><small>+ $0.00&nbsp; <b>0.00%</b> today</small></div>
        <div class="portfolio-actions"><button>Deposit</button><button class="ghost">Withdraw</button></div>
      </div>
      <div class="portfolio-chart">
        <div class="chart-labels"><span>$104k</span><span>$100k</span><span>$96k</span></div>
        <svg viewBox="0 0 800 190" role="img" aria-label="Illustrative portfolio chart">
          <path d="M0 144 C 50 145, 62 110, 108 123 S 169 81, 213 108 S 284 94, 324 122 S 384 105, 425 93 S 477 70, 510 96 S 567 72, 604 78 S 654 43, 696 60 S 753 35, 800 42" fill="none" stroke="url(#line)" stroke-width="3" />
          <defs><linearGradient id="line" x1="0" x2="1"><stop stop-color="#8d7aff" /><stop offset="1" stop-color="#5de3ca" /></linearGradient></defs>
        </svg>
      </div>
      <div class="portfolio-footer"><span>1D</span><span>1W</span><span class="selected">1M</span><span>1Y</span><span>ALL</span></div>
    </div>
  </section>

  <section class="security-section section-pad" id="security">
    <div class="security-copy">
      <div class="section-kicker">KNOWLEDGE IS PROTECTION</div>
      <h2>Learn how to<br /><span>spot the trap.</span></h2>
      <p>Crypto literacy is also knowing what to avoid. Practice recognizing common scams in a safe, simulated environment.</p>
      <a href="signup.php" class="button button-outline">Visit Security Center <i data-lucide="arrow-right" style="width: 16px; height: 16px;"></i></a>
    </div>
    <div class="security-list">
      <div class="security-item"><span class="security-num">01</span><span>Phishing & impersonation</span><i data-lucide="check" style="width: 16px; height: 16px;"></i></div>
      <div class="security-item"><span class="security-num">02</span><span>Fake giveaways & airdrops</span><i data-lucide="check" style="width: 16px; height: 16px;"></i></div>
      <div class="security-item"><span class="security-num">03</span><span>Seed phrase theft</span><i data-lucide="check" style="width: 16px; height: 16px;"></i></div>
      <div class="security-item"><span class="security-num">04</span><span>Malicious links & drainers</span><i data-lucide="check" style="width: 16px; height: 16px;"></i></div>
    </div>
  </section>

  <section class="final-section" id="login">
    <i data-lucide="sparkles" style="width: 18px; height: 18px;"></i>
    <h2>Ready to enter<br /><span>the CryptoVerse?</span></h2>
    <p>Your first lesson is waiting. No wallet required.</p>
    <a href="signup.php" class="button">Start learning <i data-lucide="arrow-right" style="width: 17px; height: 17px;"></i></a>
  </section>

  <footer class="site-footer">
    <a href="#top" class="brand"><span class="brand-mark">C</span><span class="logo-text"><span class="large-letter">C</span>RYPTO<span class="large-letter">V</span>ERSE</span></a>
    <span>Learn. Explore. Practice.</span>
    <span>© 2026 CryptoVerse</span>
  </footer>

  <!-- Scripts -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="assets/js/three-scene.js"></script>
  <script>
    // Initialize Lucide Icons
    lucide.createIcons();
    
    // Initialize 3D Scene in the specific container
    const container = document.getElementById('hero-3d-container');
    if (container) {
      new CryptoUniverseScene(container);
    }
  </script>
</body>
</html>
