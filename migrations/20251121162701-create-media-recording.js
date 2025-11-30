'use strict';

const { all } = require('axios');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MediaRecordings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      mediaType: {
        type: Sequelize.ENUM('audio', 'video', 'image'),
      },
      processingStatus: {
        type: Sequelize.ENUM('pending_processing', 'processing', 'processed', 'error'),
        defaultValue: 'pending_processing',
        allowNull: false
      },
      transcription: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      summary: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true
      },
      path: {
        type: Sequelize.STRING,
        allowNull: true
      },
      format: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('MediaRecordings');
  }
};