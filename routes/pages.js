const express = require('express');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { getUserFullData } = require('../services/userService');
const { CURRENT_PRICES } = require('../services/marketPrices');

const { renderLanding } = require('../views/landing');
const { renderDashboard } = require('../views/dashboard');
const { renderLearn } = require('../views/learn');
const { renderLesson } = require('../views/lesson');
const { renderMarkets } = require('../views/markets');
const { renderPractice } = require('../views/practice');
const { renderProfile } = require('../views/profile');

const router = express.Router();

function padColumn(val, width, left = true) {
  const str = String(val ?? '');
  const pad = Math.max(0, width - str.length);
  return left ? str + ' '.repeat(pad) : ' '.repeat(pad) + str;
}

// Landing Page
router.get('/', (req, res) => {
  res.send(renderLanding());
});

// Dashboard
router.get('/dashboard', requireAuth, (req, res) => {
  const user = getUserFullData(req.session.userId);
  if (!user) return res.redirect('/login');

  const completedLessons = db.prepare(`
    SELECT l.title, l.summary, l.key_takeaway 
    FROM user_lesson_progress up 
    JOIN lessons l ON up.lesson_id = l.id 
    WHERE up.user_id = ? AND up.completed = 1 
    ORDER BY up.completed_at DESC 
    LIMIT 5
  `).all(req.session.userId);

  const randomTerm = db.prepare('SELECT term, simple_definition FROM glossary_terms ORDER BY RANDOM() LIMIT 1').get();

  res.send(renderDashboard({
    user,
    completedLessons,
    randomTerm
  }));
});

// Curriculum & Lessons Hub
router.get('/learn', requireAuth, (req, res) => {
  const user = getUserFullData(req.session.userId);
  if (!user) return res.redirect('/login');

  const allLessons = db.prepare(`
    SELECT l.*, 
           m.title AS category_title,
           m.sort_order AS module_order,
           l.sort_order AS order_num,
           'Beginner' AS difficulty,
           COALESCE(p.completed, 0) AS is_completed,
           COALESCE(p.score, 0) AS best_score
    FROM lessons l
    JOIN modules m ON l.module_id = m.id
    LEFT JOIN user_lesson_progress p ON l.id = p.lesson_id AND p.user_id = ?
    ORDER BY m.sort_order ASC, l.sort_order ASC
  `).all(req.session.userId);

  res.send(renderLearn({
    user,
    allLessons
  }));
});

// Individual Lesson Viewer
router.get('/lesson', requireAuth, (req, res) => {
  const lessonId = parseInt(req.query.id, 10) || 1;

  const lesson = db.prepare('SELECT * FROM lessons WHERE id = ? LIMIT 1').get(lessonId);
  if (!lesson) {
    return res.redirect('/learn');
  }

  const quizzes = db.prepare(`
    SELECT q.id, q.question_text AS scenario
    FROM quizzes z
    JOIN quiz_questions q ON z.id = q.quiz_id
    WHERE z.lesson_id = ?
    ORDER BY q.sort_order ASC
  `).all(lessonId);

  const optionsByQid = {};
  if (quizzes.length > 0) {
    const qIds = quizzes.map(q => q.id);
    const placeholders = qIds.map(() => '?').join(',');
    const allOptions = db.prepare(`
      SELECT id, question_id, option_text 
      FROM quiz_options 
      WHERE question_id IN (${placeholders}) 
      ORDER BY id ASC
    `).all(...qIds);

    for (const opt of allOptions) {
      if (!optionsByQid[opt.question_id]) optionsByQid[opt.question_id] = [];
      optionsByQid[opt.question_id].push(opt);
    }
  }

  const savedNotes = db.prepare(`
    SELECT note_text, updated_at 
    FROM user_notes 
    WHERE user_id = ? AND lesson_id = ? 
    ORDER BY updated_at DESC
  `).all(req.session.userId, lessonId);

  res.send(renderLesson({
    lesson,
    quizzes,
    optionsByQid,
    savedNotes
  }));
});

// Live Market Overview
router.get('/markets', requireAuth, (req, res) => {
  const user = getUserFullData(req.session.userId);
  if (!user) return res.redirect('/login');

  res.send(renderMarkets({ user }));
});

