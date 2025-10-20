const fs = require("fs");
const path = require("path");
require("dotenv").config();
const { Client } = require("pg");

const migrationsDir = path.resolve("db/migrations");

async function runMigrations() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    console.log("✅ Connected to database");

    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith(".sql")).sort();
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
      console.log(`🚀 Running migration: ${file}`);
      await client.query(sql);
    }

    console.log("✅ All migrations applied successfully");
  } catch (err) {
    console.error("❌ Migration failed:", err.stack || err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
