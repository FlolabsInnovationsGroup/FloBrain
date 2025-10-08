const AWS = require('aws-sdk');
const config = require('../../config');
const fs = require('fs');

// Configure AWS SDK
AWS.config.update({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  region: config.aws.region,
});

const s3 = new AWS.S3();

const uploadToS3 = (file) => {
  const fileStream = fs.createReadStream(file.path);

  const uploadParams = {
    Bucket: config.aws.s3BucketName,
    Key: file.filename,
    Body: fileStream,
  };

  return s3.upload(uploadParams).promise();
};

// S3 Stub for local development
const s3Stub = {
  upload: (params) => {
    return {
      promise: () => Promise.resolve({
        Location: `http://localhost:3000/stub/${params.Key}`,
        Key: params.Key,
      }),
    };
  },
};

const s3Service = process.env.NODE_ENV === 'development' ? s3Stub : s3;

module.exports = {
  uploadToS3,
  s3Service
};