// Paper Trading Simulation Desk
router.get('/practice', requireAuth, (req, res) => {
  const user = getUserFullData(req.session.userId);
  if (!user) return res.redirect('/login');

  let wallet = db.prepare('SELECT id, virtual_cash FROM wallets WHERE user_id = ?').get(req.session.userId);
  if (!wallet) {
    db.prepare("INSERT INTO wallets (user_id, virtual_cash, updated_at) VALUES (?, 100000.00, datetime('now'))").run(req.session.userId);
    wallet = { id: 1, virtual_cash: 100000.00 };
  }

  const virtualCash = Number(wallet.virtual_cash);
  const holdings = db.prepare('SELECT * FROM wallet_assets WHERE wallet_id = ? ORDER BY updated_at DESC').all(wallet.id);

  let holdingsValue = 0;
  const holdingVals = {};
  for (const h of holdings) {
    const sym = h.asset_symbol;
    const price = CURRENT_PRICES[sym] !== undefined ? CURRENT_PRICES[sym] : 1.0;
    const val = Number(h.quantity) * price;
    holdingsValue += val;
    if (val > 0) holdingVals[sym] = val;
  }

  const portfolioTotal = virtualCash + holdingsValue;
  const pnlDollar = portfolioTotal - 100000.00;
  const pnlPercent = (pnlDollar / 100000.00) * 100.0;

  const allocations = {};
  if (portfolioTotal > 0) {
    const colors = ['#f6a623', '#9d8cff', '#5de3ca', '#e84142', '#8247e5', '#f06427'];
    let cIdx = 0;
    const sortedSyms = Object.keys(holdingVals).sort((a, b) => holdingVals[b] - holdingVals[a]);
    for (const sym of sortedSyms) {
      const pct = (holdingVals[sym] / portfolioTotal) * 100;
      if (pct >= 0.1) {
        allocations[sym] = { pct, color: colors[cIdx % colors.length] };
        cIdx++;
      }
    }
    const cashPct = (virtualCash / portfolioTotal) * 100;
    if (cashPct >= 0.1) {
      allocations['Cash'] = { pct: cashPct, color: '#7195ff' };
    }
  } else {
    allocations['Cash'] = { pct: 100, color: '#7195ff' };
  }

  const trades = db.prepare('SELECT * FROM trades WHERE user_id = ? ORDER BY created_at DESC LIMIT 10').all(req.session.userId);

  let preselectedAsset = (req.query.asset || 'BTC').toUpperCase();
  if (!CURRENT_PRICES[preselectedAsset]) preselectedAsset = 'BTC';

  res.send(renderPractice({
    user,
    virtualCash,
    portfolioTotal,
    pnlDollar,
    pnlPercent,
    allocations,
    holdings,
    trades,
    preselectedAsset,
    currentPrices: CURRENT_PRICES
  }));
});

