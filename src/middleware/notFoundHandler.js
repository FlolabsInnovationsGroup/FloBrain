const { NotFoundError } = require('../utils/customErrors');

/**
 * Middleware to handle requests for routes that do not exist.
 * It creates a NotFoundError and passes it to the next middleware (the global error handler).
 */
function notFoundHandler(req, res, next) {
  const error = new NotFoundError(`The requested route '${req.method} ${req.originalUrl}' does not exist.`);
  next(error);
}

module.exports = notFoundHandler;