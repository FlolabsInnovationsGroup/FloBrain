// src/features/ai-pipeline/ai.controller.ts (Fully Updated)

import { Request, Response, NextFunction } from 'express';
import { aiService } from './ai.service';
import { AiResult } from './ai.types';
import AppError from '../../utils/AppError';

// --- DATABASE MOCK (Remains the same) ---
const db = {
  getAiResultsByMediaId: async (mediaId: string): Promise<AiResult[]> => {
    // ... (mock implementation)
    return [];
  },
};
// --- END DATABASE MOCK ---

/**
 * A utility to catch async errors and pass them to the global error handler.
 * This avoids writing try-catch blocks in every controller.
 */
const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};


class AiController {
  /**
   * Handles the request to start processing a single media item.
   * POST /api/v1/ai/process/:mediaId
   */
  processMedia = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { mediaId } = req.params;
    // @ts-ignore - Assuming user is attached by an auth middleware
    const userId = req.user?.id || 'mock_user_id';

    if (!mediaId) {
      return next(new AppError(400, 'Media ID is required.'));
    }

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
  });

  /**
   * Handles the request to view AI results for a media item.
   * GET /api/v1/ai/results/:mediaId
   */
  getResults = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { mediaId } = req.params;

    if (!mediaId) {
        return next(new AppError(400, 'Media ID is required.'));
    }

    const results = await db.getAiResultsByMediaId(mediaId);

    const formattedResults = results.map(r => ({
        job_type: r.job_type,
        model_name: r.model_name,
        latency_ms: r.latency_ms,
        status: r.status,
        error_message: r.error_message,
        created_at: r.created_at,
    }));
    
    res.status(200).json({ success: true, data: formattedResults });
  });
}

export const aiController = new AiController();