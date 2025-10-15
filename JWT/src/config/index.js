// src/config/index.js
require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  // This section is required for the db.service.js to work
  database: {
    url: process.env.DATABASE_URL,
  },
};

module.exports = config;