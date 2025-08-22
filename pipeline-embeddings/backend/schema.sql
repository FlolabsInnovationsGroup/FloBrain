-- files, transcripts, embeddings, faiss_map
CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  device_id TEXT,
  path TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS transcripts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  file_id TEXT REFERENCES files(id),
  segments_json TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS embeddings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  file_id TEXT,
  segment_id INTEGER,
  start_s REAL, end_s REAL,
  text TEXT,
  vec BLOB,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS faiss_map (
  faiss_id INTEGER PRIMARY KEY,
  embedding_id INTEGER
);
