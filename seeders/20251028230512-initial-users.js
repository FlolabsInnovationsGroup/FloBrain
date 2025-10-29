'use strict';
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const hashedPasswordUser = await bcrypt.hash('password123', 10);
    const hashedPasswordAdmin = await bcrypt.hash('adminpassword', 10);
    
    await queryInterface.bulkInsert('Users', [
      {
        id: uuidv4(),
        email: 'test@example.com',
        password: hashedPasswordUser,
        full_name: 'Test User',
        role: 'user',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        email: 'admin@example.com',
        password: hashedPasswordAdmin,
        full_name: 'Admin User',
        role: 'admin',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    // This will remove all users created by this seeder
    await queryInterface.bulkDelete('Users', { 
      email: ['test@example.com', 'admin@example.com'] 
    }, {});
  }
};