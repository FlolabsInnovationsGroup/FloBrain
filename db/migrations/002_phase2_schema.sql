-- db/migrations/002_phase1_schema.sql

-- Delete old tables if they exist
DROP TABLE IF EXISTS ai_results CASCADE;
DROP TABLE IF EXISTS actions CASCADE;
DROP TABLE IF EXISTS media_recordings CASCADE;
DROP TABLE IF EXISTS devices CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- USERS TABLE
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  hashed_password TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- DEVICES TABLE
CREATE TABLE devices (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  custom_name TEXT,
  model_number TEXT NOT NULL,
  firmware_version TEXT NOT NULL,
  device_status TEXT NOT NULL DEFAULT 'active',
  activated_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- MEDIA RECORDINGS TABLE
CREATE TABLE media_recordings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  device_id TEXT REFERENCES devices(id) ON UPDATE CASCADE ON DELETE SET NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('audio','video','image')),
  file_path TEXT NOT NULL,
  file_size BIGINT,
  format TEXT,
  duration_sec NUMERIC(10,3),
  resolution TEXT,
  sample_rate_hz INTEGER,
  tags TEXT[] NOT NULL DEFAULT '{}',
  processing_status TEXT NOT NULL DEFAULT 'pending_upload',
  summary TEXT,
  transcription TEXT,
  embedding_vector JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ACTIONS TABLE
CREATE TABLE actions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_media_id TEXT NOT NULL REFERENCES media_recordings(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('reminder','task','appointment')),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- AI RESULTS TABLE
CREATE TABLE ai_results (
  id TEXT PRIMARY KEY,
  media_id TEXT NOT NULL REFERENCES media_recordings(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL CHECK (job_type IN ('transcription','summary','tags','embedding')),
  model_name TEXT NOT NULL,
  model_version TEXT,
  latency_ms INTEGER,
  status TEXT NOT NULL DEFAULT 'done',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- INDEXES (for faster queries)
CREATE INDEX idx_media_user_timestamp ON media_recordings (user_id, timestamp DESC);
CREATE INDEX idx_media_device_id ON media_recordings (device_id);
CREATE INDEX idx_media_tags_gin ON media_recordings USING GIN (tags);
CREATE INDEX idx_media_processing_status ON media_recordings (processing_status);
CREATE INDEX idx_devices_user_id ON devices (user_id);
CREATE INDEX idx_actions_user_status ON actions (user_id, status);
