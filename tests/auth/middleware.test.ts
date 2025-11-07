// tests/auth/middleware.test.ts

import request from 'supertest';
import { app } from '../../src/app';
import '../setup/db'; 

describe('Authentication Middleware', () => {

  it('should allow access to a protected route with the dev-only auth stub', async () => {
    const response = await request(app).get('/api/v1/media');
    expect(response.status).toBe(200);
  });
});