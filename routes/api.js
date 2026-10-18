const express = require('express');
const { db } = require('../db');
const { getCryptoNews } = require('../services/newsService');

const router = express.Router();

// News Aggregator API
router.get(['/news', '/news.php'], async (req, res) => {
  const articles = await getCryptoNews();
  res.json({ success: true, articles });
});

// Student Lesson Notes API
router.post(['/notes', '/notes.php'], (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const lessonId = parseInt(req.body.lesson_id, 10);
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

// Quiz Submission & XP Engine
router.post(['/quiz-submit', '/quiz_submit', '/quiz_submit.php'], (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const lessonId = parseInt(req.body.lesson_id, 10);
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
    const userAnswer = parseInt(req.body[field], 10);
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

    const existingProgress = db.prepare('SELECT completed, score FROM user_lesson_progress WHERE user_id = ? AND lesson_id = ?').get(req.session.userId, lessonId);

    if (!existingProgress || !existingProgress.completed) {
      db.prepare(`
        INSERT INTO user_lesson_progress (user_id, lesson_id, completed, score, completed_at)
        VALUES (?, ?, 1, ?, datetime('now'))
        ON CONFLICT(user_id, lesson_id) DO UPDATE SET completed = 1, score = max(score, excluded.score), completed_at = datetime('now')
      `).run(req.session.userId, lessonId, scorePercent);

      db.prepare('UPDATE user_profiles SET xp_total = xp_total + ?, current_level = 1 + CAST((xp_total + ?) / 500 AS INT) WHERE user_id = ?').run(xpAwarded, xpAwarded, req.session.userId);
    }

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

// Paper Trade Order Execution
router.post(['/trade', '/trade_execute', '/trade_execute.php'], (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized. Please log in.' });
  }

  const userId = req.session.userId;
  const symbol = (req.body.symbol || '').toUpperCase().trim();
  const type = (req.body.type || '').toUpperCase().trim();
  const quantity = parseFloat(req.body.quantity) || 0;
  const unitPrice = parseFloat(req.body.price) || 0;

  if (!symbol || !['BUY', 'SELL'].includes(type) || quantity <= 0 || unitPrice <= 0) {
    return res.json({ success: false, error: 'Invalid trade parameters.' });
  }

  if (!/^[A-Z0-9]{2,10}$/.test(symbol)) {
    return res.json({ success: false, error: 'Invalid ticker symbol.' });
  }

  const totalOrderValue = quantity * unitPrice;

  try {
    db.exec('BEGIN TRANSACTION');

    const wallet = db.prepare('SELECT id, virtual_cash FROM wallets WHERE user_id = ?').get(userId);
    if (!wallet) {
      db.exec('ROLLBACK');
      return res.json({ success: false, error: 'Virtual wallet not found.' });
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

      const newCash = currentCash - totalOrderValue;
      db.prepare("UPDATE wallets SET virtual_cash = ?, updated_at = datetime('now') WHERE id = ?").run(newCash, walletId);

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

      const newCash = currentCash + totalOrderValue;
      db.prepare("UPDATE wallets SET virtual_cash = ?, updated_at = datetime('now') WHERE id = ?").run(newCash, walletId);

      const remainingQty = heldQty - quantity;
      if (remainingQty <= 0.00000001) {
        db.prepare('DELETE FROM wallet_assets WHERE id = ?').run(existing.id);
      } else {
        db.prepare("UPDATE wallet_assets SET quantity = ?, updated_at = datetime('now') WHERE id = ?").run(remainingQty, existing.id);
      }

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
    res.json({ success: false, error: 'Order execution failed.' });
  }
});

// Virtual Wallet Reset
router.post(['/wallet-reset', '/wallet_reset', '/wallet_reset.php'], (req, res) => {
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
      message: 'Virtual balance reset to $100,000.00 USD.'
    });
  } catch (err) {
    db.exec('ROLLBACK');
    res.json({ success: false, error: 'Failed to reset virtual wallet.' });
  }
});

module.exports = router;
