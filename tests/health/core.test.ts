// tests/health/core.test.ts

import request from 'supertest';
import { app } from '../../src/app'; 

describe('Health and Core Routes', () => {

  // Test for Task 6.A.1: /api/v1/ping
  it('GET /api/v1/ping should return 200 with { ok: true }', async () => {
    const response = await request(app).get('/api/v1/ping');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });
  require('../setup/db');
  it('GET /api/v1/health should return 200 when the database is reachable', async () => {
    const response = await request(app).get('/api/v1/health');
    expect(response.status).toBe(200);
  });

  // Test for Task 6.A.3: Unknown route
  it('should return 404 for an unknown route', async () => {
    const response = await request(app).get('/api/v1/cette-route-n-existe-pas');
    expect(response.status).toBe(404);
  });
});