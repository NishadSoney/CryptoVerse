const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'database', 'cryptoverse.db');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

function initDatabase() {
  // Check if users table exists
  const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
  if (tableCheck) {
    console.log('Database already initialized.');
    return db;
  }

  console.log('Initializing new SQLite database at:', dbPath);

  // 1. Create Tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      experience_level TEXT DEFAULT 'BEGINNER',
      role TEXT DEFAULT 'STUDENT',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    );

    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id INTEGER PRIMARY KEY,
      avatar_url TEXT DEFAULT '/assets/images/avatars/default.svg',
      xp_total INTEGER DEFAULT 0,
      current_level INTEGER DEFAULT 1,
      streak_days INTEGER DEFAULT 1,
      last_active_date DATE,
      preferred_chart_mode TEXT DEFAULT 'SIMPLE',
      enable_3d_effects INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS wallets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      virtual_cash REAL NOT NULL DEFAULT 100000.00,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS wallet_assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wallet_id INTEGER NOT NULL,
      asset_symbol TEXT NOT NULL,
      quantity REAL NOT NULL DEFAULT 0.0,
      avg_buy_price REAL NOT NULL DEFAULT 0.0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(wallet_id, asset_symbol),
      FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      asset_symbol TEXT NOT NULL,
      trade_type TEXT NOT NULL,
      quantity REAL NOT NULL,
      price REAL NOT NULL,
      total_value REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS watchlist_assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      asset_symbol TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, asset_symbol),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      badge_icon TEXT DEFAULT 'book-open',
      sort_order INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS modules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      level_badge TEXT DEFAULT 'LEVEL 1 — FOUNDATIONS',
      sort_order INTEGER DEFAULT 1,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_id INTEGER NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      simple_explanation TEXT NOT NULL,
      analogy TEXT NOT NULL,
      technical_explanation TEXT NOT NULL,
      key_takeaway TEXT NOT NULL,
      xp_reward INTEGER DEFAULT 50,
      estimated_minutes INTEGER DEFAULT 4,
      sort_order INTEGER DEFAULT 1,
      FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_lesson_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      lesson_id INTEGER NOT NULL,
      completed INTEGER DEFAULT 0,
      score INTEGER DEFAULT 0,
      completed_at DATETIME,
      UNIQUE(user_id, lesson_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      lesson_id INTEGER NOT NULL,
      note_text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_id INTEGER NOT NULL UNIQUE,
      title TEXT NOT NULL,
      pass_score INTEGER DEFAULT 80,
      xp_reward INTEGER DEFAULT 75,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quiz_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quiz_id INTEGER NOT NULL,
      question_text TEXT NOT NULL,
      explanation TEXT NOT NULL,
      sort_order INTEGER DEFAULT 1,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quiz_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      option_text TEXT NOT NULL,
      is_correct INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quiz_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      quiz_id INTEGER NOT NULL,
      score_percent INTEGER NOT NULL,
      xp_awarded INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS glossary_terms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      term TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      simple_definition TEXT NOT NULL,
      technical_definition TEXT NOT NULL,
      example_usage TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      icon_name TEXT NOT NULL,
      xp_reward INTEGER DEFAULT 100
    );

    CREATE TABLE IF NOT EXISTS user_achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      achievement_id INTEGER NOT NULL,
      unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, achievement_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      xp_reward INTEGER DEFAULT 50,
      type TEXT NOT NULL,
      target_count INTEGER DEFAULT 1,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS challenge_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      challenge_id INTEGER NOT NULL,
      completed_date DATE NOT NULL,
      xp_awarded INTEGER NOT NULL,
      UNIQUE(user_id, challenge_id, completed_date),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
    );
  `);

  // 2. Load Seed Data from schema.sql
  const schemaSqlPath = path.join(__dirname, 'database', 'schema.sql');
  if (fs.existsSync(schemaSqlPath)) {
    const sqlFile = fs.readFileSync(schemaSqlPath, 'utf-8');
    const lines = sqlFile.split(/\r?\n/);
    let current = '';
    let inInsert = false;
    let inserts = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('INSERT INTO')) {
        inInsert = true;
        current = line;
        if (trimmed.endsWith(';')) {
          inserts.push(current);
          inInsert = false;
          current = '';
        }
      } else if (inInsert) {
        current += '\n' + line;
        if (trimmed.endsWith(';')) {
          inserts.push(current);
          inInsert = false;
          current = '';
        }
      }
    }

    for (let ins of inserts) {
      let converted = ins.replace(/\\'/g, "''").replace(/\\"/g, '"');
      try {
        db.exec(converted);
      } catch (e) {
        console.error('Seed insert error:', ins.substring(0, 40), e.message);
      }
    }
  }

  // 3. Create Demo User
  const demoPasswordHash = bcrypt.hashSync('password123', 10);
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, username, email, password_hash, experience_level, role, created_at, updated_at)
    VALUES (1, 'Alex Mercer', 'alex', 'student@cryptoverse.edu', ?, 'BEGINNER', 'STUDENT', datetime('now', '-7 days'), datetime('now'))
  `);
  insertUser.run(demoPasswordHash);

  const insertProfile = db.prepare(`
    INSERT INTO user_profiles (user_id, xp_total, current_level, streak_days, last_active_date)
    VALUES (1, 120, 1, 3, date('now'))
  `);
  insertProfile.run();

  const insertWallet = db.prepare(`
    INSERT INTO wallets (user_id, virtual_cash, created_at, updated_at)
    VALUES (1, 100000.00, datetime('now', '-7 days'), datetime('now'))
  `);
  insertWallet.run();

  // Mark lesson 1 completed for demo user
  const insertLessonProgress = db.prepare(`
    INSERT INTO user_lesson_progress (user_id, lesson_id, completed, score, completed_at)
    VALUES (1, 1, 1, 100, datetime('now', '-1 day'))
  `);
  insertLessonProgress.run();

  console.log('Database initialized successfully with demo student account (student@cryptoverse.edu / password123)!');
  return db;
}

module.exports = {
  db,
  initDatabase
};
