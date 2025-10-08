const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'file_uploads', // or 'postgres' if you're using that
  password: '', // leave it blank if no password is set
  port: 5432,
});

module.exports = pool;
