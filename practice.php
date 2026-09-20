<?php
/**
 * CryptoVerse - Risk-Free Paper Trading Sandbox ($100k Virtual Capital)
 * Location: practice.php
 * Target: WAMP Server / Apache / PHP 8+
 */

declare(strict_types=1);

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/auth.php';

use CryptoVerse\Config\Database;

if (!AuthService::check()) {
    header('Location: /login.php');
    exit;
}

$db = Database::getConnection();
$userId = (int)$_SESSION['user_id'];

// Get user's wallet
$walletStmt = $db->prepare("SELECT id, virtual_cash FROM wallets WHERE user_id = :uid");
$walletStmt->execute([':uid' => $userId]);
$wallet = $walletStmt->fetch();

if (!$wallet) {
    // Bootstrap wallet with $100k virtual cash
    $createW = $db->prepare("INSERT INTO wallets (user_id, virtual_cash, updated_at) VALUES (:uid, 100000.00, NOW())");
    $createW->execute([':uid' => $userId]);
    $wallet = ['id' => $db->lastInsertId(), 'virtual_cash' => 100000.00];
}

$walletId = (int)$wallet['id'];
$virtualCash = (float)$wallet['virtual_cash'];

// Fetch user's asset holdings
$holdingsStmt = $db->prepare("SELECT * FROM wallet_assets WHERE wallet_id = :wid ORDER BY updated_at DESC");
$holdingsStmt->execute([':wid' => $walletId]);
$holdings = $holdingsStmt->fetchAll();

// Mock live prices for portfolio calculation
$currentPrices = [
    'BTC' => 64120.00,
    'ETH' => 3480.50,
    'SOL' => 154.20,
    'BNB' => 585.40,
    'ADA' => 0.38
];

// Calculate portfolio total value
$holdingsValue = 0.0;
foreach ($holdings as $h) {
    $sym = $h['asset_symbol'];
    $price = $currentPrices[$sym] ?? 1.0;
    $holdingsValue += ((float)$h['quantity'] * $price);
}
$portfolioTotal = $virtualCash + $holdingsValue;
$pnlDollar = $portfolioTotal - 100000.00;
$pnlPercent = ($pnlDollar / 100000.00) * 100.0;

// Fetch last 10 trades
$tradesStmt = $db->prepare("SELECT * FROM trades WHERE user_id = :uid ORDER BY created_at DESC LIMIT 10");
$tradesStmt->execute([':uid' => $userId]);
$trades = $tradesStmt->fetchAll();

