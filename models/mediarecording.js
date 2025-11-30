'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MediaRecording extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  MediaRecording.init({
    userId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mediaType: {
      type: DataTypes.ENUM('audio', 'video', 'image'),
      allowNull: false
    },
    processingStatus: {
      type: DataTypes.ENUM('pending_processing', 'processing', 'processed', 'error'),
      allowNull: false,
      defaultValue: 'pending_processing'
    },
    transcription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true
    },
    path: {
      type: DataTypes.STRING,
      allowNull: true
    },
    format: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'MediaRecording',
    underscored: true,
  });
  return MediaRecording;
};