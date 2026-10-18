const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'database', 'cryptoverse.db');
const seedPath = path.join(__dirname, 'database', 'seed.sql');

// Ensure database folder exists
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

function initDatabase() {
  const usersTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
  if (usersTable) {
    return db;
  }

  // Initialize schema & base curriculum if fresh database
  if (fs.existsSync(seedPath)) {
    const seedSql = fs.readFileSync(seedPath, 'utf-8');
    db.exec(seedSql);
  }

  // Create demo student account
  const demoUser = db.prepare('SELECT id FROM users WHERE email = ?').get('student@cryptoverse.edu');
  if (!demoUser) {
    const passwordHash = bcrypt.hashSync('password123', 10);
    db.prepare(`
      INSERT INTO users (id, name, username, email, password_hash, experience_level, role)
      VALUES (1, 'Alex Mercer', 'alex', 'student@cryptoverse.edu', ?, 'BEGINNER', 'STUDENT')
    `).run(passwordHash);

    db.prepare(`
      INSERT INTO user_profiles (user_id, xp_total, current_level, streak_days, last_active_date)
      VALUES (1, 120, 1, 3, date('now'))
    `).run();

    db.prepare(`
      INSERT INTO wallets (user_id, virtual_cash)
      VALUES (1, 100000.00)
    `).run();

    db.prepare(`
      INSERT INTO user_lesson_progress (user_id, lesson_id, completed, score, completed_at)
      VALUES (1, 1, 1, 100, datetime('now'))
    `).run();
  }

  return db;
}

module.exports = {
  db,
  initDatabase
};
