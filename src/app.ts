import express from 'express';
// Make sure to import the new router
import { aiPipelineRouter } from './features/ai-pipeline/ai.routes'; 
import models from '../models';

const app = express();
app.use(express.json());

// ... your other middleware and routes

// Add the AI pipeline routes under the specified path
app.use('/api/v1/ai', aiPipelineRouter);

// ... your error handling and server startup logic


export default app;