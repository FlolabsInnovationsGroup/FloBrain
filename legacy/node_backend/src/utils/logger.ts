import { JobType } from "../features/ai-pipeline/ai.types";

interface LogParams {
  mediaId: string;
  job: JobType;
  attempt: number;
  status: 'ok' | 'fail';
  latencyMs?: number;
  error?: string;
}

/**
 * Logs a single, structured line for an AI job attempt.
 */
export const logAiJob = (params: LogParams): void => {
  const { mediaId, job, attempt, status, latencyMs, error } = params;

  const latencyStr = latencyMs !== undefined ? latencyMs.toString() : '-';
  const errorMsg = error ? `"${error}"` : '-';

  console.log(
    `ai_job media_id=${mediaId} job=${job} attempt=${attempt} status=${status} latency_ms=${latencyStr} error=${errorMsg}`
  );
};