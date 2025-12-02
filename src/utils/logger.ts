// src/utils/logger.ts

import pino from 'pino';

// Configure Pino logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info', // Default to 'info' level
  transport: process.env.NODE_ENV !== 'production' 
    ? {
        target: 'pino-pretty', // Use pino-pretty in development
        options: {
          colorize: true,
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
          ignore: 'pid,hostname',
        },
      }
    : undefined, // Use default JSON output in production
});

export default logger;