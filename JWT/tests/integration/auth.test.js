// tests/integration/auth.test.js
const request = require('supertest');
const app = require('../../src/app');
const { generateToken } = require('../../src/services/jwt.service');

describe('Authentication Middleware', () => {
  let validToken;
  let expiredToken;

  beforeAll(() => {
    // Generate a valid token for tests
    validToken = generateToken({ sub: 'test-user', roles: ['user'] });
    
    // Generate an expired token
    const jwt = require('jsonwebtoken');
    const config = require('../../src/config');
    expiredToken = jwt.sign({ sub: 'test-user' }, config.jwt.secret, { expiresIn: '-1s' });
  });

  it('should return 401 Unauthorized if no token is provided', async () => {
    const res = await request(app).get('/api/users/profile');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toContain('No token provided');
  });

  it('should return 400 Bad Request for a malformed token', async () => {
    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', 'Bearer malformed-token');
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('Malformed token');
  });

  it('should return 401 Unauthorized for an expired token', async () => {
    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toContain('Token has expired');
  });

  it('should allow access with a valid token', async () => {
    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${validToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('Successfully accessed protected profile data');
    expect(res.body.user.sub).toBe('test-user');
  });
});