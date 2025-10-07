const fs = require('fs');
const path = require('path');
const db = require('../src/services/db.service');

(async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    await db.query(sql);
    console.log('🌱 Seed complete.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
})();
