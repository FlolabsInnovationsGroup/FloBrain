// src/app.js
const express = require('express');
const cors = require('cors'); // <-- Import the cors package
const authRoutes = require('./api/auth/auth.routes');
const userRoutes = require('./api/users/users.routes');

const app = express();

// --- MIDDLEWARE ---
app.use(cors()); // <-- Add this line to allow all cross-origin requests
app.use(express.json());

// --- API ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// ... (rest of the file)

module.exports = app;