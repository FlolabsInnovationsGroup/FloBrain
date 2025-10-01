// src/services/db.service.js
const { Pool } = require('pg');
const config = require('../config');

// This creates a new connection pool. The pool manages multiple client connections
// to the database, which is more efficient than opening and closing a new connection
// for every single query.
const pool = new Pool({
  connectionString: config.database.url,
});

module.exports = {
  // We export a 'query' function that makes it easy to run queries from other files.
  // It uses a client from the pool, runs the query, and then releases the client back to the pool.
  query: (text, params) => pool.query(text, params),
};