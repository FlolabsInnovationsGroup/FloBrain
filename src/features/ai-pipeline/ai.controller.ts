import { Request, Response } from 'express';
import { aiService } from './ai.service';
import { AiResult } from './ai.types';

// --- DATABASE MOCK for getResults (Replace with your actual database client) ---
// This placeholder simulates fetching AI results for a given media item.
const db = {
  getAiResultsByMediaId: async (mediaId: string): Promise<AiResult[]> => {
    console.log(`[DB MOCK] Fetching AI results for media ${mediaId}`);
    // In a real app, you would query:
    // SELECT job_type, model_name, latency_ms, status, error_message, created_at
    // FROM ai_results WHERE media_id = ? ORDER BY created_at DESC
    return [
      // Example data
      {
        id: 'res-123',
        media_id: mediaId,
        job_type: 'tags',
        status: 'done',
        model_name: 'tag-model-v2',
        latency_ms: 350,
        created_at: new Date(),
      },
    ];
  },
};
// --- END DATABASE MOCK ---

class AiController {
  /**
   * Handles the request to start processing a single media item.
   * POST /api/v1/ai/process/:mediaId
   */
  async processMedia(req: Request, res: Response): Promise<void> {
    const { mediaId } = req.params;
    // @ts-ignore - Assuming user is attached by an auth middleware
    const userId = req.user?.id || 'mock_user_id'; // Replace with your actual user object

    if (!mediaId) {
      res.status(400).json({ success: false, message: 'Media ID is required.' });
      return;
    }

    try {
      const { plan } = await aiService.startProcessing(mediaId, userId);

      // Rule: Respond with 202 Accepted
      res.status(202).json({
        success: true,
        data: {
          media_id: mediaId,
          started: true,
          plan: plan,
        },
      });
    } catch (error: any) {
      // Map service-layer errors to specific HTTP responses
      switch (error.message) {
        case 'MediaNotFound':
          // Rule: Guard for ownership
          res.status(404).json({ success: false, message: 'Media not found or you do not have permission to access it.' });
          break;
        case 'AlreadyProcessing':
          // Rule: Idempotency
          res.status(409).json({ success: false, message: 'Media is already being processed.' });
          break;
        case 'InvalidInitialStatus':
            res.status(409).json({ success: false, message: `Cannot start processing from its current state.` });
            break;
        default:
          console.error(`[AI Controller] Error processing media ${mediaId}:`, error);
          res.status(500).json({ success: false, message: 'An internal server error occurred.' });
          break;
      }
    }
  }

  /**
   * Handles the request to view AI results for a media item.
   * GET /api/v1/ai/results/:mediaId
   */
  async getResults(req: Request, res: Response): Promise<void> {
    const { mediaId } = req.params;
    // @ts-ignore - Assuming user is attached by an auth middleware
    const userId = req.user?.id || 'mock_user_id'; // Ensure user owns media (logic inside db call)

    if (!mediaId) {
        res.status(400).json({ success: false, message: 'Media ID is required.' });
        return;
    }

    try {
        // Here, your actual DB call should also verify ownership (e.g., join with media_recordings table)
        const results = await db.getAiResultsByMediaId(mediaId);

        // Rule: Return ordered results
        const formattedResults = results.map(r => ({
            job_type: r.job_type,
            model_name: r.model_name,
            latency_ms: r.latency_ms,
            status: r.status,
            error_message: r.error_message,
            created_at: r.created_at,
        }));
        
        res.status(200).json({ success: true, data: formattedResults });

    } catch (error: any) {
        console.error(`[AI Controller] Error fetching results for media ${mediaId}:`, error);
        res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
  }
}

export const aiController = new AiController();