import { Request, Response, NextFunction } from 'express';
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err?.name === 'MulterError' && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, error: 'File too large' });
  }
  if (err?.status && err?.message) {
    return res.status(err.status).json({ success: false, error: err.message });
  }
  console.error('[ERROR]', err);
  return res.status(500).json({ success: false, error: 'Internal server error' });
}
