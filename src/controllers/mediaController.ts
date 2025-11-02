// src/controllers/mediaController.ts

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { MediaRecording } from '../models/MediaRecording';
import { parseTags } from '../utils/tags';
import { sniffTrusted, TrustedMimeInfo } from '../utils/mime';
import { makeRelativePathBase, joinRepoPath } from '../utils/paths';
import { safeWriteFile, safeDelete } from '../utils/files';
import { ALLOWED_AUDIO, ALLOWED_IMAGE, ALLOWED_VIDEO } from '../env';
import { canTransition, ProcessingStatus } from '../utils/status';

// --- HELPERS AND CONFIGURATION ---
class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}
interface UploadRequestBody {
  media_type: 'audio' | 'video' | 'image';
  device_id?: string;
  timestamp?: string;
  tags?: string;
}
interface PatchRequestBody {
  tags?: string | string[];
  processing_status?: ProcessingStatus;
  summary?: string;
  transcription?: string;
}
const allowedMimeTypes = new Map<string, Set<string>>([
  ['audio', new Set(ALLOWED_AUDIO)],
  ['video', new Set(ALLOWED_VIDEO)],
  ['image', new Set(ALLOWED_IMAGE)],
]);
function toMediaResponse(row: MediaRecording) {
  return {
    id: row.get('id'),
    user_id: row.get('user_id'),
    device_id: row.get('device_id'),
    timestamp: row.get('timestamp'),
    media_type: row.get('media_type'),
    file_path: row.get('file_path'),
    file_size: row.get('file_size'),
    format: row.get('format'),
    tags: row.get('tags'),
    processing_status: row.get('processing_status'),
  };
}
async function validateUpload(file: Express.Multer.File, body: UploadRequestBody): Promise<TrustedMimeInfo> {
  const { media_type } = body;
  if (!media_type || !allowedMimeTypes.has(media_type)) {
    throw new ApiError(400, 'Bad Request: Invalid or missing media_type');
  }
  const trusted = await sniffTrusted(file.buffer);
  if (!trusted) {
    throw new ApiError(415, 'Unsupported Media Type: File content is unknown or not supported');
  }
  if (trusted.family !== media_type) {
    throw new ApiError(415, `Unsupported Media Type: Claimed type '${media_type}' but file is of type '${trusted.family}'`);
  }
  const allowedSet = allowedMimeTypes.get(trusted.family)!;
  if (!allowedSet.has(trusted.mime)) {
    throw new ApiError(415, `Unsupported Media Type: MIME type '${trusted.mime}' is not allowed for this category`);
  }
  return trusted;
}

// --- POST /api/v1/media/upload ---
export async function upload(req: Request, res: Response) {
  const userId = (req as any).user?.id as string | undefined;
  if (!userId) {
    throw new ApiError(401, 'Unauthorized: User not found in token');
  }
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file || !file.buffer || file.size === 0) {
    throw new ApiError(400, 'Bad Request: Missing or empty file in upload');
  }
  const body: UploadRequestBody = req.body;
  const trustedMime = await validateUpload(file, body);
  const timestamp = body.timestamp ? new Date(body.timestamp) : new Date();
  if (isNaN(timestamp.getTime())) {
    throw new ApiError(400, 'Bad Request: Invalid timestamp format');
  }
  const tagList = parseTags(body.tags || '');
  const isoUTC = timestamp.toISOString();
  const relativeBasePath = makeRelativePathBase(userId, isoUTC);
  const filename = `${uuidv4()}.${trustedMime.ext}`;
  const relativePath = path.join(relativeBasePath, filename).replace(/\\/g, '/');
  const onDiskPath = joinRepoPath(relativePath);
  try {
    await safeWriteFile(onDiskPath, file.buffer);
    const newMediaData = {
      id: `m_${uuidv4().replace(/-/g, '')}`,
      user_id: userId,
      device_id: body.device_id || null,
      timestamp: isoUTC,
      media_type: body.media_type,
      file_path: relativePath,
      file_size: file.size,
      format: trustedMime.ext,
      tags: tagList,
      processing_status: 'pending_processing' as ProcessingStatus,
    };
    const newRecording = await MediaRecording.create(newMediaData as any);
    console.log(`[UPLOAD SUCCESS] User ${userId} uploaded ${relativePath} (Size: ${file.size} bytes)`);
    res.status(201).json({ success: true, data: toMediaResponse(newRecording) });
  } catch (error) {
    await safeDelete(onDiskPath);
    console.error(`[UPLOAD FAILED] Rolled back file creation for ${onDiskPath}`, error);
    throw error;
  }
}

