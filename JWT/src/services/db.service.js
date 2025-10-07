const { Pool } = require('pg');
require('dotenv').config();

const url = process.env.DATABASE_URL;
let pool;

if (url) {
  pool = new Pool({ connectionString: url });
  pool.on('error', (err) => console.error('[pg] Pool error', err));
} else {
  console.warn('[pg] DATABASE_URL not set; DB-backed routes may fail.');
}

async function query(text, params) {
  if (!pool) throw new Error('DATABASE_URL not configured');
  const client = await pool.connect();
  try { return await client.query(text, params); }
  finally { client.release(); }
}

module.exports = { query };
