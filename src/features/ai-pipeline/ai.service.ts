import { AI_CONFIG } from '../../config/ai.config';
//import { aiServiceAdapter } from '../../services/aiServiceAdapter';
import { mockAiProcessor } from './ai.mock.processor';
import { logAiJob } from '../../utils/logger';
import {
  MediaRecording,
  JobType,
  ProcessingStatus,
  AiServiceSuccessResponse,
  AiResult,
} from './ai.types';

import { Model } from 'sequelize';
import models from '../../../models/index.js';

const MediaRecordingModel = (models as any).MediaRecording;
//const MediaRecordingModel:typeof Model & (new () => MediaRecording) = (models as any).MediaRecording;

class AiService {
  /**
   * Public entry point to start the AI processing pipeline for a given media item.
   * This method performs initial checks and then starts the orchestration.
   * Note: This is designed to be "fire-and-forget" from the controller's perspective.
   */
  public async startProcessing(mediaId: string, userId: string): Promise<{ plan: JobType[] }> {
    const media = await MediaRecordingModel.findOne({ where: { id: mediaId, userId: userId } });

    if (!media) {
      // Rule: Caller must own :mediaId
      throw new Error('MediaNotFound'); // We will map this to a 404 in the controller
    }
  
    console.log('[UNIT TEST DEBUG] Media received in service:', media);
    if (media.processingStatus === 'processing') {
      // Rule: Idempotency check
      throw new Error('AlreadyProcessing'); // Map to 409
    }

    if (media.processingStatus !== 'pending_processing' && media.processingStatus !== 'error') {
      // Rule: Allow re-processing only from pending or error states
      throw new Error('InvalidInitialStatus'); // Map to 400 or 409
    }

    const jobPlan = this._createJobPlan(media);
    
    // Start orchestration asynchronously. The controller will respond with 202 Accepted immediately.
    this._runOrchestration(media, jobPlan).catch(err => {
        // We already log the specific job failure, so this is just to acknowledge the halt.
       // console.log(`[AI PIPELINE INFO] Orchestration for media ${media.id} was intentionally halted due to a job failure.`);
    });
    return { plan: jobPlan };
  }

  /**
   * The main orchestration flow that executes jobs sequentially.
   */
private async _runOrchestration(media: MediaRecording, plan: JobType[]): Promise<void> {
    await MediaRecordingModel.update(
      { processingStatus: 'processing' },
      { where: { id: media.id } }
    );
    
    let transcriptionText: string | undefined = undefined;

    try {
        for (const jobType of plan) {
          console.log(`[DEBUG LOOP] Starting job: ${jobType} | transcription is: ${transcriptionText}`);
            const jobResult = await this._executeJobWithRetries(media, jobType, transcriptionText);
            
            if (jobType === 'transcription' && jobResult.success) {
                transcriptionText = (jobResult.data as { text: string }).text;
            }
        }

        // If all jobs in the plan succeeded
        await MediaRecordingModel.update(
          { processingStatus: 'processed' },
          { where: { id: media.id } }
        );
        //console.log(`[AI PIPELINE SUCCESS] Media ${media.id} processed successfully.`);

    }  catch (error: any) {
        // A job failed permanently. The failure is already recorded in the DB.
        // The orchestration stops, and the media status is already 'error'.
       // console.log(`[AI PIPELINE HALTED] Media ${media.id} failed processing. Reason: ${error.message}`);
    }
  }

  /**
   * Executes a single job with the configured retry policy.
   */
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
        
        logAiJob({ mediaId: media.id, job: jobType, attempt, status: 'ok', latencyMs });
        
        await this._persistJobSuccess(media, jobType, result);

