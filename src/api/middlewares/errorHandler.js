module.exports = (err, req, res, next) => {
  console.error('🔥 ERROR STACK:', err.stack || err.message || err);
  res.status(500).json({
    success: false,
    message: 'Something broke!',
    error: err.message || 'Unknown error',
  });
};
