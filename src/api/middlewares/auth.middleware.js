// src/api/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // 1. Get the Authorization header
  const authHeader = req.headers.authorization;

  // 2. Check if the header exists and is in the correct format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { message: 'Unauthorized: Missing or malformed token.' },
    });
  }

  // 3. Extract the token from the header
  const token = authHeader.split(' ')[1];

  try {
    // 4. Verify the token using the secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Attach the decoded user payload to the request object
    //    This makes the user's ID and roles available in subsequent controllers
    req.user = {
      id: decoded.sub,
      roles: decoded.roles,
    };

    // 6. Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Handle different JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: { message: 'Token expired.' },
      });
    }
    // For other errors (e.g., JsonWebTokenError for invalid signature)
    return res.status(400).json({
      success: false,
      error: { message: 'Malformed token.' },
    });
  }
};

module.exports = authMiddleware;