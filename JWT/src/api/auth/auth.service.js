// src/api/auth/auth.service.js
const jwtService = require('../../services/jwt.service');
const db = require('../../services/db.service'); // Import the db service
const bcrypt = require('bcryptjs');

// Remove the old dummy 'users' array

const registerUser = async (username, password) => {
  // 1. Check if user already exists
  const existingUser = await db.query('SELECT * FROM users WHERE username = $1', [username]);
  if (existingUser.rows.length > 0) {
    throw new Error('Username already exists.');
  }

  // 2. Hash the password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // 3. Insert the new user into the database
  const newUser = await db.query(
    'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, roles',
    [username, passwordHash]
  );

  return newUser.rows[0];
};

const authenticateUser = async (username, password) => {
  // 1. Find the user in the database
  const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
  const user = result.rows[0];

  if (!user) {
    throw new Error('Invalid credentials.');
  }

  // 2. Compare the provided password with the stored hash
  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    throw new Error('Invalid credentials.');
  }

  // 3. If credentials are valid, generate a JWT
  const payload = {
    sub: user.id, // Use the real user ID from the database
    roles: user.roles,
  };

  return jwtService.generateToken(payload);
};

module.exports = {
  registerUser,
  authenticateUser,
};