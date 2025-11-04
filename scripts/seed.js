// scripts/seed.js
require("dotenv").config();
const { Client } = require("pg");

async function seed() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    console.log("🌱  Seeding database...");

    // Clear existing data
    await client.query(`
      TRUNCATE TABLE ai_results, actions, media_recordings, devices, users RESTART IDENTITY CASCADE;
    `);

    // --- USERS ---
    await client.query(`
      INSERT INTO users (id, email, hashed_password, full_name, role, status)
      VALUES 
        ('user_1', 'admin@example.com', 'hashed_pw', 'Admin User', 'admin', 'active'),
        ('user_2', 'user@example.com', 'hashed_pw', 'Normal User', 'user', 'active');
    `);

    // --- DEVICES ---
    await client.query(`
      INSERT INTO devices (id, user_id, custom_name, model_number, firmware_version)
      VALUES
        ('device_A', 'user_1', 'Admin Device', 'M100', '1.0.0'),
        ('device_B', 'user_2', 'User Device', 'U200', '1.0.1');
    `);

    // --- MEDIA RECORDINGS ---
    await client.query(`
      INSERT INTO media_recordings
        (id, user_id, device_id, timestamp, media_type, file_path, file_size, tags, processing_status)
      VALUES
        ('media_1', 'user_1', 'device_A', now(), 'audio', '/files/audio1.mp3', 12345, ARRAY['meeting','notes'], 'pending_processing'),
        ('media_2', 'user_1', 'device_A', now(), 'image', '/files/image1.png', 54321, ARRAY['photo'], 'processed'),
        ('media_3', 'user_2', 'device_B', now(), 'video', '/files/video1.mp4', 77777, ARRAY['recording'], 'pending_upload');
    `);

    // --- ACTIONS ---
    await client.query(`
      INSERT INTO actions
        (id, user_id, source_media_id, action_type, description, status, due_date)
      VALUES
        ('action_1', 'user_1', 'media_1', 'reminder', 'Review audio meeting notes', 'pending', now() + interval '1 day');
    `);

    // --- AI RESULTS ---
    await client.query(`
      INSERT INTO ai_results
        (id, media_id, job_type, model_name, latency_ms, status)
      VALUES
        ('ai_result_1', 'media_2', 'summary', 'openai-gpt-4', 1500, 'done');
    `);

    console.log("✅  Seeding complete!");
  } catch (err) {
    console.error("❌  Seeding failed:", err.stack || err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
$