// src/middleware/error-handler.js
const { fail } = require('./response-shape');

function notFound(req, res) {
  return res.status(404).json({
    success: false,
    error: { message: 'Not Found', code: 'ERR_NOT_FOUND' }
  });
}

function globalErrorHandler(err, req, res, next) {
  console.error(err); // log serveur
  const code = err.code || 'ERR_INTERNAL';
  const status = err.status || 500;
  return res.status(status).json({
    success: false,
    error: { message: err.message || 'Internal Server Error', code, details: err.details }
  });
}

module.exports = { notFound, globalErrorHandler };
