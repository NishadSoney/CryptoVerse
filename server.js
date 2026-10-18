const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');

const { db, initDatabase } = require('./db');
const { getCryptoNews } = require('./services/newsService');

const { renderLanding } = require('./views/landing');
const { renderLogin } = require('./views/login');
const { renderSignup } = require('./views/signup');
const { renderDashboard } = require('./views/dashboard');
const { renderLearn } = require('./views/learn');
const { renderLesson } = require('./views/lesson');
const { renderMarkets } = require('./views/markets');
const { renderPractice } = require('./views/practice');
const { renderProfile } = require('./views/profile');

// Initialize database & seed data on startup
initDatabase();

const app = express();
const PORT = process.env.PORT || 3000;

// Body Parsers (handling URL-encoded, JSON, and multipart/form-data from fetch FormData)
const upload = multer();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(upload.none()); // parses FormData fields into req.body
app.use(cookieParser());

// Session management
app.use(session({
  name: 'cryptoverse_sess',
  secret: process.env.SESSION_SECRET || 'cryptoverse_jwt_secret_key_2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax'
  }
}));

// Static Assets
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'public')));

// Authentication Middleware
function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.redirect('/login.php');
  }
  next();
}

function requireGuest(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard.php');
  }
  next();
}

// User Fetch Helper
function getUserFullData(userId) {
  const stmt = db.prepare(`
    SELECT u.id, u.name, u.username, u.email, u.role, u.experience_level, u.created_at,
           p.xp_total, p.current_level, p.streak_days, w.virtual_cash, w.id as wallet_id
    FROM users u
    LEFT JOIN user_profiles p ON u.id = p.user_id
    LEFT JOIN wallets w ON u.id = w.user_id
    WHERE u.id = ?
    LIMIT 1
  `);
  return stmt.get(userId);
}

// Current Prices Reference
const CURRENT_PRICES = {
  'BTC': 64120.00, 'ETH': 3480.50, 'BNB': 585.40, 'SOL': 154.20, 
  'XRP': 0.60, 'ADA': 0.38, 'DOGE': 0.16, 'AVAX': 30.00, 
  'LINK': 14.50, 'DOT': 6.20, 'MATIC': 0.70, 'LTC': 85.00, 
  'SHIB': 0.00002, 'BCH': 450.00, 'UNI': 7.80, 'TRX': 0.11, 
  'NEAR': 6.50, 'APT': 8.20, 'ARB': 1.10, 'FIL': 5.80, 
  'FET': 2.10, 'RNDR': 9.50, 'GRT': 0.30, 'IMX': 2.20, 
  'GALA': 0.04, 'ENJ': 0.30, 'PEPE': 0.000008
};

// ==========================================
// 1. LANDING PAGE
// ==========================================
app.get(['/', '/index.php', '/index.html'], (req, res) => {
  res.send(renderLanding());
});

// ==========================================
// 2. AUTHENTICATION (LOGIN / SIGNUP / LOGOUT)
// ==========================================
app.get(['/login', '/login.php'], requireGuest, (req, res) => {
  res.send(renderLogin());
});

app.post(['/login', '/login.php'], requireGuest, (req, res) => {
  const email = (req.body.email || '').trim();
  const password = req.body.password || '';

  if (!email || !password) {
    return res.send(renderLogin({ error: 'Please enter both email and password.', email }));
  }

  const user = db.prepare(`
    SELECT u.id, u.name, u.username, u.email, u.password_hash, u.experience_level, u.role
    FROM users u
    WHERE u.email = ? OR u.username = ?
    LIMIT 1
  `).get(email, email);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.send(renderLogin({ error: 'Invalid email/username or password.', email }));
  }

  // Update last login
  db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(user.id);

  // Set session
  req.session.userId = user.id;
  req.session.name = user.name;
  req.session.username = user.username;
  req.session.email = user.email;
  req.session.role = user.role;

  res.redirect('/dashboard.php');
});

app.get(['/signup', '/signup.php'], requireGuest, (req, res) => {
  res.send(renderSignup());
});

