// src/api/auth/auth.controller.js
const authService = require('./auth.service');

const register = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const user = await authService.registerUser(username, password);
    res.status(201).json({ message: 'User created successfully.', user });
  } catch (error) {
    if (error.message.includes('already exists')) {
      return res.status(409).json({ message: error.message }); // 409 Conflict
    }
    // Use a more generic message for other errors to avoid leaking implementation details
    res.status(500).json({ message: 'An error occurred during registration.' });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const token = await authService.authenticateUser(username, password);
    res.json({ token });
  } catch (error) {
    // Always return a generic 401 for login failures to prevent user enumeration
    res.status(401).json({ message: error.message });
  }
};

// This is the most critical part.
// Ensure both functions are included in this object.
module.exports = {
  register,
  login,
};