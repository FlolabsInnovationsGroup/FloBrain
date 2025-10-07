const fs = require('fs');
const path = require('path');
const db = require('../src/services/db.service');

(async () => {
  try {
    const sql = fs.readFileSync(
      path.join(__dirname, '..', 'db', 'migrations', '001_init.sql'),
      'utf8'
    );
    await db.query(sql);
    console.log('✅ Migration complete.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
})();
