// src/api/v1/ping.routes.js
const express = require('express');
const router = express.Router();
const { success } = require('../../middleware/response-shape');

router.get('/ping', (req, res) => {
  return success(res, { ok: true, version: 'v1' });
});

module.exports = router;
