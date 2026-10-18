const { escapeHtml, renderHeader } = require('./header');

function formatNumber(num, minDec = 2, maxDec = 2) {
  return Number(num).toLocaleString('en-US', { minimumFractionDigits: minDec, maximumFractionDigits: maxDec });
}

function renderProfile({
  userRow,
  email = '',
  memberSince = 'Recently',
  estimatedTotal = 100000,
  cash = 100000,
  investedAssets = 0,
  buyingPower = 100000,
  current_level = 1,
  progressPercent = 0,
  xp = 0,
  xpNeeded = 600,
  currentXpInLevel = 0,
  xpToNext = 600,
  streak = 1,
  holdings = [],
  activity = [],
  successMessage = '',
  errorMessage = ''
}) {
  const name = userRow.name || 'Alex';
  const firstName = name.split(' ')[0] || name;
  const avatar_initial = firstName.charAt(0).toUpperCase();

  const headerHtml = renderHeader({
    active_page: 'profile',
    name,
    xp,
    current_level,
    streak,
    cash,
    title: 'Profile'
  });

  const tones = ['#f7931a', '#627eea', '#14d99a', '#e979ad', '#a99eff'];

  return `${headerHtml}

<link rel="stylesheet" href="assets/css/profile.css">

<div class="profile-content">
  <a href="/dashboard" style="display:flex; align-items:center; gap:6px; color:#898798; font-size: 13px; text-decoration:none; margin-bottom: 20px;">
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
      
      ${successMessage ? `
      <div style="background: rgba(93, 227, 202, 0.1); color: var(--mint); padding: 10px; border-radius: 6px; font-size: 12px; margin-top: 15px; border: 1px solid rgba(93, 227, 202, 0.2);">
        ${escapeHtml(successMessage)}
      </div>
      ` : ''}
      
      ${errorMessage ? `
      <div style="background: rgba(239, 127, 155, 0.1); color: #ef7f9b; padding: 10px; border-radius: 6px; font-size: 12px; margin-top: 15px; border: 1px solid rgba(239, 127, 155, 0.2);">
        ${escapeHtml(errorMessage)}
      </div>
      ` : ''}

      <div class="profile-identity">
        <div class="profile-photo">
          <span>${avatar_initial}</span>
          <button aria-label="Change profile photo">
            <i data-lucide="camera" style="width: 12px; height: 12px;"></i>
          </button>
        </div>
        <div>
          <strong>${escapeHtml(userRow.name)}</strong>
          <small>Member since ${escapeHtml(memberSince)}</small>
        </div>
      </div>
      
      <form id="profile-form" method="POST" action="/profile" style="margin-top: 15px; margin-bottom: 25px;">
        <input type="hidden" name="action" value="update_profile">
        <div class="form-grid" style="gap: 20px;">
          <div style="display: flex; flex-direction: column;">
            <label>
              Username
              <div class="input-wrap">
                <i data-lucide="user-round" style="width: 14px; height: 14px; color:#777489;"></i>
                <input type="text" name="username" id="username-input" value="${escapeHtml(userRow.username)}" readonly required />
              </div>
            </label>
            <button type="button" class="text-action" onclick="document.getElementById('username-input').readOnly = false; document.getElementById('username-input').focus();" style="align-self: flex-start; margin-top: 6px; font-size: 12px;">
              <i data-lucide="pencil" style="width: 11px; height: 11px;"></i> Edit username
            </button>
          </div>
          <div style="display: flex; flex-direction: column;">
            <label>
              Email address
              <div class="input-wrap">
                <i data-lucide="mail" style="width: 14px; height: 14px; color:#777489;"></i>
                <input type="email" name="email" id="email-input" value="${escapeHtml(email)}" readonly required />
              </div>
            </label>
            <button type="button" class="text-action" onclick="document.getElementById('email-input').readOnly = false; document.getElementById('email-input').focus();" style="align-self: flex-start; margin-top: 6px; font-size: 12px;">
              <i data-lucide="pencil" style="width: 11px; height: 11px;"></i> Edit email
            </button>
          </div>
        </div>
        <button type="submit" id="form-save-btn" class="text-action" style="margin-top: 20px; font-weight: 600; font-size: 14px; opacity:0.6;" disabled>
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
        <strong>$${formatNumber(estimatedTotal, 2, 2)}</strong>
      </div>
      <div class="funds-actions">
        <a href="/practice" style="text-decoration: none; padding: 6px 12px; background: rgba(255,255,255,0.1); color: #fff; border-radius: 4px; display: flex; align-items: center; gap: 6px; font-size: 11px;">
          <i data-lucide="plus" style="width: 12px; height: 12px;"></i> Trade Assets
        </a>
        <button onclick="promptAddFunds()" style="border: none; padding: 6px 12px; background: rgba(93, 227, 202, 0.15); color: var(--mint); border-radius: 4px; display: flex; align-items: center; gap: 6px; font-size: 11px; cursor: pointer; font-family: inherit; font-weight: 600;">
          <i data-lucide="banknote" style="width: 12px; height: 12px;"></i> Add Funds
        </button>
        <a href="/export-history" target="_blank" style="text-decoration: none; padding: 6px 12px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #fff; border-radius: 4px; display: flex; align-items: center; gap: 6px; font-size: 11px;">
          <i data-lucide="download" style="width: 12px; height: 12px;"></i> Export history
        </a>
      </div>
      
      <form id="add-funds-form" method="POST" action="/profile" style="display: none;">
        <input type="hidden" name="action" value="add_funds">
        <input type="hidden" name="amount" id="add-funds-amount" value="0">
      </form>
      <div class="funds-breakdown">
        <div>
          <span>Available balance</span>
          <strong>$${formatNumber(cash, 2, 2)}</strong>
        </div>
        <div>
          <span>Invested assets</span>
          <strong>$${formatNumber(investedAssets, 2, 2)}</strong>
        </div>
        <div>
          <span>Buying power</span>
          <strong>$${formatNumber(buyingPower, 2, 2)}</strong>
        </div>
      </div>
    </section>

    <section class="profile-card progress-card">
      <div class="card-heading">
        <div>
          <span class="section-kicker">LEARNING PROGRESS</span>
          <h2>Your journey</h2>
        </div>
        <span class="level-pill">LEVEL ${current_level}</span>
      </div>
      <div class="progress-main">
        <div class="progress-ring">
          <strong>${Math.round(progressPercent)}%</strong>
          <small>XP</small>
        </div>
        <div>
          <h3>Curious mind</h3>
          <p>${currentXpInLevel} of ${xpNeeded} XP to Level ${current_level + 1}</p>
          <div class="progress-bar">
            <span style="width: ${progressPercent}%;"></span>
          </div>
          <small class="muted-text">${xpToNext} XP needed for the next level</small>
        </div>
      </div>
      <div class="progress-stats">
        <div>
          <strong>${streak}</strong>
          <span>Day streak</span>
        </div>
        <div>
          <strong>${xp}</strong>
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
        ${holdings.length === 0 ? `
            <p style="color: #777489; font-size: 13px; padding: 10px 0;">You have no active holdings.</p>
        ` : holdings.map((coin, idx) => {
            const tone = tones[idx % tones.length];
            return `
            <div class="favorite-row">
              <span class="coin-dot" style="background: ${tone}">${coin.asset_symbol.substring(0, 1)}</span>
              <div>
                <strong>${escapeHtml(coin.asset_symbol)}</strong>
                <small>${formatNumber(coin.quantity, 4, 4)} coins</small>
              </div>
              <div class="favorite-price">
                <strong>$${formatNumber(coin.avg_buy_price, 2, 2)} avg</strong>
                <span class="positive">In Wallet</span>
              </div>
            </div>
            `;
        }).join('')}
      </div>
      <a href="/practice" class="text-action" style="text-decoration:none; margin-top:15px; display:inline-flex;">
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
        ${activity.map(item => `
        <div class="activity-row">
          <span class="activity-icon ${item.tone}">
            <i data-lucide="${item.icon}" style="width: 14px; height: 14px;"></i>
          </span>
          <div>
            <strong>${item.title}</strong>
            <small>${item.detail}</small>
          </div>
          <time>${item.time}</time>
        </div>
        `).join('')}
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
                globalSaveBtn.disabled = false;
                globalSaveBtn.style.opacity = '1';
                globalSaveBtn.innerHTML = '<i data-lucide="save" style="width: 14px; height: 14px;"></i> Save changes';
                
                formSaveBtn.disabled = false;
                formSaveBtn.style.opacity = '1';
                formSaveBtn.innerHTML = '<i data-lucide="save" style="width: 14px; height: 14px;"></i> Save changes';
            } else {
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
</html>`;
}

module.exports = {
  renderProfile
};
