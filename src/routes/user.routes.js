const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const validate = require('../middleware/validate');
const { createUserSchema } = require('../validators/user.validator');

router.post('/', validate(createUserSchema), userController.createUser);

module.exports = router;