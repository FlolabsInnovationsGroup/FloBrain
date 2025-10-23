// src/api/v1/index.js
const express = require('express');
const router = express.Router();

const pingRoutes = require('./ping.routes');
const systemRoutes = require('./system.routes');

router.use('/', pingRoutes);      // GET /api/v1/ping
router.use('/', systemRoutes);    // GET /api/v1/healthcheck, /api/v1/status

module.exports = router;
