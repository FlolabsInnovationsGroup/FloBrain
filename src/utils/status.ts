export type ProcessingStatus = 'pending_processing'|'processing'|'processed'|'error';
export function canTransition(from: ProcessingStatus, to: ProcessingStatus) {
  const order: ProcessingStatus[] = ['pending_processing','processing','processed'];
  if (to === 'error') return true;
  const i = order.indexOf(from), j = order.indexOf(to);
  return i >= 0 && j >= 0 && j === i + 1;
}
