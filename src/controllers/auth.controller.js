// src/controllers/auth.controller.js
const bcrypt = require('bcrypt');
const User = require('../models/user.model'); // <-- Import the Sequelize model
const { generateToken } = require('../services/token.service');

const register = async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: { message: 'Email and password are required.' } });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(409).json({ success: false, error: { message: 'Email already registered.' } });
    }

    // Create new user using Sequelize. The password will be hashed by the model's hook.
    const newUser = await User.create({ email: email.toLowerCase(), password, fullName: full_name });

    // Generate JWT
    const token = generateToken(newUser);
    
    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: newUser.id, email: newUser.email, role: newUser.role },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Internal server error.', details: error.message } });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({ success: false, error: { message: 'Invalid credentials.' } });
    }

    // Find user by email
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(401).json({ success: false, error: { message: 'Invalid credentials.' } });
    }
    
    if (user.status !== 'active') {
        return res.status(403).json({ success: false, error: { message: 'User account is not active.' } });
    }

    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ success: false, error: { message: 'Invalid credentials.' } });
    }

    // Generate JWT
    const token = generateToken(user);
    
    res.status(200).json({
      success: true,
      data: { token, user: { id: user.id, email: user.email, role: user.role } },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Internal server error.' } });
  }
};

module.exports = { register, login };