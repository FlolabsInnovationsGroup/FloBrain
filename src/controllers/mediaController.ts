import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { MediaRecording } from '../models/MediaRecording';
import { parseTags } from '../utils/tags';
import { sniffTrusted } from '../utils/mime';
import { makeRelativePathBase, joinRepoPath } from '../utils/paths';
import { safeWriteFile, safeDelete } from '../utils/files';
import { ALLOWED_AUDIO, ALLOWED_IMAGE, ALLOWED_VIDEO } from '../env';
import { canTransition, ProcessingStatus } from '../utils/status';
import { callAi } from '../clients/aiClient';
import { sequelize } from '../sequelize';

function bad(status: number, message: string) { const e: any = new Error(message); e.status = status; return e; }
function allowedFor(fam: 'audio'|'video'|'image') {
  if (fam === 'audio') return new Set(ALLOWED_AUDIO);
  if (fam === 'video') return new Set(ALLOWED_VIDEO);
  return new Set(ALLOWED_IMAGE);
}
function redact(row: any) { return row; }

// POST /api/v1/media/upload
export async function upload(req: Request, res: Response) {
  const userId = String((req as any).user?.id || '');
  if (!userId) throw bad(401, 'Unauthorized');
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file || !file.buffer || file.size === 0) throw bad(400, 'Missing file');

  const { media_type, device_id, timestamp, tags } = req.body as any;
  if (!media_type || !['audio','video','image'].includes(media_type)) throw bad(400, 'Invalid media_type');

  const trusted = await sniffTrusted(file.buffer);
  if (!trusted) throw bad(415, 'Unsupported or unknown media content');
  if (trusted.family !== media_type) throw bad(415, `Claimed ${media_type} but got ${trusted.family}`);
  const allow = allowedFor(trusted.family);
  if (!allow.has(trusted.mime)) throw bad(415, `MIME ${trusted.mime} not allowed`);

  let ts = new Date();
  if (timestamp) {
    const d = new Date(timestamp);
    if (Number.isNaN(d.getTime())) throw bad(400, 'Invalid timestamp');
    ts = d;
  }
  const isoUTC = ts.toISOString();
  const tagList = parseTags(tags);

  const base = makeRelativePathBase(userId, isoUTC);
  const filename = `${uuidv4()}.${trusted.ext}`;
  const relativePath = `${base}/${filename}`;
  const onDisk = joinRepoPath(relativePath);

  try { await safeWriteFile(onDisk, file.buffer); }
  catch { throw bad(500, 'Failed to write file'); }

  const id = `m_${uuidv4().replace(/-/g,'')}`;
  try {
    const row = await MediaRecording.create({
      id, user_id: userId, device_id: device_id ? String(device_id) : null,
      timestamp: isoUTC, media_type, file_path: relativePath, file_size: file.size,
      format: trusted.ext, duration_sec: null, resolution: null, sample_rate_hz: null,
      tags: tagList, processing_status: 'pending_processing', summary: null, transcription: null,
      embedding_vector: null, created_at: new Date(), updated_at: new Date(),
    });
    console.log('[UPLOAD]', JSON.stringify({ user_id: userId, device_id, media_type, size: file.size, final_path: relativePath }));
    return res.status(201).json({ success: true, data: {
      id: row.get('id'),
      user_id: row.get('user_id'),
      media_type: row.get('media_type'), 
      timestamp: row.get('timestamp'),
      file_path: row.get('file_path'), 
      file_size: row.get('file_size'), 
      format: row.get('format'),
      device_id: row.get('device_id'), 
      tags: row.get('tags'), 
      processing_status: row.get('processing_status'),
    }});
  } catch (err) {
    await safeDelete(onDisk);
    throw err;
  }
}

// GET /api/v1/media/:id
export async function getOne(req: Request, res: Response) {
  const userId = String((req as any).user?.id || '');
  if (!userId) throw bad(401, 'Unauthorized');
  const { id } = req.params;
  const row = await MediaRecording.findOne({ where: { id, user_id: userId } });
  if (!row) throw bad(404, 'Not found');
  res.json({ success: true, data: redact(row) });
}

// GET /api/v1/media
export async function list(req: Request, res: Response) {
  const userId = String((req as any).user?.id || '');
  if (!userId) throw bad(401, 'Unauthorized');
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const where: any = { user_id: userId };
  const { before, after, device_id, tags } = req.query as any;

  if (before) where.timestamp = { ...(where.timestamp||{}), lt: new Date(before) };
  if (after)  where.timestamp = { ...(where.timestamp||{}), gt: new Date(after) };
  if (device_id) where.device_id = String(device_id);
  if (tags) {
    const anyTags = parseTags(tags);
    if (anyTags.length) (where as any).tags = { $overlap: anyTags } as any;
  }
  const rows = await MediaRecording.findAll({ where, order: [['timestamp','DESC']], limit });
  res.json({ success: true, data: rows.map(redact) });
}

// PATCH /api/v1/media/:id
export async function patch(req: Request, res: Response) {
  const userId = String((req as any).user?.id || '');
  if (!userId) throw bad(401, 'Unauthorized');
  const { id } = req.params;
  const row: any = await MediaRecording.findOne({ where: { id, user_id: userId } });
  if (!row) throw bad(404, 'Not found');

  const updates: any = {};
  const { tags, processing_status, summary, transcription } = req.body || {};
  if (typeof tags !== 'undefined') updates.tags = Array.isArray(tags) ? parseTags(tags) : parseTags(String(tags));
  if (typeof processing_status !== 'undefined') {
    const from = row.processing_status as ProcessingStatus;
    const to = processing_status as ProcessingStatus;
    if (!['pending_processing','processing','processed','error'].includes(to)) throw bad(400, 'Invalid processing_status');
    if (!canTransition(from, to)) throw bad(409, `Illegal status transition: ${from} → ${to}`);
    updates.processing_status = to;
  }
  if (typeof summary !== 'undefined') updates.summary = String(summary);
  if (typeof transcription !== 'undefined') updates.transcription = String(transcription);
  updates.updated_at = new Date();

  await row.update(updates);
  res.json({ success: true, data: redact(row) });
}

// DELETE /api/v1/media/:id
export async function hardDelete(req: Request, res: Response) {
  const userId = String((req as any).user?.id || '');
  if (!userId) throw bad(401, 'Unauthorized');
  const { id } = req.params;
  const row: any = await MediaRecording.findOne({ where: { id, user_id: userId } });
  if (!row) throw bad(404, 'Not found');

  const disk = joinRepoPath(row.file_path as string);
  await safeDelete(disk);
  await row.destroy();
  res.json({ success: true, data: { id, deleted: true } });
}
