const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { requireGuest } = require('../middleware/auth');
const { renderLogin } = require('../views/login');
const { renderSignup } = require('../views/signup');

const router = express.Router();

router.get('/login', requireGuest, (req, res) => {
  res.send(renderLogin());
});

router.post('/login', requireGuest, (req, res) => {
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

  db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(user.id);

  req.session.userId = user.id;
  req.session.name = user.name;
  req.session.username = user.username;
  req.session.email = user.email;
  req.session.role = user.role;

  res.redirect('/dashboard');
});

router.get('/signup', requireGuest, (req, res) => {
  res.send(renderSignup());
});

router.post('/signup', requireGuest, (req, res) => {
  const name = (req.body.name || '').trim();
  const username = (req.body.username || '').trim();
  const email = (req.body.email || '').trim();
  const password = req.body.password || '';
  const confirmPassword = req.body.confirm_password || '';

  if (!name || !username || !email || !password || !confirmPassword) {
    return res.send(renderSignup({ error: 'Please fill out all fields.', name, username, email }));
  }

  if (name.length < 2) {
    return res.send(renderSignup({ error: 'Full name must be at least 2 characters.', name, username, email }));
  }

  if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
    return res.send(renderSignup({ error: 'Username must be 3-30 alphanumeric characters or underscores.', name, username, email }));
  }

  if (password !== confirmPassword) {
    return res.send(renderSignup({ error: 'Passwords do not match.', name, username, email }));
  }

  if (password.length < 8) {
    return res.send(renderSignup({ error: 'Password must be at least 8 characters long.', name, username, email }));
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1').get(email, username);
  if (existing) {
    return res.send(renderSignup({ error: 'An account with that email or username already exists.', name, username, email }));
  }

  try {
    const passwordHash = bcrypt.hashSync(password, 10);
    const result = db.prepare(`
      INSERT INTO users (name, username, email, password_hash, experience_level, role)
      VALUES (?, ?, ?, ?, 'BEGINNER', 'STUDENT')
    `).run(name, username, email, passwordHash);

    const newUserId = Number(result.lastInsertRowid);

    db.prepare(`
      INSERT INTO user_profiles (user_id, xp_total, current_level, streak_days, last_active_date)
      VALUES (?, 100, 1, 1, date('now'))
    `).run(newUserId);

    db.prepare(`
      INSERT INTO wallets (user_id, virtual_cash)
      VALUES (?, 100000.00)
    `).run(newUserId);

    db.prepare(`
      INSERT INTO user_lesson_progress (user_id, lesson_id, completed, score, completed_at)
      VALUES (?, 1, 1, 100, datetime('now'))
    `).run(newUserId);

    req.session.userId = newUserId;
    req.session.name = name;
    req.session.username = username;
    req.session.email = email;
    req.session.role = 'STUDENT';

    res.redirect('/dashboard');
  } catch (err) {
    console.error('Registration error:', err);
    res.send(renderSignup({ error: 'An error occurred during registration. Please try again.', name, username, email }));
  }
});

router.all('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
