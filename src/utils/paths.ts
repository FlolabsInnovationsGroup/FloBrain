import { DateTime } from 'luxon';
import { join } from 'path';

export function makeRelativePathBase(userId: string, isoTimestamp?: string) {
  const dt = isoTimestamp
    ? DateTime.fromISO(isoTimestamp, { zone: 'utc' }).toUTC()
    : DateTime.utc();
  const YYYY = dt.toFormat('yyyy');
  const MM = dt.toFormat('MM');
  const DD = dt.toFormat('dd');
  return `/uploads/${userId}/${YYYY}/${MM}/${DD}`;
}

export function joinRepoPath(relativePath: string) {
  if (!relativePath.startsWith('/uploads/')) throw new Error('Invalid relative path');
  return join(process.cwd(), '.' + relativePath);
}
