<<<<<<< HEAD
// src/server.js
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
=======
const app = require('./app');
const config = require('./config');

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
>>>>>>> origin/upload_API_videos_audios
