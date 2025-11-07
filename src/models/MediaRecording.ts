import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize';

export const MediaRecording = sequelize.define('media', {
  id:                { type: DataTypes.TEXT, primaryKey: true },
  user_id:           { type: DataTypes.TEXT, allowNull: false },
  device_id:         { type: DataTypes.TEXT, allowNull: true },
  timestamp:         { type: DataTypes.DATE, allowNull: false },
  media_type:        { type: DataTypes.TEXT, allowNull: false },
  file_path:         { type: DataTypes.TEXT, allowNull: false },
  file_size:         { type: DataTypes.BIGINT, allowNull: false },
  format:            { type: DataTypes.TEXT, allowNull: false },
  duration_sec:      { type: DataTypes.DOUBLE, allowNull: true },
  resolution:        { type: DataTypes.TEXT, allowNull: true },
  sample_rate_hz:    { type: DataTypes.INTEGER, allowNull: true },
  tags:              { type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: false, defaultValue: [] },
  processing_status: { type: DataTypes.TEXT, allowNull: false },
  summary:           { type: DataTypes.TEXT, allowNull: true },
  transcription:     { type: DataTypes.TEXT, allowNull: true },
  embedding_vector:  { type: DataTypes.JSONB, allowNull: true },
  created_at:        { type: DataTypes.DATE, allowNull: true },
  updated_at:        { type: DataTypes.DATE, allowNull: true },
}, {
  // If you want Sequelize to auto-manage the two timestamp fields, set:
  // timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at',
  timestamps: false,
  freezeTableName: true,
});
