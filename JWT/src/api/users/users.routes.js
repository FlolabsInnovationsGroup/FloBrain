const express = require('express');
const authenticate = require('../middleware/authenticate');
const controller = require('./users.controller');

const router = express.Router();

router.get('/profile', authenticate, controller.getProfile);

module.exports = router;
