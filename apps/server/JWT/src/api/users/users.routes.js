// src/api/users/users.routes.js
const express = require('express');
const usersController = require('./users.controller');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// This route is protected by the authenticate middleware
router.get('/profile', authenticate, usersController.getProfile);

module.exports = router;