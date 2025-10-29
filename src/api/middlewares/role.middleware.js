// src/api/middlewares/role.middleware.js

/**
 * Creates a middleware function to check for user roles.
 * @param {string[]} allowedRoles - An array of roles that are allowed to access the route.
 * @returns {function} An Express middleware function.
 */
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    // Assumes authMiddleware has already run and attached `req.user`
    const user = req.user;

    // 1. Check if user object exists and has roles
    if (!user || !user.roles || !Array.isArray(user.roles)) {
      return res.status(403).json({
        success: false,
        error: { message: 'Forbidden: No role information available.' },
      });
    }

    // 2. Check for intersection between user's roles and allowed roles
    const hasPermission = user.roles.some(role => allowedRoles.includes(role));

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: { message: 'Forbidden.' },
      });
    }

    // 3. If user has the required role, proceed
    next();
  };
};

module.exports = roleMiddleware;