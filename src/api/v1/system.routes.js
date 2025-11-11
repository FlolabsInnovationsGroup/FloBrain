// src/api/v1/system.routes.js
const express = require('express');
const os = require('os');
const router = express.Router();
const { success } = require('../../middleware/response-shape');

router.get('/healthcheck', (req, res) => {
  const uptime = process.uptime();
  return success(res, { status: 'ok', uptime_seconds: Math.floor(uptime), pid: process.pid });
});

router.get('/status', (req, res) => {
  const now = new Date().toISOString();
  return success(res, {
    env: process.env.NODE_ENV || 'unknown',
    host: os.hostname(),
    utc: now,
    apiVersion: 'v1'
  });
});

module.exports = router;
