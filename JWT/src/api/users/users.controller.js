const db = require('../../services/db.service');

exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(400).json({ message: 'Bad Request: Missing sub in token.' });

    const { rows } = await db.query('SELECT id, roles FROM users WHERE id = $1', [userId]);
    if (rows.length === 0) {
      // fallback so frontend can proceed even before seed
      return res.status(200).json({ id: userId, roles: req.user.roles || [] });
    }
    return res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};