$preselectedAsset = isset($_GET['asset']) ? strtoupper(trim($_GET['asset'])) : 'BTC';
?>
<?php
$active_page = 'trade';
require_once __DIR__ . '/includes/header.php';
?>
<div style="max-width: 72rem; margin: 2rem auto; padding: 0 1.5rem;">
    
    <!-- TOP PORTFOLIO SUMMARY METRICS -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: 1rem; margin-bottom: 2rem;">
      <div style="background: #14142b; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 1rem; padding: 1.25rem;">
        <span style="color: #64748B; font-size: 0.6875rem; text-transform: uppercase; font-weight: 700;">Total Portfolio Value</span>
        <div style="font-size: 1.5rem; font-weight: 800; font-family: 'Space Mono', monospace; margin: 0.25rem 0; color: #FFF;">
          $<?= number_format($portfolioTotal, 2) ?>
        </div>
        <span style="font-size: 0.75rem; font-family: 'Space Mono', monospace; color: <?= $pnlDollar >= 0 ? '#5de3ca' : '#F43F5E' ?>; font-weight: 700;">
          <?= $pnlDollar >= 0 ? '+' : '' ?>$<?= number_format($pnlDollar, 2) ?> (<?= number_format($pnlPercent, 2) ?>%)
        </span>
      </div>

      <div style="background: #14142b; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 1rem; padding: 1.25rem;">
        <span style="color: #64748B; font-size: 0.6875rem; text-transform: uppercase; font-weight: 700;">Available Virtual USD Cash</span>
        <div style="font-size: 1.5rem; font-weight: 800; font-family: 'Space Mono', monospace; margin: 0.25rem 0; color: #5de3ca;">
          $<?= number_format($virtualCash, 2) ?>
        </div>
        <span style="font-size: 0.6875rem; color: #94A3B8;">Zero real money risked • Learn safely</span>
      </div>

      <div style="background: #14142b; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 1rem; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between;">
        <span style="color: #64748B; font-size: 0.6875rem; text-transform: uppercase; font-weight: 700;">Portfolio Action</span>
        <button onclick="resetSandbox()" style="background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.3); color: #FDA4AF; padding: 0.5rem 1rem; border-radius: 0.5rem; font-size: 0.75rem; font-weight: 700; cursor: pointer;">
          Reset Balance to $100,000
        </button>
      </div>
    </div>

    <!-- MAIN TRADING INTERFACE (2 COLUMNS) -->
    <div style="display: grid; grid-template-columns: 1fr; lg:grid-template-columns: 7fr 5fr; gap: 1.5rem;">
      
      <!-- LEFT: ORDER EXECUTION TICKET -->
      <div style="background: #14142b; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 1rem; padding: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 1rem; margin-bottom: 1.5rem;">
          <h2 style="font-size: 1.125rem; font-weight: 700; margin: 0;">Order Execution Ticket</h2>
          <span style="font-size: 0.6875rem; font-family: 'Space Mono', monospace; color: #b6adff; background: rgba(59, 130, 246, 0.1); padding: 2px 8px; border-radius: 4px; font-weight: 700;">
            MARKET ORDER SIMULATOR
          </span>
        </div>

        <form id="trade-form" onsubmit="executeTrade(event)">
          <!-- BUY / SELL Switcher -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 1.25rem;">
            <button type="button" id="btn-side-buy" onclick="setSide('BUY')" style="padding: 0.75rem; border-radius: 0.5rem; border: none; font-weight: 800; font-size: 0.875rem; cursor: pointer; background: #5de3ca; color: #FFF;">
              BUY (Go Long)
            </button>
            <button type="button" id="btn-side-sell" onclick="setSide('SELL')" style="padding: 0.75rem; border-radius: 0.5rem; border: none; font-weight: 800; font-size: 0.875rem; cursor: pointer; background: transparent; color: #94A3B8; border: 1px solid rgba(255, 255, 255, 0.1);">
              SELL (Exit Position)
            </button>
          </div>

          <!-- Asset Selector -->
          <div style="margin-bottom: 1.25rem;">
            <label style="display: block; font-size: 0.6875rem; color: #94A3B8; text-transform: uppercase; font-weight: 700; margin-bottom: 0.375rem;">
              Select Asset
            </label>
            <select id="trade-asset" onchange="updateAssetPrice()" style="width: 100%; box-sizing: border-box; background: #080914; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 0.5rem; padding: 0.625rem; color: #FFF; font-size: 0.875rem; font-weight: 700;">
              <?php foreach ($currentPrices as $sym => $pr): ?>
                <option value="<?= $sym ?>" <?= $sym === $preselectedAsset ? 'selected' : '' ?>>
                  <?= $sym ?> — $<?= number_format($pr, 2) ?>
                </option>
              <?php endforeach; ?>
            </select>
          </div>

          <!-- Quantity Input -->
          <div style="margin-bottom: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.375rem;">
              <label style="font-size: 0.6875rem; color: #94A3B8; text-transform: uppercase; font-weight: 700;">
                Order Quantity
              </label>
              <span id="quick-balance-info" style="font-size: 0.6875rem; font-family: 'Space Mono', monospace; color: #64748B;">
                Available: $<?= number_format($virtualCash, 2) ?>
              </span>
            </div>
            <input type="number" id="trade-qty" step="any" min="0.0001" placeholder="0.00" oninput="calculateTotal()" required style="width: 100%; box-sizing: border-box; background: #080914; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 0.5rem; padding: 0.625rem; color: #FFF; font-size: 1rem; font-family: 'Space Mono', monospace; font-weight: 700;">
          </div>

          <!-- Quick Percentage Sizing Buttons -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin-bottom: 1.5rem;">
            <button type="button" onclick="setQuickSize(0.25)" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.08); color: #CBD5E1; padding: 0.375rem; border-radius: 0.375rem; font-size: 0.75rem; font-family: 'Space Mono', monospace; cursor: pointer;">25%</button>
            <button type="button" onclick="setQuickSize(0.50)" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.08); color: #CBD5E1; padding: 0.375rem; border-radius: 0.375rem; font-size: 0.75rem; font-family: 'Space Mono', monospace; cursor: pointer;">50%</button>
            <button type="button" onclick="setQuickSize(0.75)" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.08); color: #CBD5E1; padding: 0.375rem; border-radius: 0.375rem; font-size: 0.75rem; font-family: 'Space Mono', monospace; cursor: pointer;">75%</button>
            <button type="button" onclick="setQuickSize(1.00)" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.08); color: #CBD5E1; padding: 0.375rem; border-radius: 0.375rem; font-size: 0.75rem; font-family: 'Space Mono', monospace; cursor: pointer;">100%</button>
          </div>

          <!-- Order Summary Calculation -->
          <div style="background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 0.5rem; padding: 1rem; margin-bottom: 1.5rem; font-size: 0.8125rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="color: #94A3B8;">Estimated Unit Price:</span>
              <span id="summary-unit-price" style="font-family: 'Space Mono', monospace; color: #FFF; font-weight: 700;">$0.00</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="color: #94A3B8;">Slippage & Protocol Fee:</span>
              <span style="font-family: 'Space Mono', monospace; color: #5de3ca; font-weight: 700;">$0.00 (Risk-Free Paper)</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 0.5rem;">
              <span style="color: #FFF; font-weight: 700;">Total Order Value:</span>
              <span id="summary-total" style="font-family: 'Space Mono', monospace; color: #b6adff; font-size: 1.125rem; font-weight: 800;">$0.00</span>
            </div>
          </div>

          <!-- Submit Order Button -->
          <button type="submit" id="btn-submit-order" style="width: 100%; padding: 0.875rem; border-radius: 0.5rem; border: none; font-weight: 800; font-size: 0.875rem; cursor: pointer; background: #5de3ca; color: #FFF; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);">
            Execute Simulated BUY Order (+30 XP)
          </button>
          <div id="trade-result-msg" style="margin-top: 0.75rem; text-align: center; font-size: 0.8125rem; font-weight: 700;"></div>
        </form>
      </div>

      <!-- RIGHT: ASSET HOLDINGS & POSITION SIZING CALCULATOR -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        
        <!-- Current Holdings Table -->
        <div style="background: #14142b; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 1rem; padding: 1.5rem;">
          <h3 style="font-size: 1rem; font-weight: 700; margin: 0 0 1rem 0;">Current Asset Holdings</h3>
          
          <?php if (empty($holdings)): ?>
            <div style="text-align: center; padding: 2rem 1rem; color: #64748B; font-size: 0.8125rem;">
              You have no open cryptocurrency positions. Use the order ticket on the left to execute your first simulated trade!
            </div>
          <?php else: ?>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <?php foreach ($holdings as $h): 
                $sym = $h['asset_symbol'];
                $qty = (float)$h['quantity'];
                $avg = (float)$h['avg_buy_price'];
                $cur = $currentPrices[$sym] ?? $avg;
                $val = $qty * $cur;
                $pnl = ($cur - $avg) * $qty;
                $pnlPct = $avg > 0 ? (($cur - $avg) / $avg) * 100 : 0;
              ?>
                <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 0.5rem; padding: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-weight: 800; font-family: 'Space Mono', monospace; color: #FFF; font-size: 0.875rem;">
                      <?= htmlspecialchars($sym) ?>
                    </div>
                    <span style="font-size: 0.6875rem; color: #94A3B8;">
                      <?= number_format($qty, 4) ?> @ avg $<?= number_format($avg, 2) ?>
                    </span>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-weight: 700; font-family: 'Space Mono', monospace; font-size: 0.875rem; color: #FFF;">
                      $<?= number_format($val, 2) ?>
                    </div>
                    <span style="font-size: 0.6875rem; font-family: 'Space Mono', monospace; font-weight: 700; color: <?= $pnl >= 0 ? '#5de3ca' : '#F43F5E' ?>;">
                      <?= $pnl >= 0 ? '+' : '' ?>$<?= number_format($pnl, 2) ?> (<?= number_format($pnlPct, 1) ?>%)
                    </span>
                  </div>
                </div>
              <?php endforeach; ?>
            </div>
          <?php endif; ?>
        </div>

        <!-- Position Sizing & Risk Management Calculator -->
        <div style="background: #14142b; border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 1rem; padding: 1.5rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; color: #b6adff;">
            <i data-lucide="shield" style="width: 1.125rem; height: 1.125rem;"></i>
            <h3 style="font-size: 0.875rem; font-weight: 700; margin: 0; text-transform: uppercase;">
              Risk Simulator: 1% Golden Rule
            </h3>
          </div>
          <p style="font-size: 0.75rem; color: #94A3B8; margin: 0 0 1rem 0;">
            Calculate the exact safe quantity to purchase so that if your Stop-Loss is hit, you only risk 1% of your total capital ($1,000 on $100k).
          </p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.75rem; margin-bottom: 0.75rem;">
            <div>
              <label style="color: #64748B; display: block; margin-bottom: 2px;">Entry Price ($)</label>
              <input type="number" id="calc-entry" value="64120" oninput="calcRiskSize()" style="width: 100%; box-sizing: border-box; background: #080914; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.375rem; padding: 0.375rem; color: #FFF; font-family: 'Space Mono', monospace;">
            </div>
            <div>
              <label style="color: #64748B; display: block; margin-bottom: 2px;">Stop-Loss ($)</label>
              <input type="number" id="calc-stop" value="60914" oninput="calcRiskSize()" style="width: 100%; box-sizing: border-box; background: #080914; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.375rem; padding: 0.375rem; color: #FFF; font-family: 'Space Mono', monospace;">
            </div>
          </div>

          <div style="background: rgba(0, 0, 0, 0.4); border-radius: 0.5rem; padding: 0.75rem; font-size: 0.75rem;">
            <div style="color: #94A3B8;">Recommended Max Position:</div>
            <div id="calc-recommended-qty" style="font-size: 1rem; font-family: 'Space Mono', monospace; font-weight: 800; color: #5de3ca; margin: 0.25rem 0;">
              0.3119 Units ($20,000.00)
            </div>
            <div style="color: #64748B; font-size: 0.6875rem;">
              Maximum Capital Risked: $1,000.00 (1.0% of portfolio)
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- RECENT TRADES AUDIT LEDGER -->
    <div style="margin-top: 2rem; background: #14142b; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 1rem; padding: 1.5rem;">
      <h3 style="font-size: 1rem; font-weight: 700; margin: 0 0 1rem 0;">Simulated Trades Ledger</h3>
      
      <?php if (empty($trades)): ?>
        <div style="text-align: center; color: #64748B; padding: 1.5rem; font-size: 0.8125rem;">
          No recorded trades yet.
        </div>
      <?php else: ?>
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.8125rem; text-align: left;">
            <thead>
              <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.08); color: #64748B;">
                <th style="padding: 0.5rem;">TYPE</th>
                <th style="padding: 0.5rem;">ASSET</th>
                <th style="padding: 0.5rem;">QUANTITY</th>
                <th style="padding: 0.5rem;">EXECUTION PRICE</th>
                <th style="padding: 0.5rem;">TOTAL VALUE</th>
                <th style="padding: 0.5rem;">TIMESTAMP</th>
              </tr>
            </thead>
            <tbody>
              <?php foreach ($trades as $t): ?>
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.04);">
                  <td style="padding: 0.5rem;">
                    <span style="font-weight: 800; font-family: 'Space Mono', monospace; color: <?= $t['trade_type'] === 'BUY' ? '#5de3ca' : '#F43F5E' ?>;">
                      <?= htmlspecialchars($t['trade_type']) ?>
                    </span>
                  </td>
                  <td style="padding: 0.5rem; font-weight: 700; color: #FFF;"><?= htmlspecialchars($t['asset_symbol']) ?></td>
                  <td style="padding: 0.5rem; font-family: 'Space Mono', monospace;"><?= number_format((float)$t['quantity'], 4) ?></td>
                  <td style="padding: 0.5rem; font-family: 'Space Mono', monospace;">$<?= number_format((float)$t['price'], 2) ?></td>
                  <td style="padding: 0.5rem; font-family: 'Space Mono', monospace; color: #b6adff;">$<?= number_format((float)$t['total_value'], 2) ?></td>
                  <td style="padding: 0.5rem; color: #64748B; font-size: 0.75rem;"><?= htmlspecialchars($t['created_at']) ?></td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      <?php endif; ?>
    </div>

  </div>
  </div>
