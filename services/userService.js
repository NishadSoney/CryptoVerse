const { db } = require('../db');

function getUserFullData(userId) {
  if (!userId) return null;
  return db.prepare(`
    SELECT u.id, u.name, u.username, u.email, u.role, u.experience_level, u.created_at,
           p.xp_total, p.current_level, p.streak_days, w.virtual_cash, w.id as wallet_id
    FROM users u
    LEFT JOIN user_profiles p ON u.id = p.user_id
    LEFT JOIN wallets w ON u.id = w.user_id
    WHERE u.id = ?
    LIMIT 1
  `).get(userId);
}

module.exports = {
  getUserFullData
};
