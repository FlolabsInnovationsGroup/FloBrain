// src/services/jwt.service.js
const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Generates a JWT for a given user payload.
 * @param {object} payload - The payload to include in the token (e.g., { sub: userId, roles: ['user'] }).
 * @returns {string} The generated JWT.
 */
const generateToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Verifies a JWT.
 * @param {string} token - The JWT to verify.
 * @returns {Promise<object>} A promise that resolves with the decoded payload if the token is valid.
 */
const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.jwt.secret, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded);
    });
  });
};

module.exports = {
  generateToken,
  verifyToken,
};