        return { success: true, data: result };

      } catch (error: any) {
        const latencyMs = Date.now() - startTime;
        const errorMessage = error.message || 'Unknown error';
        
        logAiJob({ mediaId: media.id, job: jobType, attempt, status: 'fail', latencyMs, error: errorMessage });
        
        if (attempt === maxAttempts) {
          // This was the final attempt, persist failure and re-throw to stop the chain
          await this._persistJobFailure(media.id, jobType, errorMessage);
          throw new Error(`Job ${jobType} failed after ${maxAttempts} attempts: ${errorMessage}`);
        }

        // Wait before the next retry
        await new Promise(resolve => setTimeout(resolve, AI_CONFIG.retryBackoffMs));
      }
    }
    // This line should be unreachable, but placates TypeScript
    throw new Error('Exited retry loop unexpectedly');
  }

  /**
   * Performs a single attempt to call the external AI service for a given job.
   */
  private async _performSingleJobAttempt(
    media: MediaRecording,
    jobType: JobType,
    transcriptionText: string | undefined,
  ): Promise<any> {

/* Using the mock AI processor for demonstration purposes */

      const mediaUrl = `mock://path/${media.path}`; // Placeholder URL for mock processor
      switch(jobType) {
      case 'transcription':
          // Pour les images, on ne fait rien, comme avant
          if (media.mediaType === 'image') {
            return { text: '', model_name: 'skipped', model_version: 'n/a', latency_ms: 0 };
          }
          return mockAiProcessor.transcription({ media_url: mediaUrl });

      case 'summary':
          if (!transcriptionText) throw new Error("Summary requires transcription text, which is missing.");
          return mockAiProcessor.summary({ text: transcriptionText });

      case 'tags':
          const contextForTags = this._getContextText(media, transcriptionText);
          return mockAiProcessor.tags({ text: contextForTags });

      case 'embedding':
          // Pour le moment, on simule une réponse vide pour les embeddings
          
          return { vector: [], model_name: 'mock-embedding-v1', model_version: '1.0.0', latency_ms: 50 };

      default:
          throw new Error(`Unsupported job type: ${jobType}`);
  }


/* Code for actual AI service adapter is commented out below 
   
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

    */
  }

  /**
   * Persistence logic for a successful job.
   */
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
            // Rule: Union-merge, deduplicate, lowercase, sort
            const existingTags = media.tags || [];
            const newTags = result.tags.map((t: string) => t.toLowerCase());
            const merged = [...new Set([...existingTags, ...newTags])].sort();
            dataToUpdate.tags = merged;
            break;
        case 'embedding':
            dataToUpdate.embedding_vector = result.vector;
            break;
    }

      // Update the media record with the new data
    
      await MediaRecordingModel.update(
        dataToUpdate,
        { where: { id: media.id } }
      );

    // Record the audit trail

    /*
    await db.createAiResult({
        media_id: media.id,
        job_type: jobType,
        status: 'done',
        model_name: result.model_name,
        model_version: result.model_version,
        latency_ms: result.latency_ms
    });
    */
  }

  /**
   * Persistence logic for a failed job after all retries.
   */
  private async _persistJobFailure(mediaId: string, jobType: JobType, errorMessage: string): Promise<void> {
    // Record the audit trail for the failure
    
    /*await db.createAiResult({
        media_id: mediaId,
        job_type: jobType,
        status: 'error',
        error_message: errorMessage,
    });
    */
   
    // Set the overall media status to error
    await MediaRecordingModel.update(
      { processingStatus: 'error' },
      { where: { id: mediaId } }
    );
  }

  /**
   * Creates the ordered list of jobs to be executed.
   */
  private _createJobPlan(media: MediaRecording): JobType[] {
    // Start with the full, fixed sequence
    let plan: JobType[] = ['transcription', 'summary', 'tags', 'embedding'];

    // Rule: If media_type is image, skip transcription and summary
    if (media.mediaType === 'image') {
      plan = plan.filter(job => job !== 'transcription' && job !== 'summary');
    }

    // Further filter by tasks allowed in .env for system-wide control
    return plan.filter(job => AI_CONFIG.allowedTasks.includes(job));
  }

  /**
   * Generates fallback text from media metadata when transcription is not available.
   */
  private _getContextText(media: MediaRecording, transcriptionText?: string): string {
    if (transcriptionText) {
      return transcriptionText;
    }
    // Rule: Fallback text context
    const tags = (media.tags || []).join(', ');
    const timestamp = (media.created_at || new Date()).toISOString();
    return `Media type: ${media.mediaType}. Format: ${media.format}. Tags: ${tags}. Timestamp: ${timestamp}. File path: ${media.path}`;
  }
}

export const aiService = new AiService();