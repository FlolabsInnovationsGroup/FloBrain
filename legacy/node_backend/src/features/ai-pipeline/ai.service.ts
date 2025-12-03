import { AI_CONFIG } from '../../config/ai.config';
import { aiServiceAdapter } from '../../services/aiServiceAdapter';
import { logAiJob } from '../../utils/logger';
import {
  MediaRecording,
  JobType,
  ProcessingStatus,
  AiResult,
} from './ai.types';

// ---- DB MOCK ----
const db = {
  getMediaById: async (id: string, userId: string): Promise<MediaRecording | null> => {
    return {
      id,
      user_id: userId,
      media_type: 'audio',
      processing_status: 'pending_processing',
      path: 'http://localhost:8000/sample.wav'
    };
  },

  updateMediaStatus: async (id: string, status: ProcessingStatus) => {
    console.log(`[DB] media ${id} → status ${status}`);
  },

  updateMediaData: async (id: string, data: Partial<MediaRecording>) => {
    console.log(`[DB] media ${id} update`, data);
  },

  createAiResult: async (result: Omit<AiResult, 'id' | 'created_at'>) => {
    console.log(`[DB] AI result`, result);
  }
};
// ------------------

class AiService {

  public async startProcessing(mediaId: string, userId: string) {
    const media = await db.getMediaById(mediaId, userId);
    if (!media) throw new Error("MediaNotFound");

    const plan = this._createJobPlan(media);
    this._runOrchestration(media, plan);

    return { plan };
  }


  private async _runOrchestration(media: MediaRecording, plan: JobType[]) {
    await db.updateMediaStatus(media.id, "processing");
    let transcriptionText: string | undefined = undefined;

    try {
      for (const jobType of plan) {
        const result = await this._executeJobWithRetries(media, jobType, transcriptionText);

        if (jobType === "transcription" && result.success) {
          transcriptionText = result.data.text;
        }
      }

      await db.updateMediaStatus(media.id, "processed");

    } catch (err: any) {
      await db.updateMediaStatus(media.id, "error");
    }
  }


  private async _executeJobWithRetries(media: MediaRecording, jobType: JobType, transcriptionText?: string) {
    const attempts = 1 + AI_CONFIG.maxRetries;

    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        const result = await this._performSingleJobAttempt(media, jobType, transcriptionText);

        await this._persistJobSuccess(media, jobType, result);

        return { success: true, data: result };

      } catch (err: any) {

        if (attempt === attempts) {
          await this._persistJobFailure(media.id, jobType, err.message);
          throw err;
        }
      }
    }

    return { success: false, error: "unreachable" };
  }


  private async _performSingleJobAttempt(media: MediaRecording, jobType: JobType, transcriptionText?: string) {

    switch (jobType) {

      case "transcription":
        return aiServiceAdapter.transcription({
          media_url: media.path!
        });

      case "summary":
        return aiServiceAdapter.summary({ text: transcriptionText! });

      case "tags":
        return aiServiceAdapter.tags({
          text: transcriptionText ?? ""
        });

      case "embedding":
        return aiServiceAdapter.embedding({
          text: transcriptionText ?? ""
        });

      default:
        throw new Error(`Unknown job: ${jobType}`);
    }
  }


  private async _persistJobSuccess(media: MediaRecording, jobType: JobType, result: any) {
    const toUpdate: Partial<MediaRecording> = {};

    if (jobType === "transcription") {
      toUpdate.transcription = result.text;
      toUpdate.transcript_segments = result.segments;
      toUpdate.language = result.language;
      toUpdate.duration_seconds = result.duration_seconds;
      toUpdate.word_count = result.word_count;
    }

    if (jobType === "summary") {
      toUpdate.summary = result.summary;
    }

    if (jobType === "tags") {
      toUpdate.tags = result.tags;
    }

    if (jobType === "embedding") {
      toUpdate.embedding_vector = result.vector;
    }

    await db.updateMediaData(media.id, toUpdate);

    await db.createAiResult({
      media_id: media.id,
      job_type: jobType,
      status: "done",
      model_name: result.model_name,
      model_version: result.model_version,
      latency_ms: result.latency_ms,
    });
  }


  private async _persistJobFailure(mediaId: string, jobType: JobType, message: string) {
    await db.createAiResult({
      media_id: mediaId,
      job_type: jobType,
      status: "error",
      error_message: message
    });
  }


  private _createJobPlan(media: MediaRecording): JobType[] {
    return ["transcription", "summary", "tags", "embedding"];
  }
}

export const aiService = new AiService();

