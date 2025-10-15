// src/api/users/users.controller.js
const db = require('../../services/db.service'); // Import db service

const getProfile = async (req, res) => {
  // The user ID is in req.user.sub, attached by the authentication middleware
  const userId = req.user.sub;

  try {
    // Fetch user data from the DB, excluding the password hash
    const result = await db.query('SELECT id, username, roles, created_at FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({
      message: 'Successfully accessed protected profile data.',
      user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = {
  getProfile,
};