const pino = require('pino');
const config = require('../config');

// --- NEW: DEFINE THE KEYS TO REDACT ---
// Pino will automatically censor these fields in any logged object.
const redactPaths = [
    'req.headers.authorization',
    'headers.authorization',
    'authorization',
    'password',
    'token',
    'email',
    'user.email',
    'user.password'
];

const options = {
  level: config.logLevel,
  timestamp: () => `,"ts":"${new Date().toISOString()}"`,
  formatters: {
    level: (label) => ({ level: label }),
  },
  // --- NEW: ADD THE REDACTION CONFIGURATION ---
  redact: {
    paths: redactPaths,
    censor: '[REDACTED]',
  },
};


// Create the transport based on LOG_DEST
let transport;
if (config.logDest === 'file') {
  transport = pino.transport({
    target: 'pino-roll',
    options: {
      file: './logs/app.log', // Log file path
      size: '10M',            // 10 MB rotation size
      frequency: 'daily',     // Fallback frequency
      keep: 5,                // Keep 5 rotated files
      gzip: true,             // Gzip rotated files
    },
  });
} else {
  // Use default stdout stream
  transport = pino.destination(1);
}

// Create the main pino logger instance
const pinoLogger = pino(options, transport);

// Custom logger wrapper to handle debug sampling
const logger = {
  info: (obj) => pinoLogger.info(obj),
  warn: (obj) => pinoLogger.warn(obj),
  error: (obj) => pinoLogger.error(obj),
  // Only log debug messages if LOG_LEVEL is 'debug' AND it passes sampling
  debug: (obj) => {
    if (config.logLevel === 'debug') {
      const samplingRate = config.logSamplingDebug;
      if (samplingRate <= 0) return; // Drop if sampling is 0%
      // Keep if sampling is 100% or if it passes the random check
      if (samplingRate >= 100 || Math.random() * 100 < samplingRate) {
        pinoLogger.debug(obj);
      }
    }
  },
  /**
   * Creates a child logger with bound context, like a request_id.
   * Ensures the custom debug sampler is carried over.
   * @param {object} bindings - The bindings to apply to the child logger.
   */
  child: (bindings) => {
    const childPino = pinoLogger.child(bindings);

    return {
      info: (obj) => childPino.info(obj),
      warn: (obj) => childPino.warn(obj),
      error: (obj) => childPino.error(obj),
      debug: (obj) => {
        if (config.logLevel === 'debug') {
          const samplingRate = config.logSamplingDebug;
          if (samplingRate <= 0) return;
          if (samplingRate >= 100 || Math.random() * 100 < samplingRate) {
            childPino.debug(obj);
          }
        }
      },
      // Expose the raw child instance if needed elsewhere
      pino: childPino,
    };
  },
};

module.exports = logger;