// tests/media/media.integration.test.ts
import request from 'supertest';
import { app } from '../../src/app'; 
import { MediaRecording } from '../../src/models/MediaRecording';
import '../setup/db';
import { resetDb, seedBasic } from '../fixtures/db';
import { sequelize } from '../../src/sequelize';
import fs from 'fs';
import { joinRepoPath } from '../../src/utils/paths';

describe('Media API Integration Tests', () => {
  // === STEP 1: Upload a file, save it to DB, and return 201 ===
  it('should upload a file, save it to the database, and return a 201 status', async () => {
    const imagePath = `${__dirname}/../../__tests__/fixtures/tiny.png`;
    const userIdForTest = 1;
    const response = await request(app)
      .post('/api/v1/media/upload')
      .field('media_type', 'image')
      .field('tags', 'integration,test')
      .attach('file', imagePath);
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    const responseData = response.body.data || response.body;
    expect(String(responseData.user_id)).toBe(String(userIdForTest));
    const mediaId = responseData.id;
    const recordInDb = await MediaRecording.findByPk(mediaId);
    expect(recordInDb).not.toBeNull();
    if (recordInDb) {
      expect(String(recordInDb?.get('user_id'))).toBe(String(userIdForTest));
    }
  });

  // === STEP 2: Return 413 for too large file ===
  it('should returns 413 for a file that is too large', async () => {
    const largeBuffer = Buffer.alloc(300 * 1024 * 1024, 'a');
    const response = await request(app)
      .post('/api/v1/media/upload')
      .field('media_type', 'image')
      .attach('file', largeBuffer, 'largefile.png');
    expect(response.status).toBe(413);
  });

  // === STEP 3: Return 415 for unsupported media type ===
  it('should return 415 for an unsupported media type', async () => {
    const { sniffTrusted } = require('../../src/utils/mime');
    (sniffTrusted as jest.Mock).mockResolvedValueOnce(null);
    const textFilePath = `${__dirname}/../fixtures/fake-image.txt`;
    require('fs').writeFileSync(textFilePath, 'this is not an image');
    const response = await request(app)
      .post('/api/v1/media/upload')
      .field('media_type', 'image')
      .attach('file', textFilePath);
    expect(response.status).toBe(415);
  });

  // === STEP 4: List only media belonging to the authenticated user ===
  it('should list only media belonging to the authenticated user (User A)', async () => {
    const response = await request(app).get('/api/v1/media');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    for (const media of response.body.data) {
      expect(media.user_id).toBe(1);
    }
  });

  // === STEP 5: Deny access to media owned by another user ===
  it('should return 404 when User A tries to get media owned by User B', async () => {
    const mediaForUserB = await MediaRecording.create({
      id: 'media_for_user_b',
      user_id: 2,
      media_type: 'audio',
      timestamp: new Date(),
      file_path: '/fake/path/for/user/b.mp3',
      file_size: 12345,
      format: 'mp3',
      processing_status: 'processed',
    });
    const response = await request(app).get(`/api/v1/media/${mediaForUserB.get('id')}`);
    expect(response.status).toBe(404);
  });

  // === STEP 6: Update tags of an owned media record ===
  it('should patch the tags of an owned media record', async () => {
    const mediaIdToUpdate = '1';
    const response = await request(app)
      .patch(`/api/v1/media/${mediaIdToUpdate}`)
      .send({ tags: ['updated', 'new-tag'] });
    expect(response.status).toBe(200);
    expect(response.body.data.tags).toEqual(['updated', 'new-tag']);
  });

  // === STEP 7: Delete an owned media record ===
  it('should delete an owned media record', async () => {
    const mediaIdToDelete = '2';
    // Step 1: Prepare fake file
    const record = await MediaRecording.findByPk(mediaIdToDelete);
    const relativePath = record!.get('file_path') as string;
    const absoluteFilePath = joinRepoPath(relativePath);
    fs.mkdirSync(require('path').dirname(absoluteFilePath), { recursive: true });
    fs.writeFileSync(absoluteFilePath, 'dummy content');
    expect(fs.existsSync(absoluteFilePath)).toBe(true);
    // Step 2: Perform delete request
    const deleteResponse = await request(app).delete(`/api/v1/media/${mediaIdToDelete}`);
    // Step 3: Verify results
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.data.deleted).toBe(true);
    expect(fs.existsSync(absoluteFilePath)).toBe(false);
    const recordInDbAfterDelete = await MediaRecording.findByPk(mediaIdToDelete);
    expect(recordInDbAfterDelete).toBeNull();
  });

  // === STEP 8: Handle upload with provided timestamp ===
  it('should correctly handle an upload with a provided timestamp', async () => {
    const imagePath = `${__dirname}/../../__tests__/fixtures/tiny.png`;
    const specificTimestamp = '2025-01-01T12:00:00.000Z';
    const response = await request(app)
      .post('/api/v1/media/upload')
      .field('media_type', 'image')
      .field('timestamp', specificTimestamp)
      .attach('file', imagePath);
    expect(response.status).toBe(201);
    expect(new Date(response.body.data.timestamp).toISOString()).toBe(specificTimestamp);
  });

  // === STEP 9: Filter media list by device_id ===
  it('should correctly filter the media list by device_id', async () => {
    await MediaRecording.create({
      id: 'media_with_device',
      user_id: 1,
      device_id: 'device_1',
      media_type: 'image',
      timestamp: new Date(),
      file_path: '/uploads/test/device.png',
      file_size: 100,
      format: 'png',
      processing_status: 'processed'
    });
    const response = await request(app).get('/api/v1/media?device_id=device_1');
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);
    for (const media of response.body.data) {
      expect(media.device_id).toBe('device_1');
    }
  });
});
