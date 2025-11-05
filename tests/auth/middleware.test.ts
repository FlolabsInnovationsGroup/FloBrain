// tests/auth/middleware.test.ts

import request from 'supertest';
import { app } from '../../src/app';
import '../setup/db'; // Nécessaire pour que la BDD soit prête

describe('Authentication Middleware', () => {

  // Ce test vérifie le comportement de notre 'requireAuth' factice
  it('should allow access to a protected route with the dev-only auth stub', async () => {
    // La route GET /api/v1/media est protégée par 'requireAuth'
    const response = await request(app).get('/api/v1/media');

    // Puisque le 'requireAuth' factice laisse passer tout le monde,
    // on s'attend à un statut 200 (OK), et non une erreur 401 (Unauthorized).
    expect(response.status).toBe(200);
  });
});