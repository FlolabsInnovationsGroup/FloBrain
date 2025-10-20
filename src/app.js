const express = require('express');
const { connectDB } = require('./config/database');
const { syncDb } = require('./api/models');
const uploadRoutes = require('./api/routes/upload.routes');
const errorHandler = require('./api/middlewares/errorHandler');

const app = express();

// Connect to Database and Sync Models
connectDB();
syncDb();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/upload', uploadRoutes);

// Error Handling Middleware
app.use(errorHandler);

module.exports = app;