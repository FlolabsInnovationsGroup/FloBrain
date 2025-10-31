import express from 'express';
import { mediaRouter, errorHandler } from './routes/mediaRoutes';

const app = express();
app.use(express.json());
app.use(mediaRouter);
app.use(errorHandler);

export default app;
