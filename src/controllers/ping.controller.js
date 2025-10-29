// src/controllers/ping.controller.js

/**
 * Handles the protected ping route.
 * Returns the standard pong message plus the authenticated user's ID.
 */
const protectedPing = (req, res) => {
  // The user object is available here because authMiddleware was executed first.
  const userId = req.user.id;

  res.status(200).json({
    success: true,
    message: 'Pong!',
    data: {
      user_id: userId,
    },
  });
};

/**
 * Handles the admin-only ping route.
 */
const adminPing = (req, res) => {
  // The user object is available, and roleMiddleware has already confirmed they are an admin.
  const adminId = req.user.id;

  res.status(200).json({
    success: true,
    message: 'Pong from Admin Route!',
    data: {
      user_id: adminId,
      message: 'Access granted to admin.',
    },
  });
};

module.exports = {
  protectedPing,
  adminPing,
};