import { resetDb, seedBasic } from "../fixtures/db";
import { sequelize } from "../../src/sequelize";
import { endPool } from '../fixtures/db';

beforeAll(async () => {
await sequelize.query(`DROP TABLE IF EXISTS media CASCADE;`);
await sequelize.query(`DROP TABLE IF EXISTS devices CASCADE;`);
await sequelize.query(`DROP TABLE IF EXISTS users CASCADE;`);
await sequelize.query(`CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, role TEXT);`);
await sequelize.query(`CREATE TABLE devices (id INTEGER PRIMARY KEY, user_id INTEGER, name TEXT);`);
await sequelize.query(`
  CREATE TABLE media (
    id                TEXT PRIMARY KEY,
    user_id           INTEGER,
    device_id         TEXT,
    timestamp         TIMESTAMPTZ,
    media_type        TEXT,
    file_path         TEXT,
    file_size         BIGINT,
    format            TEXT,
    duration_sec      DOUBLE PRECISION,
    resolution        TEXT,
    sample_rate_hz    INTEGER,
    tags              TEXT[],
    processing_status TEXT,
    summary           TEXT,
    transcription     TEXT,
    embedding_vector  JSONB,
    created_at        TIMESTAMPTZ,
    updated_at        TIMESTAMPTZ);`);
await resetDb();
await seedBasic();
});
afterAll(async () => {
  await sequelize.close();
  await endPool();
});
