// src/api/middleware/authenticate.js
const { verifyToken } = require('../../services/jwt.service');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = await verifyToken(token);
    req.user = decoded; // Attach user payload to the request object
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Unauthorized: Token has expired.' });
    }
    // For other errors like malformed tokens
    return res.status(400).json({ message: 'Bad Request: Malformed token.' });
  }
};

module.exports = authenticate;