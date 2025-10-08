const { db } = require('../models');
const { uploadToS3 } = require('./s3.service'); // Assuming s3.service.js is the same

const handleFileUpload = async (file, storageOption = 'disk') => {
  let uploadResult;
  let storageLocation;
  let filePath;

  if (storageOption === 's3') {
    // This part remains the same, assuming you implement S3 uploads
    uploadResult = await uploadToS3(file);
    storageLocation = 's3';
    filePath = uploadResult.Location;
  } else {
    // Logic for disk storage
    storageLocation = 'disk';
    filePath = file.path;
  }

  // Use Sequelize's `create` method to insert a new record
  const newFile = await db.File.create({
    originalName: file.originalname,
    storageName: file.filename,
    mimetype: file.mimetype,
    size: file.size,
    path: filePath,
    storageLocation: storageLocation,
  });

  return newFile;
};

module.exports = {
  handleFileUpload,
};