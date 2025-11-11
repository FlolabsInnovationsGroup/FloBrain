import { mkdir, writeFile, rm } from 'fs/promises';
import { dirname } from 'path';
export async function ensureDir(pathOnDisk: string) { await mkdir(pathOnDisk, { recursive: true }); }
export async function safeWriteFile(pathOnDisk: string, data: Buffer) {
  await ensureDir(dirname(pathOnDisk));
  await writeFile(pathOnDisk, data, { flag: 'wx' });
}
export async function safeDelete(pathOnDisk: string) { try { await rm(pathOnDisk, { force: true }); } catch {} }
