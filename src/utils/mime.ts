import { fileTypeFromBuffer } from 'file-type';
export type Trusted = { mime: string; ext: string; family: 'audio'|'video'|'image'; };
export async function sniffTrusted(buf: Buffer): Promise<Trusted|null> {
  const ft = await fileTypeFromBuffer(buf);
  if (!ft) return null;
  const fam = ft.mime.split('/')[0];
  if (fam !== 'audio' && fam !== 'video' && fam !== 'image') return null;
  return { mime: ft.mime, ext: ft.ext, family: fam as Trusted['family'] };
}
