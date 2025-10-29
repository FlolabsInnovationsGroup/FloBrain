// src/api/routes/ping.routes.js
const express = require('express');
const pingController = require('../../controllers/ping.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// This route is protected. The authMiddleware will run before the controller logic.
// If the token is invalid or missing, the middleware will send a 401 response
// and the controller will never be reached.
router.get('/ping-protected', authMiddleware, pingController.protectedPing);

module.exports = router;