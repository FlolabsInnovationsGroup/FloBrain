// This loads the variables from your .env file
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres'
  },
  test: {
    // Configuration for the test environment can be added here later
  },
  production: {
    // Configuration for the production environment can be added here later
  }
};