</main>

  <script>
    const prices = <?= json_encode($currentPrices) ?>;
    let currentSide = 'BUY';
    const availableCash = <?= (float)$virtualCash ?>;

    function setSide(side) {
      currentSide = side;
      const btnBuy = document.getElementById('btn-side-buy');
      const btnSell = document.getElementById('btn-side-sell');
      const btnSubmit = document.getElementById('btn-submit-order');

      if (side === 'BUY') {
        btnBuy.style.background = '#5de3ca';
        btnBuy.style.color = '#FFF';
        btnBuy.style.border = 'none';
        btnSell.style.background = 'transparent';
        btnSell.style.color = '#94A3B8';
        btnSell.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        btnSubmit.style.background = '#5de3ca';
        btnSubmit.textContent = 'Execute Simulated BUY Order (+30 XP)';
      } else {
        btnSell.style.background = '#F43F5E';
        btnSell.style.color = '#FFF';
        btnSell.style.border = 'none';
        btnBuy.style.background = 'transparent';
        btnBuy.style.color = '#94A3B8';
        btnBuy.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        btnSubmit.style.background = '#F43F5E';
        btnSubmit.textContent = 'Execute Simulated SELL Order (+30 XP)';
      }
      calculateTotal();
    }

    function updateAssetPrice() {
      const sym = document.getElementById('trade-asset').value;
      const pr = prices[sym] || 0;
      document.getElementById('summary-unit-price').textContent = '$' + pr.toLocaleString(undefined, {minimumFractionDigits: 2});
      calculateTotal();
    }

    function calculateTotal() {
      const sym = document.getElementById('trade-asset').value;
      const pr = prices[sym] || 0;
      const qty = parseFloat(document.getElementById('trade-qty').value) || 0;
      const total = qty * pr;
      document.getElementById('summary-total').textContent = '$' + total.toLocaleString(undefined, {minimumFractionDigits: 2});
    }

    function setQuickSize(fraction) {
      const sym = document.getElementById('trade-asset').value;
      const pr = prices[sym] || 1;
      if (currentSide === 'BUY') {
        const cashToUse = availableCash * fraction;
        const qty = cashToUse / pr;
        document.getElementById('trade-qty').value = qty.toFixed(4);
      } else {
        // In SELL mode, size against holdings
        document.getElementById('trade-qty').value = (1.0 * fraction).toFixed(4);
      }
      calculateTotal();
    }

    function calcRiskSize() {
      const entry = parseFloat(document.getElementById('calc-entry').value) || 1;
      const stop = parseFloat(document.getElementById('calc-stop').value) || 1;
      const riskPerCoin = Math.abs(entry - stop);
      if (riskPerCoin > 0) {
        const maxDollarRisk = 1000; // 1% of 100k
        const safeQty = maxDollarRisk / riskPerCoin;
        const totalPosValue = safeQty * entry;
        document.getElementById('calc-recommended-qty').textContent = 
          safeQty.toFixed(4) + ' Units ($' + totalPosValue.toLocaleString(undefined, {maximumFractionDigits: 2}) + ')';
      }
    }

    async function executeTrade(e) {
      e.preventDefault();
      const sym = document.getElementById('trade-asset').value;
      const qty = parseFloat(document.getElementById('trade-qty').value);
      const pr = prices[sym] || 0;

      const formData = new FormData();
      formData.append('symbol', sym);
      formData.append('type', currentSide);
      formData.append('quantity', qty);
      formData.append('price', pr);

      const msgDiv = document.getElementById('trade-result-msg');
      msgDiv.innerHTML = '<span style="color: #b6adff;">Executing simulated order...</span>';

      try {
        const res = await fetch('/api/trade_execute.php', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
          msgDiv.innerHTML = `<span style="color: #5de3ca;">✓ ${data.message}</span>`;
          setTimeout(() => location.reload(), 1400);
        } else {
          msgDiv.innerHTML = `<span style="color: #F43F5E;">✕ ${data.error}</span>`;
        }
      } catch (err) {
        msgDiv.innerHTML = '<span style="color: #F43F5E;">✕ Execution error. Check console.</span>';
      }
    }

    async function resetSandbox() {
      if (!confirm('Are you sure you want to reset your paper wallet back to $100,000 USD? All virtual positions will be liquidated.')) return;
      try {
        const res = await fetch('/api/wallet_reset.php', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          location.reload();
        }
      } catch (e) {
        alert('Reset failed.');
      }
    }

    updateAssetPrice();
    if (typeof lucide !== 'undefined') lucide.createIcons();
  </script>
</body>
</html>
