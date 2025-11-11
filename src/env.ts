import 'dotenv/config';

function need(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

export const UPLOAD_DIR = need('UPLOAD_DIR');
export const MAX_UPLOAD_MB = Number(need('MAX_UPLOAD_MB'));
export const ALLOWED_AUDIO = need('ALLOWED_AUDIO').split(',');
export const ALLOWED_VIDEO = need('ALLOWED_VIDEO').split(',');
export const ALLOWED_IMAGE = need('ALLOWED_IMAGE').split(',');

export const BYTES_PER_MB = 1024 * 1024;
export const MAX_BYTES = Math.max(1, Math.floor(MAX_UPLOAD_MB)) * BYTES_PER_MB;