// Profile and Account Settings
router.get('/profile', requireAuth, (req, res) => {
  const user = getUserFullData(req.session.userId);
  if (!user) return res.redirect('/login');

  const holdings = db.prepare(`
    SELECT wa.asset_symbol, wa.quantity, wa.avg_buy_price 
    FROM wallet_assets wa
    JOIN wallets w ON wa.wallet_id = w.id
    WHERE w.user_id = ? AND wa.quantity > 0
  `).all(req.session.userId);

  let investedAssets = 0;
  for (const h of holdings) {
    investedAssets += (Number(h.quantity) * Number(h.avg_buy_price));
  }

  const cash = Number(user.virtual_cash || 0);
  const estimatedTotal = cash + investedAssets;
  const buyingPower = cash;

  const xp = user.xp_total || 0;
  const current_level = user.current_level || 1;
  const streak = user.streak_days || 1;

  const xpNeeded = 600;
  const currentXpInLevel = xp % 600;
  const progressPercent = (currentXpInLevel / xpNeeded) * 100;
  const xpToNext = 600 - currentXpInLevel;

  const recentTrades = db.prepare('SELECT trade_type, asset_symbol, quantity, created_at FROM trades WHERE user_id = ? ORDER BY created_at DESC LIMIT 10').all(req.session.userId);
  const recentLessons = db.prepare(`
    SELECT l.title as lesson_title, m.title as module_title, up.completed_at 
    FROM user_lesson_progress up
    JOIN lessons l ON up.lesson_id = l.id
    JOIN modules m ON l.module_id = m.id
    WHERE up.user_id = ? AND up.completed = 1
    ORDER BY up.completed_at DESC LIMIT 10
  `).all(req.session.userId);

  const activity = [];
  for (const trade of recentTrades) {
    const action = trade.trade_type === 'BUY' ? 'Bought' : 'Sold';
    const qty = parseFloat(Number(trade.quantity).toFixed(4));
    activity.push({
      title: `${action} ${trade.asset_symbol}`,
      detail: `${qty} ${trade.asset_symbol} · Paper trade`,
      timeRaw: new Date(trade.created_at).getTime(),
      icon: 'wallet',
      tone: trade.trade_type === 'BUY' ? 'violet' : 'orange'
    });
  }

  for (const lesson of recentLessons) {
    activity.push({
      title: `Completed "${lesson.lesson_title}"`,
      detail: lesson.module_title,
      timeRaw: new Date(lesson.completed_at).getTime(),
      icon: 'check',
      tone: 'mint'
    });
  }

  activity.push({
    title: 'Started your journey',
    detail: 'Joined CryptoVerse',
    timeRaw: user.created_at ? new Date(user.created_at).getTime() : Date.now(),
    icon: 'zap',
    tone: 'amber'
  });

  activity.sort((a, b) => b.timeRaw - a.timeRaw);
  const topActivity = activity.slice(0, 6).map(act => {
    const d = new Date(act.timeRaw);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let hours = d.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const mins = String(d.getMinutes()).padStart(2, '0');
    return {
      title: act.title,
      detail: act.detail,
      icon: act.icon,
      tone: act.tone,
      time: `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}, ${hours}:${mins} ${ampm}`
    };
  });

  let memberSince = 'Recently';
  if (user.created_at) {
    const d = new Date(user.created_at);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    memberSince = `${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  res.send(renderProfile({
    userRow: user,
    email: user.email,
    memberSince,
    estimatedTotal,
    cash,
    investedAssets,
    buyingPower,
    current_level,
    progressPercent,
    xp,
    xpNeeded,
    currentXpInLevel,
    xpToNext,
    streak,
    holdings,
    activity: topActivity,
    successMessage: req.query.success || '',
    errorMessage: req.query.error || ''
  }));
});

router.post('/profile', requireAuth, (req, res) => {
  const action = req.body.action;

  if (action === 'update_profile') {
    const newUsername = (req.body.username || '').trim();
    const newEmail = (req.body.email || '').trim();

    if (newUsername && newEmail) {
      try {
        db.prepare('UPDATE users SET username = ?, email = ? WHERE id = ?').run(newUsername, newEmail, req.session.userId);
        req.session.username = newUsername;
        req.session.email = newEmail;
        return res.redirect('/profile?success=' + encodeURIComponent('Profile updated successfully!'));
      } catch (err) {
        return res.redirect('/profile?error=' + encodeURIComponent('Could not update profile. Username or email might be taken.'));
      }
    }
  } else if (action === 'add_funds') {
    const amount = parseFloat(req.body.amount) || 0;
    if (amount > 0 && amount <= 1000000) {
      db.prepare('UPDATE wallets SET virtual_cash = virtual_cash + ? WHERE user_id = ?').run(amount, req.session.userId);
      return res.redirect('/profile?success=' + encodeURIComponent('$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2 }) + ' paper funds added to your wallet!'));
    }
  }

  res.redirect('/profile');
});

// Paper Trading Report Export
router.get(['/export-history', '/export_history'], requireAuth, (req, res) => {
  const user = getUserFullData(req.session.userId);
  if (!user) return res.redirect('/login');

  const wallet = db.prepare('SELECT virtual_cash FROM wallets WHERE user_id = ?').get(req.session.userId);
  const balance = wallet ? Number(wallet.virtual_cash) : 0;
  const trades = db.prepare('SELECT * FROM trades WHERE user_id = ? ORDER BY created_at DESC').all(req.session.userId);

  const now = new Date();
  const filename = `cryptoverse_history_${now.toISOString().slice(0, 10)}.txt`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  let report = "=========================================================\n";
  report += " CRYPTOVERSE - PAPER TRADING HISTORY\n";
  report += "=========================================================\n";
  report += `Account: ${user.name} (ID: ${user.id})\n`;
  report += `Generated: ${now.toISOString()}\n`;
  report += `Current Available Balance: $${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
  report += "=========================================================\n\n";

  if (trades.length === 0) {
    report += "No trading activity found.\n";
  } else {
    report += `${padColumn('Date', 20)} | ${padColumn('Type', 10)} | ${padColumn('Asset', 10)} | ${padColumn('Quantity', 15)} | ${padColumn('Price', 15)} | ${padColumn('Net Cash Impact', 15)}\n`;
    report += "-".repeat(98) + "\n";

    for (const trade of trades) {
      const date = trade.created_at;
      const type = trade.trade_type;
      const asset = trade.asset_symbol;
      const qty = parseFloat(Number(trade.quantity).toFixed(8)).toString();
      const price = "$" + Number(trade.price).toFixed(2);
      const impact = (type === 'BUY' ? "-" : "+") + "$" + Number(trade.total_value).toFixed(2);
      report += `${padColumn(date, 20)} | ${padColumn(type, 10)} | ${padColumn(asset, 10)} | ${padColumn(qty, 15)} | ${padColumn(price, 15)} | ${padColumn(impact, 15)}\n`;
    }
  }

  report += "\n=========================================================\n";
  report += " End of Report\n";
  report += "=========================================================\n";

  res.send(report);
});

module.exports = router;
