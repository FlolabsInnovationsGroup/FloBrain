const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit'); 
const config = require('../config');
const mediaController = require('../controllers/media.controller');
const validate = require('../middleware/validate');
const { uploadMediaSchema } = require('../validators/media.validator');

const uploadLimiter = rateLimit({
  // --- UPDATE THESE VALUES ---
  windowMs: config.rateLimitWindowMs,
  max: config.maxUploadsPerWindow,
  // ---
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'You have made too many upload attempts. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/upload', uploadLimiter, validate(uploadMediaSchema), mediaController.uploadMedia);

router.post('/upload-ai-timeout', mediaController.triggerAiTimeout);

module.exports = router;