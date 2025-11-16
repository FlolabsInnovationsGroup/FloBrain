import express from 'express';
// Make sure to import the new router
import { aiPipelineRouter } from './features/ai-pipeline/ai.routes'; 

const app = express();
app.use(express.json());

// ... your other middleware and routes

// Add the AI pipeline routes under the specified path
app.use('/api/v1/ai', aiPipelineRouter);

// ... your error handling and server startup logic

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});