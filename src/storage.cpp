#include "storage.h"
#include <SPI.h>
#include <SD.h>
#include <SPIFFS.h>
#include <vector>
#include <algorithm>

static bool sd_available = false;

// Retry helper for SD.begin() with linear backoff
static bool try_sd_begin() {
  for (int i = 0; i < SD_RETRY_COUNT; ++i) {
    if (SD.begin(SD_CS_PIN, SPI)) return true;
    delay(SD_RETRY_DELAY_MS * (i + 1));
  }
  return false;
}

void storage_init() {
  // Bring up VSPI on configured pins
  SPI.begin(SD_SCK_PIN, SD_MISO_PIN, SD_MOSI_PIN, SD_CS_PIN);

  // Mount SD with retries
  sd_available = try_sd_begin();
  Serial.println(sd_available ? "✅ SD mounted over SPI"
                              : "⚠️ SD mount failed; using SPIFFS");

  // Mount SPIFFS (format if needed)
  if (!SPIFFS.begin(true)) {
    Serial.println("❌ SPIFFS mount failed!");
  }
}

bool Storage_write(const char* path, const char* data) {
  File file;

  // SD-first
  if (sd_available) {
    file = SD.open(path, FILE_WRITE);
    if (!file) {
      Serial.println("⚠️ SD write failed → falling back to SPIFFS");
      sd_available = false;
    }
  }

  // SPIFFS fallback
  if (!sd_available) {
    file = SPIFFS.open(path, FILE_WRITE);
    if (!file) {
      Serial.println("❌ SPIFFS write failed");
      return false;
    }
  }

  // Write + flush for better crash/power-loss resilience
  file.print(data);
  file.flush();
  file.close();
  return true;
}

// simple record used for sort/migrate
struct FileInfo { String name; time_t ts; };

// Copy one file from SPIFFS→SD with retry + size validation
static bool copy_with_retry_and_validate(const char* name) {
  for (int attempt = 0; attempt <= MIGRATE_RETRY_COUNT; ++attempt) {
    File src = SPIFFS.open(name, FILE_READ);
    if (!src) { Serial.printf("❌ Open src failed: %s\n", name); return false; }
    size_t srcSize = src.size();

    File dst = SD.open(name, FILE_WRITE);
    if (!dst) {
      src.close();
      delay(MIGRATE_RETRY_DELAY_MS);
      continue;
    }

    // copy bytes
    while (src.available()) {
      int c = src.read();
      if (c < 0) break;
      dst.write((uint8_t)c);
    }
    dst.flush();
    dst.close();
    src.close();

#if VALIDATE_COPY_BY_SIZE
    File chk = SD.open(name, FILE_READ);
    size_t dstSize = chk ? chk.size() : 0;
    if (chk) chk.close();
    if (dstSize != srcSize) {
      Serial.printf("❌ Size mismatch for %s (src=%u dst=%u)\n",
                    name, (unsigned)srcSize, (unsigned)dstSize);
      delay(MIGRATE_RETRY_DELAY_MS);
      continue;  // retry copy
    }
#endif
    return true; // success
  }
  return false;  // exhausted retries
}

void migrate_spiffs_to_sd() {
  if (!sd_available) return;

  // gather file list + timestamps
  std::vector<FileInfo> files;
  File root = SPIFFS.open("/");
  File entry;
  while ((entry = root.openNextFile())) {
    files.push_back({ entry.name(), entry.getLastWrite() });
    entry.close();
  }

  // oldest first
  std::sort(files.begin(), files.end(),
            [](const FileInfo &a, const FileInfo &b){ return a.ts < b.ts; });

  // migrate until only KEEP_FILES_COUNT remain
  while (files.size() > KEEP_FILES_COUNT) {
    String name = files.front().name;  // keep a copy (vector element will be erased)
    bool ok = copy_with_retry_and_validate(name.c_str());
    if (ok) {
      SPIFFS.remove(name);
      Serial.printf("📦 Migrated %s to SD\n", name.c_str());
    } else {
      // Skip this file and continue with the next (do NOT break the loop)
      Serial.printf("⚠️ Skipping %s after retries\n", name.c_str());
    }
    files.erase(files.begin());
  }
}

void storage_update() {
  // if SD is down, try remounting with retries
  if (!sd_available && try_sd_begin()) {
    sd_available = true;
    Serial.println("🔄 SD re-mounted");
  }
}