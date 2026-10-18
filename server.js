require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const multer = require('multer');

const { initDatabase } = require('./db');
const authRoutes = require('./routes/auth');
const pagesRoutes = require('./routes/pages');
const apiRoutes = require('./routes/api');

// Initialize database
initDatabase();

const app = express();
const PORT = process.env.PORT || 3000;

// Body & Form Parsers
const upload = multer();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(upload.none());
app.use(cookieParser());

// Session management
app.use(session({
  name: 'cryptoverse_sess',
  secret: process.env.SESSION_SECRET || 'cryptoverse_secret_key_2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax'
  }
}));

// Static files
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Redirect legacy .php requests cleanly
app.use((req, res, next) => {
  if (req.path.endsWith('.php')) {
    const cleanPath = req.path.replace(/\.php$/, '');
    const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    return res.redirect(301, cleanPath + query);
  }
  next();
});

// App Routers
app.use('/api', apiRoutes);
app.use('/', authRoutes);
app.use('/', pagesRoutes);

// Catch-all 404
app.use((req, res) => {
  res.status(404).redirect('/');
});

app.listen(PORT, () => {
  console.log(`CryptoVerse running at http://localhost:${PORT}`);
});

module.exports = app;
