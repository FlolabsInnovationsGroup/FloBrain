// src/app.js
const express = require('express');
const authRouter = require('./api/routes/auth.routes');
const pingRouter = require('./api/routes/ping.routes');   // <-- IMPORT PING ROUTER
const adminRouter = require('./api/routes/admin.routes'); // <-- IMPORT ADMIN ROUTER

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// A simple root route to confirm the server is running
app.get('/api/v1/ping', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Pong!',
  });
});

// Mount the routers
app.use('/api/v1/auth', authRouter);
app.use('/api/v1', pingRouter);     // <-- USE PING ROUTER
app.use('/api/v1/admin', adminRouter); // <-- USE ADMIN ROUTER


module.exports = app;