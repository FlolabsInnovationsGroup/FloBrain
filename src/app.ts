// src/app.ts

import express from 'express';
<<<<<<< HEAD
// Make sure to import the new router
import { aiPipelineRouter } from './features/ai-pipeline/ai.routes'; 
import models from '../models';
=======
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import * as dotenv from 'dotenv';

import logger from './utils/logger';
import AppError from './utils/AppError';
import errorHandler from './middleware/errorHandler';

// Import Routers
import { aiPipelineRouter } from './features/ai-pipeline/ai.routes';
import { userRouter } from './features/user/user.routes';
import { mediaRouter } from './features/media/media.routes';

dotenv.config();
>>>>>>> origin/development

const app = express();

// --- 1. Core Middleware ---
app.use(cors());
app.use(helmet());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    error: 'Too Many Requests',
    message: 'You have exceeded the 100 requests in 15 minutes limit!',
  },
});
app.use(limiter);

// --- 2. Routes ---
app.use('/api/v1/ai', aiPipelineRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/media', mediaRouter);

// --- 3. Not Found Handler ---
// This middleware will catch any request that doesn't match the routes above
// THIS IS THE CORRECTED PART
app.use((req, res, next) => {
  next(new AppError(404, `Can't find ${req.originalUrl} on this server!`));
});


<<<<<<< HEAD
export default app;
=======
// --- 4. Global Error Handling Middleware ---
// This must be the LAST middleware
app.use(errorHandler);

// --- Server Startup Logic ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
>>>>>>> origin/development
