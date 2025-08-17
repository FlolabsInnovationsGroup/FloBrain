#pragma once

// ===== EDIT ME =====
#define WIFI_SSID     "YOUR_WIFI_SSID"
#define WIFI_PASS     "YOUR_WIFI_PASSWORD"

// Run ingest.py locally OR point to your real backend:
#define BACKEND_URL   "http://192.168.1.100:8000/ingest"  // change for your LAN IP
// ====================

// Queue folders (on device they’re real mounts; here we just keep path strings)
#define SD_QUEUE_DIR  "/sd/queue"
#define SD_FAILED_DIR "/sd/failed"
#define SPIFFS_ROOT   "/spiffs"