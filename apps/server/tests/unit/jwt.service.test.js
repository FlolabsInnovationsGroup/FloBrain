// tests/unit/jwt.service.test.js
const { generateToken, verifyToken } = require('../../src/services/jwt.service');
const jwt = require('jsonwebtoken');
const config = require('../../src/config');

describe('JWT Service', () => {
  const payload = { sub: 'user-id-456', roles: ['user'] };

  // --- Tests for generateToken ---
  describe('generateToken', () => {
    it('should generate a valid JWT', () => {
      const token = generateToken(payload);
      
      // A JWT has three parts separated by dots
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);

      // Decode the token (without verification) to check the payload
      const decoded = jwt.decode(token);
      expect(decoded.sub).toBe(payload.sub);
      expect(decoded.roles).toEqual(payload.roles);
    });
  });

  // --- Tests for verifyToken ---
  describe('verifyToken', () => {
    it('should resolve with the payload for a valid token', async () => {
      const token = generateToken(payload);
      const decoded = await verifyToken(token);
      
      expect(decoded.sub).toBe(payload.sub);
      expect(decoded.roles).toEqual(payload.roles);
    });

    it('should reject for a token signed with the wrong secret', async () => {
      // Sign a token with a different secret
      const invalidToken = jwt.sign(payload, 'wrong-secret');
      
      // We expect the verifyToken promise to be rejected
      await expect(verifyToken(invalidToken)).rejects.toThrow(jwt.JsonWebTokenError);
    });

    it('should reject for an expired token', async () => {
      // Sign a token that expired in the past
      const expiredToken = jwt.sign(payload, config.jwt.secret, { expiresIn: '-1s' });
      
      await expect(verifyToken(expiredToken)).rejects.toThrow(jwt.TokenExpiredError);
    });
  });
});