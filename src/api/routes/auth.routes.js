// src/api/routes/auth.routes.js
const express = require('express');
const authController = require('../../controllers/auth.controller');

const router = express.Router();

// Defines the routes and maps them to the controller functions
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;