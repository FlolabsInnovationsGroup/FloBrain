// src/features/media/media.routes.ts

import { Router } from 'express';
import { mediaController } from './media.controller';
import { isAuthenticated } from '../../middleware/isAuthenticated';

const router = Router();

// A single, powerful GET endpoint for listing media.
// It is protected and delegates all logic to the controller.
router.get('/', isAuthenticated, mediaController.getMedia);

export const mediaRouter = router;