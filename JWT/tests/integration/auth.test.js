// tests/integration/auth.test.js
const request = require('supertest');
const app = require('../../src/app');
const { generateToken } = require('../../src/services/jwt.service');

// This tells Jest to replace the real db.service with a mock.
// We DO NOT import the real 'db' module at the top level anymore.
jest.mock('../../src/services/db.service');

describe('Authentication Middleware', () => {
  let validToken;
  let expiredToken;
  let db; // <--- Declare a variable to hold our mock

  beforeAll(() => {
    validToken = generateToken({ sub: 'test-user-id', roles: ['user'] });
    
    const jwt = require('jsonwebtoken');
    const config = require('../../src/config');
    expiredToken = jwt.sign({ sub: 'test-user-id' }, config.jwt.secret, { expiresIn: '-1s' });
  });

  // This block now sets up our db mock reliably before each test
  beforeEach(() => {
    // By requiring the module here, we are GUARANTEED to get the mocked version.
    db = require('../../src/services/db.service'); 
    // Now this will work because db.query is the Jest mock function.
    db.query.mockClear();
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
    const mockUser = {
      id: 'test-user-id',
      username: 'testuser',
      roles: ['user'],
      created_at: new Date().toISOString(),
    };
    // The `db` variable here is now correctly the mock.
    db.query.mockResolvedValue({ rows: [mockUser] });

    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${validToken}`);
      
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('Successfully accessed protected profile data');
    expect(res.body.user.id).toBe('test-user-id');
  });
});