// --- GET /api/v1/media/:id ---
export async function getOne(req: Request, res: Response) {
  const userId = (req as any).user?.id as string;
  const { id } = req.params;
  const recording = await MediaRecording.findOne({ where: { id, user_id: userId } });
  if (!recording) {
    throw new ApiError(404, 'Not Found: Media recording not found or you do not have permission to view it');
  }
  res.status(200).json({ success: true, data: toMediaResponse(recording) });
}

// --- GET /api/v1/media ---
export async function list(req: Request, res: Response) {
  const userId = (req as any).user?.id as string;
  const { limit: queryLimit, before, after, device_id, tags } = req.query;
  const where: any = { user_id: userId };
  const timestampFilter: any = {};
  if (before) timestampFilter.lt = new Date(before as string);
  if (after) timestampFilter.gt = new Date(after as string);
  if (Object.keys(timestampFilter).length > 0) where.timestamp = timestampFilter;
  if (device_id) where.device_id = device_id as string;
  if (tags) {
    const tagList = parseTags(tags as string);
    if (tagList.length > 0) where.tags = { $overlap: tagList };
  }
  const limit = Math.min(Number(queryLimit) || 20, 100);
  const recordings = await MediaRecording.findAll({
    where,
    limit,
    order: [['timestamp', 'DESC']],
  });
  res.status(200).json({ success: true, data: recordings.map(toMediaResponse) });
}

// --- PATCH /api/v1/media/:id ---
export async function patch(req: Request, res: Response) {
  const userId = (req as any).user?.id as string;
  const { id } = req.params;
  const body: PatchRequestBody = req.body;
  const recording = await MediaRecording.findOne({ where: { id, user_id: userId } });
  if (!recording) {
    throw new ApiError(404, 'Not Found: Media recording not found or you do not have permission to modify it');
  }
  const updates: Partial<MediaRecording> = {};
  if (body.tags !== undefined) {
    updates.tags = Array.isArray(body.tags) ? body.tags : parseTags(body.tags);
  }
  if (body.processing_status !== undefined) {
    const from = recording.get('processing_status') as ProcessingStatus;
    const to = body.processing_status;
    if (!canTransition(from, to)) {
      throw new ApiError(409, `Conflict: Illegal status transition from '${from}' to '${to}'`);
    }
    updates.processing_status = to;
  }
  if (body.summary !== undefined) updates.summary = body.summary;
  if (body.transcription !== undefined) updates.transcription = body.transcription;
  if (Object.keys(updates).length > 0) {
    updates.updated_at = new Date();
    await recording.update(updates);
  }
  res.status(200).json({ success: true, data: toMediaResponse(recording) });
}

// --- DELETE /api/v1/media/:id ---
export async function hardDelete(req: Request, res: Response) {
  const userId = (req as any).user?.id as string;
  const { id } = req.params;
  const recording = await MediaRecording.findOne({ where: { id, user_id: userId } });
  if (!recording) {
    throw new ApiError(404, 'Not Found: Media recording not found');
  }
  const filePath = recording.get('file_path') as string;
  if (filePath) {
    const onDiskPath = joinRepoPath(filePath);
    await safeDelete(onDiskPath).catch(err => {
      console.warn(`[DELETE WARNING] Could not delete file ${onDiskPath}. It might be already gone.`, err);
    });
  }
  await recording.destroy();
  res.status(200).json({ success: true, data: { id, deleted: true } });
}