const { Sequelize } = require('sequelize');
const config = require('./index'); // Imports the config from index.js

// Add this line for debugging to be 100% sure
console.log('Connecting with URL:', config.databaseUrl); 

// Create a new Sequelize instance
const sequelize = new Sequelize(config.databaseUrl, {
  dialect: 'postgres',
  logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the PostgreSQL database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };