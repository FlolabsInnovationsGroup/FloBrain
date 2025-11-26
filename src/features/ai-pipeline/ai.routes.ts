// src/features/ai-pipeline/ai.routes.ts

import { Router, Request, Response } from 'express';
import { aiController } from './ai.controller';
// Import the centralized authentication middleware
import { isAuthenticated } from '../../middleware/isAuthenticated';

const router = Router();

/**
 * @route   POST /api/v1/ai/process/:mediaId
 * @desc    Enqueue and start processing a single media item.
 * @access  Authenticated
 */
router.post(
  '/process/:mediaId',
  isAuthenticated,
  aiController.processMedia
);

/**
 * @route   GET /api/v1/ai/results/:mediaId
 * @desc    View AI audit results for a media item.
 * @access  Authenticated
 */
router.get(
  '/results/:mediaId',
  isAuthenticated,
  aiController.getResults
);

export const aiPipelineRouter = router;