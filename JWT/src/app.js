const express = require('express');
const cors = require('cors');

const authenticate = require('./api/middleware/authenticate');
const usersRoutes = require('./api/users/users.routes');

const app = express();
app.use(cors());
app.use(express.json());

// Health
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// DB-free smoke test to prove JWT auth
app.get('/api/ping-protected', authenticate, (req, res) => {
  res.json({ ok: true, user: req.user });
});

// Real users routes (profile will query DB)
app.use('/api/users', usersRoutes);

// 404 + error handlers
app.use((req, res) => res.status(404).json({ message: 'Not found' }));
app.use((err, _req, res, _next) => {
  console.error('[ERR]', err);
  res.status(500).json({ message: 'Internal server error.' });
});

module.exports = app;
