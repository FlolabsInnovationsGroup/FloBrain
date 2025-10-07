const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET;
const DEFAULT_EXP = process.env.JWT_EXPIRES_IN || '1h';

if (!SECRET) console.warn('[jwt] JWT_SECRET not set');

function signToken(payload, opts = {}) {
  return jwt.sign(payload, SECRET, { expiresIn: DEFAULT_EXP, ...opts });
}

function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, SECRET, (err, decoded) => (err ? reject(err) : resolve(decoded)));
  });
}

module.exports = { signToken, verifyToken };
