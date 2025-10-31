import { Router } from 'express';
import { uploadSingle } from '../middleware/upload';
import { errorHandler } from '../middleware/errors';
import { upload, getOne, list, patch, hardDelete } from '../controllers/mediaController';

// DEV-ONLY auth stub; replace with real JWT later
const requireAuth = (req: any, _res: any, next: any) => {
  if (!req.user?.id) req.user = { id: 'dev_user' };
  next();
};

export const mediaRouter = Router();
mediaRouter.post('/api/v1/media/upload', requireAuth, uploadSingle, upload);
mediaRouter.get('/api/v1/media/:id', requireAuth, getOne);
mediaRouter.get('/api/v1/media', requireAuth, list);
mediaRouter.patch('/api/v1/media/:id', requireAuth, patch);
mediaRouter.delete('/api/v1/media/:id', requireAuth, hardDelete);
export { errorHandler };
