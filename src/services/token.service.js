// src/services/token.service.js
const jwt = require('jsonwebtoken');

/**
 * Creates a JWT for a given user.
 * This is the single source of truth for token generation.
 *
 * @param {object} user - The user object from the database.
 * @returns {string} The generated JSON Web Token.
 */
const generateToken = (user) => {
  // 1. Define the claims (payload) for the token
  //    - `sub` (subject) should be the user's ID.
  //    - `roles` must be an array of the user's roles.
  const payload = {
    sub: user.id,
    roles: [user.role], // As per requirements, roles must be an array
  };

  // 2. Retrieve secret and expiration from environment variables
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in the environment variables.');
  }

  // 3. Sign the token with the secret and expiration time
  const token = jwt.sign(payload, secret, { expiresIn });

  return token;
};

module.exports = {
  generateToken,
};