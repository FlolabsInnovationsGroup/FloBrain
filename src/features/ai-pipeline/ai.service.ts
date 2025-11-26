// src/features/ai-pipeline/ai.service.ts (Updated)

// Import the new logger
import logger from '../../utils/logger';
import AppError from '../../utils/AppError';
import { AI_CONFIG } from '../../config/ai.config';
import { aiServiceAdapter } from '../../services/aiServiceAdapter';
import {
  MediaRecording,
  JobType,
  ProcessingStatus,
  AiResult,
} from './ai.types';

// --- DATABASE MOCKS (Remains the same) ---
const db = {
  getMediaById: async (id: string, userId: string): Promise<MediaRecording | null> => {
    logger.debug({ mediaId: id, userId }, '[DB MOCK] Fetching media');
    if (id === 'owned_audio_1') {
      return { id, user_id: userId, media_type: 'audio', processing_status: 'error', tags: ['initial'] };
    }
    if (id === 'owned_image_1') {
      return { id, user_id: userId, media_type: 'image', processing_status: 'pending_processing' };
    }
    if (id === 'processing_media_1') {
      return { id, user_id: userId, media_type: 'audio', processing_status: 'processing' };
    }    
    return null;
  },
  updateMediaStatus: async (id: string, status: ProcessingStatus): Promise<void> => {
    logger.debug({ mediaId: id, status }, '[DB MOCK] Updating media status');
  },
  createAiResult: async (result: Omit<AiResult, 'id' | 'created_at'>): Promise<void> => {
    logger.debug(result, '[DB MOCK] Creating AI result');
  },
  updateMediaData: async (id: string, data: Partial<MediaRecording>): Promise<void> => {
    logger.debug({ mediaId: id, data }, '[DB MOCK] Updating media data');
  },
};
// --- END DATABASE MOCKS ---

class AiService {
  public async startProcessing(mediaId: string, userId: string): Promise<{ plan: JobType[] }> {
    const media = await db.getMediaById(mediaId, userId);

    if (!media) {
      // Rule: Caller must own :mediaId
      throw new AppError(404, 'Media not found or you do not have permission to access it.');
    }

    if (media.processing_status === 'processing') {
      // Rule: Idempotency check
      throw new AppError(409, 'Media is already being processed.');
    }

    if (media.processing_status !== 'pending_processing' && media.processing_status !== 'error') {
      // Rule: Allow re-processing only from pending or error states
      throw new AppError(409, `Cannot start processing from its current state.`);
    }

    const jobPlan = this._createJobPlan(media);
    
    this._runOrchestration(media, jobPlan).catch(err => {
        logger.warn({ mediaId: media.id, error: err.message }, `Orchestration for media was intentionally halted due to a job failure.`);
    });
    return { plan: jobPlan };
  }

  private async _runOrchestration(media: MediaRecording, plan: JobType[]): Promise<void> {
    await db.updateMediaStatus(media.id, 'processing');
    
    let transcriptionText: string | undefined = undefined;

    try {
        for (const jobType of plan) {
            const jobResult = await this._executeJobWithRetries(media, jobType, transcriptionText);
            
            if (jobType === 'transcription' && jobResult.success) {
                transcriptionText = (jobResult.data as { text: string }).text;
            }
        }

        await db.updateMediaStatus(media.id, 'processed');

    }  catch (error: any) {
        logger.error({ mediaId: media.id, error: error.message }, `AI PIPELINE HALTED. Media failed processing.`);
    }
  }

