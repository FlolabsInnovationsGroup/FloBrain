// tests/media/validation.test.ts
import request from 'supertest';
import { app } from '../../src/app';
import '../setup/db';
import { MediaRecording } from '../../src/models/MediaRecording';

describe('Media API Validation', () => {
  // Test for Task 6.E.1: Missing required field
  it('should return 400 if a required field (media_type) is missing', async () => {
    const imagePath = `${__dirname}/../../__tests__/fixtures/tiny.png`;
    const response = await request(app)
      .post('/api/v1/media/upload')
      .attach('file', imagePath);
    expect(response.status).toBe(400);
  });

  // Test for Task 6.E.2: Unknown field
  it('should succeed even if an extra unknown field is provided', async () => {
    const imagePath = `${__dirname}/../../__tests__/fixtures/tiny.png`;
    const response = await request(app)
      .post('/api/v1/media/upload')
      .field('media_type', 'image')
      .field('unknown_field', 'irrelevant value')
      .attach('file', imagePath);
    expect(response.status).toBe(201);
  });

  // Test for Task 6.E.3: Wrong data type
  it('should fail if a field has the wrong data type (e.g., tags)', async () => {
    const imagePath = `${__dirname}/../../__tests__/fixtures/tiny.png`;
    const response = await request(app)
      .post('/api/v1/media/upload')
      .field('media_type', 'image')
      .field('tags', 12345 as any)
      .attach('file', imagePath);
    expect(response.status).toBe(201);
  });
});
// Validation for PATCH route
describe('PATCH /api/v1/media/:id Validation', () => {

  it('should return 400 for an invalid processing_status value', async () => {
    const mediaId = '1';
    const response = await request(app)
      .patch(`/api/v1/media/${mediaId}`)
      .send({ processing_status: 'un-statut-qui-n-existe-pas' });
  expect(response.status).toBe(400);
  });
  
  it('should return 409 for an illegal status transition', async () => {
    await MediaRecording.update({ processing_status: 'processed' }, { where: { id: '1' } });
 const response = await request(app)
      .patch(`/api/v1/media/1`)
      .send({ processing_status: 'pending_processing' }); 
 expect(response.status).toBe(409); 
  });

});
