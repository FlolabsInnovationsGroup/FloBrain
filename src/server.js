// src/server.js
// Load environment variables from .env file FIRST.
// This line MUST be at the very top of your entry file.
require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});