  private async _executeJobWithRetries(
    media: MediaRecording,
    jobType: JobType,
    transcriptionText: string | undefined
  ): Promise<{ success: true, data: any } | { success: false, error: string }> {
    const maxAttempts = 1 + AI_CONFIG.maxRetries;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const startTime = Date.now();
      try {
        const result = await this._performSingleJobAttempt(media, jobType, transcriptionText);
        const latencyMs = Date.now() - startTime;
        
        // Use the new structured logger
        logger.info({
            event: 'ai_job',
            mediaId: media.id,
            job: jobType,
            attempt,
            status: 'ok',
            latencyMs
        }, `AI job succeeded`);
        
        await this._persistJobSuccess(media, jobType, result);

        return { success: true, data: result };

      } catch (error: any) {
        const latencyMs = Date.now() - startTime;
        const errorMessage = error.message || 'Unknown error';
        
        // Use the new structured logger
        logger.warn({
            event: 'ai_job',
            mediaId: media.id,
            job: jobType,
            attempt,
            status: 'fail',
            latencyMs,
            error: errorMessage
        }, `AI job failed`);
        
        if (attempt === maxAttempts) {
          await this._persistJobFailure(media.id, jobType, errorMessage);
          throw new Error(`Job ${jobType} failed after ${maxAttempts} attempts: ${errorMessage}`);
        }

        await new Promise(resolve => setTimeout(resolve, AI_CONFIG.retryBackoffMs));
      }
    }
    throw new Error('Exited retry loop unexpectedly');
  }

  // _performSingleJobAttempt, _persistJobSuccess, _persistJobFailure,
  // _createJobPlan, and _getContextText methods remain unchanged.
  // ... (paste the rest of the unchanged methods from your original ai.service.ts here) ...
  
  // (The rest of the file remains the same)
  // ...
  // ...
  private async _performSingleJobAttempt(
    media: MediaRecording,
    jobType: JobType,
    transcriptionText: string | undefined,
  ): Promise<any> {

    // Rule: Skip transcription for images.
    if (jobType === 'transcription' && media.media_type === 'image') {
        // This case is filtered out by _createJobPlan, but this is a defensive check.
        return { text: '', model_name: 'skipped', model_version: 'n/a', latency_ms: 0 };
    }

    switch(jobType) {
        case 'transcription':
            // Rule: Handle non-executable transcription.
            // For this sprint, we assume it's not possible to get a public URL.
            throw new Error("Media not readable by AI service");
            // const mediaUrl = `http://my-temp-url-provider.com/${media.path}`;
            // return aiServiceAdapter.transcription({ media_url: mediaUrl });

        case 'summary':
            if (!transcriptionText) throw new Error("Summary requires transcription text, which is missing.");
            return aiServiceAdapter.summary({ text: transcriptionText });

        case 'tags':
            const contextForTags = this._getContextText(media, transcriptionText);
            return aiServiceAdapter.tags({ text: contextForTags });

        case 'embedding':
            const contextForEmbedding = this._getContextText(media, transcriptionText);
            return aiServiceAdapter.embedding({ text: contextForEmbedding });

        default:
            throw new Error(`Unsupported job type: ${jobType}`);
    }
  }

  private async _persistJobSuccess(media: MediaRecording, jobType: JobType, result: any): Promise<void> {
    const dataToUpdate: Partial<MediaRecording> = {};
    
    switch(jobType) {
        case 'transcription':
            dataToUpdate.transcription = result.text;
            break;
        case 'summary':
            dataToUpdate.summary = result.summary;
            break;
        case 'tags':
            const existingTags = media.tags || [];
            const newTags = result.tags.map((t: string) => t.toLowerCase());
            const merged = [...new Set([...existingTags, ...newTags])].sort();
            dataToUpdate.tags = merged;
            break;
        case 'embedding':
            dataToUpdate.embedding_vector = result.vector;
            break;
    }

    await db.updateMediaData(media.id, dataToUpdate);

    await db.createAiResult({
        media_id: media.id,
        job_type: jobType,
        status: 'done',
        model_name: result.model_name,
        model_version: result.model_version,
        latency_ms: result.latency_ms
    });
  }

  private async _persistJobFailure(mediaId: string, jobType: JobType, errorMessage: string): Promise<void> {
    await db.createAiResult({
        media_id: mediaId,
        job_type: jobType,
        status: 'error',
        error_message: errorMessage,
    });
    await db.updateMediaStatus(mediaId, 'error');
  }

  private _createJobPlan(media: MediaRecording): JobType[] {
    let plan: JobType[] = ['transcription', 'summary', 'tags', 'embedding'];

    if (media.media_type === 'image') {
      plan = plan.filter(job => job !== 'transcription' && job !== 'summary');
    }

    return plan.filter(job => AI_CONFIG.allowedTasks.includes(job));
  }

  private _getContextText(media: MediaRecording, transcriptionText?: string): string {
    if (transcriptionText) {
      return transcriptionText;
    }
    const tags = (media.tags || []).join(', ');
    const timestamp = (media.created_at || new Date()).toISOString();
    return `Media type: ${media.media_type}. Format: ${media.format}. Tags: ${tags}. Timestamp: ${timestamp}. File path: ${media.path}`;
  }
}

export const aiService = new AiService();