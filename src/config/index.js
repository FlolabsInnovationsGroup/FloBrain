require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  
  databaseUrl: process.env.DATABASE_URL, 
  
  maxAudioSize: parseInt(process.env.MAX_AUDIO_SIZE),
  maxVideoSize: parseInt(process.env.MAX_VIDEO_SIZE),
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    s3BucketName: process.env.S3_BUCKET_NAME,
  }
};