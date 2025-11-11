const TOKEN = /^[A-Za-z0-9_-]+$/;
export function parseTags(input?: string|string[]): string[] {
  if (!input) return [];
  const arr = Array.isArray(input) ? input : input.split(',');
  const cleaned = arr.map(t => (t||'').trim()).filter(Boolean).filter(t => TOKEN.test(t));
  return [...new Set(cleaned)];
}
