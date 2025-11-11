const uploadService = require('../services/upload.service');

const uploadAudio = async (req, res, next) => {
  try {
    const storageOption = req.body.storage || 'disk'; // 'disk' or 's3'
    const savedFile = await uploadService.handleFileUpload(req.file, storageOption);
    res.status(201).json({
      status: "ok",
      file: savedFile.id,
    });
  } catch (error) {
    next(error);
  }
};

const uploadVideo = async (req, res, next) => {
  try {
    const storageOption = req.body.storage || 'disk';
    const savedFile = await uploadService.handleFileUpload(req.file, storageOption);
    res.status(201).json({
      status: "ok",
      file: savedFile.id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadAudio,
  uploadVideo,
};