// src/app.js
const express = require('express');
const cors = require('cors');
const yaml = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const apiV1 = require('./api/v1');
const { success } = require('./middleware/response-shape');
const { notFound, globalErrorHandler } = require('./middleware/error-handler');

const app = express();

// Load env early (server will set process.env via dotenv in server.js)
app.use(cors());
app.use(express.json());

// base, unversioned ping route
app.get('/api/ping', (req, res) => success(res, { ok: true }));

// versioned routes
app.use('/api/v1', apiV1);

// OpenAPI/Swagger UI
const swaggerDocument = yaml.load(path.join(__dirname, '../docs/OpenAPI.yaml'));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// unknown /api/* -> 404 standard error shape
app.use('/api', notFound);

// global error handler
app.use(globalErrorHandler);

module.exports = app;
