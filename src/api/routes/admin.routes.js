// src/api/routes/admin.routes.js
const express = require('express');
const pingController = require('../../controllers/ping.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();

// This route is protected by two layers of middleware.
// 1. authMiddleware: Checks for a valid JWT.
// 2. roleMiddleware(['admin']): Checks if the user has the 'admin' role.
router.get(
  '/ping',
  authMiddleware,
  roleMiddleware(['admin']),
  pingController.adminPing
);

module.exports = router;