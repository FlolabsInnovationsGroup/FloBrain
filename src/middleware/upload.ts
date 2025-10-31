import multer from 'multer';
import { MAX_BYTES } from '../env';
export const uploadSingle = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1 }
}).single('file');
