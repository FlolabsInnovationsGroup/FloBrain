import { Router, Request, Response, NextFunction } from 'express';
import { aiController } from './ai.controller';

const router = Router();

/**
 * Placeholder Authentication Middleware.
 * In a real application, this would verify a JWT, session, or API key.
 * It should attach the authenticated user object to the request.
 */
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  console.log('Authenticating request...');
  // For demonstration, we'll attach a mock user object.
  // @ts-ignore
  req.user = { id: 'mock_user_id' }; 
  
  // In a real scenario, if authentication fails:
  // return res.status(401).json({ message: 'Unauthorized' });

  next();
};

/**
 * @route   POST /api/v1/ai/process/:mediaId
 * @desc    Enqueue and start processing a single media item.
 * @access  Authenticated
 */
router.post(
  '/process/:mediaId',
  isAuthenticated,
  (req: Request, res: Response) => aiController.processMedia(req, res)
);

/**
 * @route   GET /api/v1/ai/results/:mediaId
 * @desc    View AI audit results for a media item.
 * @access  Authenticated
 */
router.get(
  '/results/:mediaId',
  isAuthenticated,
  (req: Request, res: Response) => aiController.getResults(req, res)
);

export const aiPipelineRouter = router;

