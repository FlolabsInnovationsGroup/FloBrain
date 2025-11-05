const { Pool } = require('pg');
const config = require('../config');
const logger = require('./logger');

if (!config.databaseUrl) {
  logger.warn({ msg: 'DATABASE_URL is not set. Real database connection will not be available.' });
}

const pool = new Pool({
  connectionString: config.databaseUrl,
});

pool.on('connect', () => {
  logger.info({ msg: 'Database client connected' });
});

pool.on('error', (err, client) => {
  logger.error({
    msg: 'Unexpected error on idle database client',
    error_name: err.name,
    error_message: err.message,
    stack: err.stack,
  });
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  
  /**
   * Shuts down the database connection pool.
   * `pool.end()` waits for all active clients to finish before closing.
   */
  close: async () => {
    logger.info({ msg: 'Closing database connection pool.' });
    await pool.end();
  },
};