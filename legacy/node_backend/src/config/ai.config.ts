import * as dotenv from 'dotenv';
import { JobType } from '../features/ai-pipeline/ai.types';

// Load environment variables from .env file
dotenv.config();

/**
 * A simple validation function to ensure a required environment variable exists.
 * Throws a clear error if the variable is missing.
 */
const getEnvVar = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`FATAL ERROR: Environment variable "${name}" is not defined.`);
  }
  return value;
};

// Define and export the configuration object
const aiConfig = {
  serviceBaseUrl: getEnvVar('AI_SERVICE_BASE_URL'),
  allowedTasks: getEnvVar('AI_TASKS_ALLOWED').split(',') as JobType[],
  jobTimeoutMs: parseInt(getEnvVar('AI_JOB_TIMEOUT_MS'), 10),
  maxRetries: parseInt(getEnvVar('AI_MAX_RETRIES'), 10),
  retryBackoffMs: parseInt(getEnvVar('AI_RETRY_BACKOFF_MS'), 10),
};

// Validate that our numeric values parsed correctly
if (isNaN(aiConfig.jobTimeoutMs) || isNaN(aiConfig.maxRetries) || isNaN(aiConfig.retryBackoffMs)) {
  throw new Error('One or more AI numeric environment variables could not be parsed.');
}

// Freezing the object prevents accidental modifications during runtime.
export const AI_CONFIG = Object.freeze(aiConfig);