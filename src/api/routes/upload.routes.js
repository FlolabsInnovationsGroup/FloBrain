const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const upload = require('../../config/multer');
const { validateAudio, validateVideo } = require('../middlewares/validation');

router.post('/audio', upload.single('audio'), validateAudio, uploadController.uploadAudio);
router.post('/video', upload.single('video'), validateVideo, uploadController.uploadVideo);

module.exports = router;