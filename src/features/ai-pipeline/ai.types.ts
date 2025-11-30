// We define our data structures here for type safety and consistency.
// These are based on the database schema described in the task.

export type ProcessingStatus = 'pending_processing' | 'processing' | 'processed' | 'error';
export type JobType = 'transcription' | 'summary' | 'tags' | 'embedding';
export type JobStatus = 'done' | 'error' | 'skipped';

export interface MediaRecording {
  id: string;
  userId: string;
  mediaType: 'audio' | 'video' | 'image';
  processingStatus: ProcessingStatus;
  transcription?: string;
  summary?: string;
  tags?: string[];
  embedding_vector?: number[];
  // Assuming these fields also exist for context building
  path?: string;
  format?: string;
  created_at?: Date;
}

export interface AiResult {
  id: string;
  media_id: string;
  job_type: JobType;
  model_name?: string;
  model_version?: string;
  latency_ms?: number;
  status: JobStatus;
  error_message?: string;
  created_at: Date;
}

// --- AI Service Contract Types ---

// Base success response from any AI service job
export interface AiServiceSuccessResponse {
  model_name: string;
  model_version: string;
  latency_ms: number;
}

// Transcription
export interface TranscriptionBody {
  media_url: string;
  language?: string;
  sample_rate?: number;
}
export interface TranscriptionResponse extends AiServiceSuccessResponse {
  text: string;
}

// Summary
export interface SummaryBody {
  text: string;
}
export interface SummaryResponse extends AiServiceSuccessResponse {
  summary: string;
}

// Tags
export interface TagsBody {
  text?: string;
  media_metadata?: Record<string, any>;
}
export interface TagsResponse extends AiServiceSuccessResponse {
  tags: string[];
}

// Embedding
export interface EmbeddingBody {
  text: string;
}
export interface EmbeddingResponse extends AiServiceSuccessResponse {
  vector: number[];
}