import express from 'express';
import { mediaRouter, errorHandler } from './routes/mediaRoutes';
import { sequelize } from './sequelize';
import { da } from 'zod/v4/locales';
const app = express();
app.use(express.json());
app.get('/api/v1/ping', (req, res) => {
  res.status(200).json({ ok: true });
});
app.get('/api/v1/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', message: error.message });
  }
});
app.use(mediaRouter);
app.use(errorHandler);
export { app };
