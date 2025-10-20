const config = require('../../config');

const validateAudio = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const allowedMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ message: 'Invalid audio file type.' });
  }

  if (req.file.size > config.maxAudioSize) {
    return res.status(400).json({ message: 'Audio file size exceeds the limit.' });
  }

  next();
};

const validateVideo = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const allowedMimeTypes = ['video/mp4', 'video/mpeg', 'video/quicktime'];
  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ message: 'Invalid video file type.' });
  }

  if (req.file.size > config.maxVideoSize) {
    return res.status(400).json({ message: 'Video file size exceeds the limit.' });
  }

  next();
};

module.exports = {
  validateAudio,
  validateVideo,
};