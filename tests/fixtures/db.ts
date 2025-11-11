import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function tryQuery(sql: string) {
  try {
    await pool.query(sql);
  } catch (e) {
    // Early phase: DB might not be running or tables may not exist — ignore quietly.
    if (process.env.DEBUG_DB_FIXTURES === "1") {
      // Optional debug
      // console.error("DB fixture query failed:", e);
    }
  }
}

export async function resetDb() {
  await tryQuery("BEGIN");
  await tryQuery("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
  await tryQuery("TRUNCATE TABLE devices RESTART IDENTITY CASCADE");
  await tryQuery("TRUNCATE TABLE media RESTART IDENTITY CASCADE");
  await tryQuery("COMMIT");
}

export async function seedBasic() {
  await tryQuery(`
    INSERT INTO users (id, name, role) VALUES
      (1, 'User A', 'user'),
      (2, 'User B', 'user'),
      (3, 'Admin',  'admin')
  `);

  await tryQuery(`
    INSERT INTO devices (id, user_id, name) VALUES
      (1, 1, 'Device 1')
  `);

  await tryQuery(`
    INSERT INTO media (id, user_id, media_type, processing_status, timestamp, file_path, file_size, format) VALUES
      (1, 1, 'audio', 'pending_processing', NOW(), '/uploads/test/media_1.mp3', 100, 'mp3'),
      (2, 1, 'image', 'pending_processing', NOW(), '/uploads/test/media_2.png', 200, 'png')
  `);
}

export async function endPool() {
  await pool.end();
}
