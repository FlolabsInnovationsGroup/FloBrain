const express = require('express');
const router = express.Router();
const mediaRoutes = require('./media.routes');
const userRoutes = require('./user.routes');

// Health check / root route
router.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running' });
});

// Mount the media routes under the /media path
// All routes in media.routes.js will be prefixed with /api/v1/media
router.use('/media', mediaRoutes);
router.use('/users', userRoutes);

module.exports = router;