app.post(['/signup', '/signup.php'], requireGuest, (req, res) => {
  const name = (req.body.name || '').trim();
  const username = (req.body.username || '').trim();
  const email = (req.body.email || '').trim();
  const password = req.body.password || '';
  const confirm_password = req.body.confirm_password || '';

  if (!name || !username || !email || !password || !confirm_password) {
    return res.send(renderSignup({ error: 'Please fill out all fields.', name, username, email }));
  }

  if (name.length < 2) {
    return res.send(renderSignup({ error: 'Full name must be at least 2 characters.', name, username, email }));
  }

  if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
    return res.send(renderSignup({ error: 'Username must be 3-30 alphanumeric characters or underscores.', name, username, email }));
  }

  if (password !== confirm_password) {
    return res.send(renderSignup({ error: 'Passwords do not match. Please try again.', name, username, email }));
  }

  if (password.length < 8) {
    return res.send(renderSignup({ error: 'Password must be at least 8 characters long.', name, username, email }));
  }

  // Check unique username or email
  const existing = db.prepare('SELECT id, email, username FROM users WHERE email = ? OR username = ? LIMIT 1').get(email, username);
  if (existing) {
    if (existing.email.toLowerCase() === email.toLowerCase()) {
      return res.send(renderSignup({ error: 'An account with this email address already exists.', name, username, email }));
    }
    return res.send(renderSignup({ error: 'That username is already taken. Please choose another.', name, username, email }));
  }

  const hash = bcrypt.hashSync(password, 10);

  try {
    const insertUser = db.prepare(`
      INSERT INTO users (name, username, email, password_hash, experience_level, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'BEGINNER', 'STUDENT', datetime('now'), datetime('now'))
    `);
    const info = insertUser.run(name, username, email, hash);
    const newUserId = Number(info.lastInsertRowid);

    // Create user profile
    db.prepare(`
      INSERT INTO user_profiles (user_id, xp_total, current_level, streak_days, last_active_date)
      VALUES (?, 0, 1, 1, date('now'))
    `).run(newUserId);

    // Create wallet with $100k
    db.prepare(`
      INSERT INTO wallets (user_id, virtual_cash, created_at, updated_at)
      VALUES (?, 100000.00, datetime('now'), datetime('now'))
    `).run(newUserId);

    // Set session
    req.session.userId = newUserId;
    req.session.name = name;
    req.session.username = username;
    req.session.email = email;
    req.session.role = 'STUDENT';

    res.redirect('/dashboard.php');
  } catch (err) {
    console.error('Registration error:', err);
    res.send(renderSignup({ error: 'A server error occurred. Please try again.', name, username, email }));
  }
});

app.get(['/logout', '/logout.php'], (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.php');
  });
});

