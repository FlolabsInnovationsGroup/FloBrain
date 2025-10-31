import app from './media-app';

const port = process.env.PORT || 3000;
process.on('uncaughtException', (e) => console.error('[uncaughtException]', e));
process.on('unhandledRejection', (e) => console.error('[unhandledRejection]', e));
console.log('[boot] starting Media API...');
app.listen(port, () => console.log(`[boot] Media API on :${port}`));
