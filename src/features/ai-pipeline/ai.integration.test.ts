// Fichier: src/features/ai-pipeline/ai.integration.test.ts

import request from 'supertest';
import app from '../../app';
import models from '../../../models';

const MediaRecordingModel = (models as any).MediaRecording;
const sequelize = (models as any).sequelize;
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('AI Pipeline Integration Tests', () => {

  // Before all tests, reset the database to a clean state.
  beforeAll(async () => {
    // The `force: true` option will drop the table if it already exists and recreate it.
    // This ensures a clean and predictable state for our test.
    await sequelize.sync({ force: true });
  });

  // After all tests have run, close the database connection to prevent leaks.
  afterAll(async () => {
    await sequelize.close();
  });

  it('should accept a media file for processing, run the mock AI pipeline, and update the database correctly', async () => {
    // 1. ARRANGE: Create a test record in the database.
    const testMedia = await MediaRecordingModel.create({
      userId: 'mock_user_id',
      mediaType: 'audio',
      processingStatus: 'pending_processing',
      path: 'test/audio.mp3',
    });

    // 2. ACT: Send a POST request to the API endpoint.
    const response = await request(app)
      .post(`/api/v1/ai/process/${testMedia.id}`)
      .expect(202); // We expect a "202 Accepted" status for async tasks.

    // 3. ASSERT (Initial Response): Verify the immediate API response is correct.
    expect(response.body.success).toBe(true);
    expect(response.body.data.started).toBe(true);

    // 4. WAIT: Allow the asynchronous background processing to complete.
    // The mock processor has simulated delays totaling ~2.3 seconds.
    await wait(3000);

    // 5. ASSERT (Final State): Verify that the record in the database has been updated by the pipeline.
    const rawUpdatedMedia = await MediaRecordingModel.findByPk(testMedia.id);
    expect(rawUpdatedMedia).not.toBeNull();
    
    const updatedMedia = rawUpdatedMedia.get({ plain: true });
    expect(updatedMedia.processingStatus).toBe('processed');
    expect(updatedMedia.transcription).toContain('This is a sample transcript');
    expect(updatedMedia.summary).toContain('This is a mock summary');
    expect(updatedMedia.tags).toEqual(['ai-service', 'development', 'mock', 'placeholder', 'sample-data']);
  });
});