// ==========================================
// 3. DASHBOARD
// ==========================================
app.get(['/dashboard', '/dashboard.php'], requireAuth, (req, res) => {
  const user = getUserFullData(req.session.userId);
  if (!user) return res.redirect('/login.php');

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

// ==========================================
// 4. LEARN & LESSONS
// ==========================================
app.get(['/learn', '/learn.php'], requireAuth, (req, res) => {
  const user = getUserFullData(req.session.userId);
  if (!user) return res.redirect('/login.php');

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

app.get(['/lesson', '/lesson.php'], requireAuth, (req, res) => {
  const lessonId = parseInt(req.query.id) || 1;

  const lesson = db.prepare('SELECT * FROM lessons WHERE id = ? LIMIT 1').get(lessonId);
  if (!lesson) {
    return res.redirect('/learn.php');
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
    const allOptions = db.prepare(`SELECT id, question_id, option_text FROM quiz_options WHERE question_id IN (${placeholders}) ORDER BY id ASC`).all(...qIds);
    for (const opt of allOptions) {
      if (!optionsByQid[opt.question_id]) optionsByQid[opt.question_id] = [];
      optionsByQid[opt.question_id].push(opt);
    }
  }

  const savedNotes = db.prepare('SELECT note_text, updated_at FROM user_notes WHERE user_id = ? AND lesson_id = ? ORDER BY updated_at DESC').all(req.session.userId, lessonId);

  res.send(renderLesson({
    lesson,
    quizzes,
    optionsByQid,
    savedNotes
  }));
});

// ==========================================
// 5. MARKETS
// ==========================================
app.get(['/markets', '/markets.php'], requireAuth, (req, res) => {
  const user = getUserFullData(req.session.userId);
  if (!user) return res.redirect('/login.php');

  res.send(renderMarkets({ user }));
});

// ==========================================
// 6. PRACTICE PAPER TRADING
// ==========================================
app.get(['/practice', '/practice.php'], requireAuth, (req, res) => {
  const user = getUserFullData(req.session.userId);
  if (!user) return res.redirect('/login.php');

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

// ==========================================
// 7. PROFILE & ACCOUNT SETTINGS
// ==========================================
app.get(['/profile', '/profile.php'], requireAuth, (req, res) => {
  const user = getUserFullData(req.session.userId);
  if (!user) return res.redirect('/login.php');

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

app.post(['/profile', '/profile.php'], requireAuth, (req, res) => {
  const action = req.body.action;

  if (action === 'update_profile') {
    const newUsername = (req.body.username || '').trim();
    const newEmail = (req.body.email || '').trim();

    if (newUsername && newEmail) {
      try {
        db.prepare('UPDATE users SET username = ?, email = ? WHERE id = ?').run(newUsername, newEmail, req.session.userId);
        req.session.username = newUsername;
        req.session.email = newEmail;
        return res.redirect('/profile.php?success=' + encodeURIComponent('Profile updated successfully!'));
      } catch (err) {
        return res.redirect('/profile.php?error=' + encodeURIComponent('Could not update profile. Username or email might be taken.'));
      }
    }
  } else if (action === 'add_funds') {
    const amount = parseFloat(req.body.amount) || 0;
    if (amount > 0 && amount <= 1000000) {
      db.prepare('UPDATE wallets SET virtual_cash = virtual_cash + ? WHERE user_id = ?').run(amount, req.session.userId);
      return res.redirect('/profile.php?success=' + encodeURIComponent('$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2 }) + ' paper funds added to your wallet!'));
    }
  }

  res.redirect('/profile.php');
});

// ==========================================
// 8. EXPORT HISTORY
// ==========================================
app.get(['/export_history', '/export_history.php'], requireAuth, (req, res) => {
  const user = getUserFullData(req.session.userId);
  if (!user) return res.redirect('/login.php');

  const wallet = db.prepare('SELECT virtual_cash FROM wallets WHERE user_id = ?').get(req.session.userId);
  const balance = wallet ? Number(wallet.virtual_cash) : 0;
  const trades = db.prepare('SELECT * FROM trades WHERE user_id = ? ORDER BY created_at DESC').all(req.session.userId);

  const now = new Date();
  const filename = `cryptoverse_history_${now.toISOString().slice(0, 10)}_${now.getHours()}-${now.getMinutes()}.txt`;

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
    report += sprintf("%-20s | %-10s | %-10s | %-15s | %-15s | %-15s\n", "Date", "Type", "Asset", "Quantity", "Price", "Net Cash Impact");
    report += "-".repeat(98) + "\n";

    for (const trade of trades) {
      const date = trade.created_at;
      const type = trade.trade_type;
      const asset = trade.asset_symbol;
      const qty = parseFloat(Number(trade.quantity).toFixed(8)).toString();
      const price = "$" + Number(trade.price).toFixed(2);
      const impact = (type === 'BUY' ? "-" : "+") + "$" + Number(trade.total_value).toFixed(2);
      report += sprintf("%-20s | %-10s | %-10s | %-15s | %-15s | %-15s\n", date, type, asset, qty, price, impact);
    }
  }

  report += "\n=========================================================\n";
  report += " End of Report\n";
  report += "=========================================================\n";

  res.send(report);
});

function sprintf(format, ...args) {
  let i = 0;
  return format.replace(/%-?(\d+)s/g, (match, width) => {
    const val = String(args[i++] ?? '');
    const isLeft = match.startsWith('%-');
    const pad = Math.max(0, parseInt(width) - val.length);
    return isLeft ? val + ' '.repeat(pad) : ' '.repeat(pad) + val;
  });
}

// ==========================================
// 9. API ENDPOINTS
// ==========================================

// News API
app.get(['/api/news', '/api/news.php'], async (req, res) => {
  const articles = await getCryptoNews();
  res.json({ success: true, articles });
});

// Student Notes API
app.post(['/api/notes', '/api/notes.php'], (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const lessonId = parseInt(req.body.lesson_id);
  const noteText = (req.body.note_text || '').trim();

  if (!lessonId) {
    return res.status(400).json({ success: false, error: 'Invalid lesson ID' });
  }

  db.prepare(`
    INSERT INTO user_notes (user_id, lesson_id, note_text, updated_at)
    VALUES (?, ?, ?, datetime('now'))
  `).run(req.session.userId, lessonId, noteText);

  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let hours = now.getHours();
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12;
  const mins = String(now.getMinutes()).padStart(2, '0');
  const timestamp = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}, ${hours}:${mins} ${ampm}`;

  res.json({ success: true, timestamp });
});

// Quiz Submission & XP Engine API
app.post(['/api/quiz_submit', '/api/quiz_submit.php'], (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const lessonId = parseInt(req.body.lesson_id);
  if (!lessonId) {
    return res.status(400).json({ success: false, error: 'Invalid lesson ID' });
  }

  const quiz = db.prepare('SELECT id, pass_score, xp_reward FROM quizzes WHERE lesson_id = ?').get(lessonId);
  if (!quiz) {
    return res.json({ success: false, error: 'No quiz found for this lesson' });
  }

  const questions = db.prepare(`
    SELECT q.id, o.id AS correct_option_id
    FROM quizzes z
    JOIN quiz_questions q ON z.id = q.quiz_id
    JOIN quiz_options o ON q.id = o.question_id
    WHERE z.lesson_id = ? AND o.is_correct = 1
  `).all(lessonId);

  if (questions.length === 0) {
    return res.json({ success: false, error: 'No quiz questions configured' });
  }

  let correctCount = 0;
  for (const q of questions) {
    const field = 'question_' + q.id;
    const userAnswer = parseInt(req.body[field]);
    if (userAnswer === Number(q.correct_option_id)) {
      correctCount++;
    }
  }

  const totalQuestions = questions.length;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);
  const passed = scorePercent >= (quiz.pass_score || 70);

  let xpAwarded = 0;
  if (passed) {
    xpAwarded = quiz.xp_reward || 75;

    // Check if already completed
    const existingProgress = db.prepare('SELECT completed, score FROM user_lesson_progress WHERE user_id = ? AND lesson_id = ?').get(req.session.userId, lessonId);

    if (!existingProgress || !existingProgress.completed) {
      db.prepare(`
        INSERT INTO user_lesson_progress (user_id, lesson_id, completed, score, completed_at)
        VALUES (?, ?, 1, ?, datetime('now'))
        ON CONFLICT(user_id, lesson_id) DO UPDATE SET completed = 1, score = max(score, excluded.score), completed_at = datetime('now')
      `).run(req.session.userId, lessonId, scorePercent);

      // Award XP
      db.prepare('UPDATE user_profiles SET xp_total = xp_total + ?, current_level = 1 + CAST((xp_total + ?) / 500 AS INT) WHERE user_id = ?').run(xpAwarded, xpAwarded, req.session.userId);
    }

    // Record quiz result
    db.prepare(`
      INSERT INTO quiz_results (user_id, quiz_id, score_percent, xp_awarded, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `).run(req.session.userId, quiz.id, scorePercent, xpAwarded);
  }

  const updatedProfile = db.prepare('SELECT xp_total, current_level FROM user_profiles WHERE user_id = ?').get(req.session.userId);

  res.json({
    success: passed,
    score: scorePercent,
    xp_awarded: xpAwarded,
    passed,
    total_xp: updatedProfile ? updatedProfile.xp_total : 0,
    current_level: updatedProfile ? updatedProfile.current_level : 1
  });
});

// Paper Trade Order Execution API
app.post(['/api/trade_execute', '/api/trade_execute.php'], (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized session. Please log in.' });
  }

  const userId = req.session.userId;
  const symbol = (req.body.symbol || '').toUpperCase().trim();
  const type = (req.body.type || '').toUpperCase().trim();
  const quantity = parseFloat(req.body.quantity) || 0;
  const unitPrice = parseFloat(req.body.price) || 0;

  if (!symbol || !['BUY', 'SELL'].includes(type) || quantity <= 0 || unitPrice <= 0) {
    return res.json({ success: false, error: 'Invalid trade parameters provided.' });
  }

  if (!/^[A-Z0-9]{2,10}$/.test(symbol)) {
    return res.json({ success: false, error: 'Invalid ticker symbol format.' });
  }

  const totalOrderValue = quantity * unitPrice;

  try {
    db.exec('BEGIN TRANSACTION');

    const wallet = db.prepare('SELECT id, virtual_cash FROM wallets WHERE user_id = ?').get(userId);
    if (!wallet) {
      db.exec('ROLLBACK');
      return res.json({ success: false, error: 'Virtual paper wallet not found.' });
    }

    const walletId = wallet.id;
    const currentCash = Number(wallet.virtual_cash);

    if (type === 'BUY') {
      if (currentCash < totalOrderValue) {
        db.exec('ROLLBACK');
        return res.json({
          success: false,
          error: `Insufficient virtual cash. Need $${totalOrderValue.toFixed(2)}, available: $${currentCash.toFixed(2)}`
        });
      }

      // Deduct cash
      const newCash = currentCash - totalOrderValue;
      db.prepare("UPDATE wallets SET virtual_cash = ?, updated_at = datetime('now') WHERE id = ?").run(newCash, walletId);

      // Check existing holding
      const existing = db.prepare('SELECT id, quantity, avg_buy_price FROM wallet_assets WHERE wallet_id = ? AND asset_symbol = ?').get(walletId, symbol);

      if (existing) {
        const oldQty = Number(existing.quantity);
        const oldAvg = Number(existing.avg_buy_price);
        const newQty = oldQty + quantity;
        const newAvg = ((oldQty * oldAvg) + totalOrderValue) / newQty;
        db.prepare("UPDATE wallet_assets SET quantity = ?, avg_buy_price = ?, updated_at = datetime('now') WHERE id = ?").run(newQty, newAvg, existing.id);
      } else {
        db.prepare("INSERT INTO wallet_assets (wallet_id, asset_symbol, quantity, avg_buy_price, updated_at) VALUES (?, ?, ?, ?, datetime('now'))").run(walletId, symbol, quantity, unitPrice);
      }

      // Record trade
      db.prepare(`
        INSERT INTO trades (user_id, asset_symbol, trade_type, quantity, price, total_value, created_at)
        VALUES (?, ?, 'BUY', ?, ?, ?, datetime('now'))
      `).run(userId, symbol, quantity, unitPrice, totalOrderValue);

      db.exec('COMMIT');
      return res.json({
        success: true,
        message: `Bought ${quantity} ${symbol} at $${unitPrice.toFixed(2)} USD.`,
        balance: newCash
      });
    } else {
      // SELL
      const existing = db.prepare('SELECT id, quantity FROM wallet_assets WHERE wallet_id = ? AND asset_symbol = ?').get(walletId, symbol);
      const heldQty = existing ? Number(existing.quantity) : 0;

      if (!existing || heldQty < quantity) {
        db.exec('ROLLBACK');
        return res.json({
          success: false,
          error: `Insufficient ${symbol} holdings. You hold ${heldQty}, tried to sell ${quantity}`
        });
      }

      // Credit cash
      const newCash = currentCash + totalOrderValue;
      db.prepare("UPDATE wallets SET virtual_cash = ?, updated_at = datetime('now') WHERE id = ?").run(newCash, walletId);

      const remainingQty = heldQty - quantity;
      if (remainingQty <= 0.00000001) {
        db.prepare('DELETE FROM wallet_assets WHERE id = ?').run(existing.id);
      } else {
        db.prepare("UPDATE wallet_assets SET quantity = ?, updated_at = datetime('now') WHERE id = ?").run(remainingQty, existing.id);
      }

      // Record trade
      db.prepare(`
        INSERT INTO trades (user_id, asset_symbol, trade_type, quantity, price, total_value, created_at)
        VALUES (?, ?, 'SELL', ?, ?, ?, datetime('now'))
      `).run(userId, symbol, quantity, unitPrice, totalOrderValue);

      db.exec('COMMIT');
      return res.json({
        success: true,
        message: `Sold ${quantity} ${symbol} at $${unitPrice.toFixed(2)} USD.`,
        balance: newCash
      });
    }
  } catch (err) {
    db.exec('ROLLBACK');
    console.error('Trade execution error:', err);
    res.json({ success: false, error: 'Internal order execution error.' });
  }
});

// Wallet Reset API
app.post(['/api/wallet_reset', '/api/wallet_reset.php'], (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const userId = req.session.userId;
  try {
    db.exec('BEGIN TRANSACTION');
    db.prepare("UPDATE wallets SET virtual_cash = 100000.00, updated_at = datetime('now') WHERE user_id = ?").run(userId);
    const wallet = db.prepare('SELECT id FROM wallets WHERE user_id = ?').get(userId);
    if (wallet) {
      db.prepare('DELETE FROM wallet_assets WHERE wallet_id = ?').run(wallet.id);
    }
    db.exec('COMMIT');

    res.json({
      success: true,
      message: 'Virtual paper trading balance reset to $100,000.00 USD.'
    });
  } catch (err) {
    db.exec('ROLLBACK');
    res.json({ success: false, error: 'Failed to reset virtual wallet.' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n=================================================`);
  console.log(`🚀 CryptoVerse Server running at http://localhost:${PORT}`);
  console.log(`💡 No WAMP, Apache, or MySQL required! Fully standalone.`);
  console.log(`🔑 Demo User: student@cryptoverse.edu / password123`);
  console.log(`=================================================\n`);
});
