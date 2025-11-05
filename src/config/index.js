const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  logLevel: process.env.LOG_LEVEL || 'info',
  logDest: process.env.LOG_DEST || 'stdout',
  logSamplingDebug: parseInt(process.env.LOG_SAMPLING_DEBUG, 10) || 0,
  requestIdHeader: process.env.REQUEST_ID_HEADER || 'X-Request-ID',
  errorResponseIncludeTrace: process.env.ERROR_RESPONSE_INCLUDE_TRACE === 'true',
  databaseUrl: process.env.DATABASE_URL,

  // --- PARSE ALL NUMERIC VALUES FROM ENV ---
  // General Rate Limiting
  apiRateLimitWindowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS, 10) || 900000,
  maxRequestsPerWindow: parseInt(process.env.MAX_REQUESTS_PER_WINDOW, 10) || 200,

  // Upload Rate Limiting
  uploadRateLimitWindowMs: parseInt(process.env.UPLOAD_RATE_LIMIT_WINDOW_MS, 10) || 3600000,
  maxUploadsPerWindow: parseInt(process.env.MAX_UPLOADS_PER_WINDOW, 10) || 20,
};

module.exports = Object.freeze(config);