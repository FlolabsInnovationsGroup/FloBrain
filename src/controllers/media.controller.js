const db = require('../services/db');
const dbPool = require('../services/real-db-connection'); // The real DB connection
const {
  AuthenticationError,
  ValidationError,
  ServiceUnavailableError,
} = require('../utils/customErrors');

const ensureAuthenticated = (req) => {
  if (!req.headers.authorization) {
    throw new AuthenticationError('Authorization header is missing.');
  }
};

const mediaController = {
  uploadMedia: async (req, res, next) => {
    try {
      ensureAuthenticated(req);
      req.log.info({
        user: {
          id: 123,
          email: 'secret-user@example.com',
          password: 'super-secret-password-123',
        },
        headers: req.headers, // Log all headers to test auth redaction
        msg: 'This is a test log with sensitive data.',
      });
      const userId = 1;

      // --- UPDATE THE CALL: No longer need to pass req.log ---
      await db.timedQuery(
        'update_user_quota',
        () => dbPool.query('UPDATE users SET quota = quota - 1 WHERE id = $1', [userId])
      );

      res.status(202).json({
        success: true,
        message: 'Media accepted for processing and user quota updated.',
        request_id: req.requestId,
      });

    } catch (error) {
      next(error);
    }
  },

  triggerAiTimeout: (req, res, next) => {
    try {
      ensureAuthenticated(req);
      throw new ServiceUnavailableError(
        'The AI processing service timed out.',
        'AI_TIMEOUT'
      );
    } catch (error) {
      next(error);
    }
  },
};

module.exports = mediaController;