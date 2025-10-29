// tests/unit/token.service.test.js
const jwt = require('jsonwebtoken');
const { generateToken } = require('../../src/services/token.service');

describe('Token Service', () => {
  // Set mock environment variables for testing
  const OLD_ENV = process.env;
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '5m';
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  it('should generate a valid JWT with correct claims', () => {
    // 1. Arrange: Create a sample user payload
    const user = {
      id: 'user-123',
      role: 'user',
    };

    // 2. Act: Generate the token
    const token = generateToken(user);
    
    // 3. Assert: Verify the token
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    // Decode the token to check its payload (claims)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    expect(decoded.sub).toBe('user-123');
    expect(decoded.roles).toEqual(['user']);
    expect(decoded.exp).toBeGreaterThan(decoded.iat);
  });
});