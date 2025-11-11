// src/config/multer.js

const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Centralize the MIME type logic here
const MIME_TYPE_MAP = {
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.mp4': 'video/mp4',
  '.mpeg': 'video/mpeg',
  '.mov': 'video/quicktime',
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine the correct MIME type before deciding the folder
    let correctedMimeType = file.mimetype; // Start with what the client sent
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const inferredMimeType = MIME_TYPE_MAP[fileExtension];

    if (inferredMimeType && correctedMimeType === 'application/octet-stream') {
      correctedMimeType = inferredMimeType;
      // IMPORTANT: Correct the mimetype on the file object for later use
      file.mimetype = correctedMimeType; 
    }

    // Now, use the correctedMimeType to choose the folder
    let folder = 'uploads/others';
    if (correctedMimeType.startsWith('audio')) {
      folder = 'uploads/audio';
    } else if (correctedMimeType.startsWith('video')) {
      folder = 'uploads/video';
    }

    // Create folder if not exists
    fs.mkdirSync(folder, { recursive: true });

    cb(null, folder);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

module.exports = upload;