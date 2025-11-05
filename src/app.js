const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const logger = require('./services/logger');
const dbPool = require('./services/real-db-connection');

// Import Middleware
const requestCorrelator = require('./middleware/requestCorrelator');
const requestLogger = require('./middleware/requestLogger');
const notFoundHandler = require('./middleware/notFoundHandler');
const errorHandler = require('./middleware/errorHandler');

// Import Routes
const mainRouter = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// =================================================================
// Middleware - ORDER IS CRITICAL
// =================================================================

app.use(helmet());

// Apply a general rate limit to all requests
const apiLimiter = rateLimit({
    windowMs: config.apiRateLimitWindowMs, // Use value from config
    max: config.maxRequestsPerWindow,      // Use value from config
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(apiLimiter);

app.use(requestCorrelator);
app.use(requestLogger);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/v1', mainRouter);

// Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// =================================================================
// Start Server and Handle Graceful Shutdown
// =================================================================

const server = app.listen(PORT, () => {
  logger.info({ msg: `Server is running on http://localhost:${PORT}` });
});

const gracefulShutdown = () => {
  logger.info({ msg: 'Shutdown signal received. Starting graceful shutdown.' });

  server.close(async () => {
    logger.info({ msg: 'HTTP server closed. No longer accepting new connections.' });
    await dbPool.close();
    logger.info({ msg: 'Database pool closed. Exiting process.' });
    process.exit(0);
  });
  
  setTimeout(() => {
    logger.error({ msg: 'Could not close connections in time, forcefully shutting down.' });
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = app;