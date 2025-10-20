// src/db/adapter.js
require("dotenv").config();
const { Pool } = require("pg");

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// A simple query function used by other services (e.g. healthcheck)
async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}

module.exports = { query };
