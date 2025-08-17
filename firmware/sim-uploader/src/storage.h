#pragma once
#include <Arduino.h>
#include <FS.h>
#include <SPIFFS.h>
#include <SD.h>
#include "config.h"

namespace Storage {

inline bool begin() {
  bool ok1 = SPIFFS.begin(true);
  // SD may not be present — don’t fail if missing. Try default CS pins.
  bool ok2 = SD.begin();  // change to SD.begin(SS_PIN) if needed
  // Make queue folders if SD mounted:
  if (ok2) {
    if (!SD.exists(SD_QUEUE_DIR)) SD.mkdir(SD_QUEUE_DIR);
    if (!SD.exists(SD_FAILED_DIR)) SD.mkdir(SD_FAILED_DIR);
  }
  return ok1; // SPIFFS is required for primary writes
}

inline size_t freeBytesFS(fs::FS &fs, const char* path){
  // crude estimate: iterate and sum filesize; subtract from total capacity if known
  // SPIFFS: totalBytes()/usedBytes(); SD has no easy total, so return 0 to avoid lying.
  if (&fs == &SPIFFS) {
    return SPIFFS.totalBytes() - SPIFFS.usedBytes();
  }
  return 0; // not easily available for SD here
}

inline size_t spiffs_free() { return freeBytesFS(SPIFFS, "/"); }

// Move file from SPIFFS to SD queue (used by migration/offline queue)
inline bool migrateToSDQueue(const char* spiffsPath){
  if (!SD.begin()) return false;
  File src = SPIFFS.open(spiffsPath, FILE_READ);
  if (!src) return false;
  String fname = String(SD_QUEUE_DIR) + "/" + String(strrchr(spiffsPath, '/')+1);
  File dst = SD.open(fname, FILE_WRITE);
  if (!dst) { src.close(); return false; }
  uint8_t buf[1024];
  while (true){
    int n = src.read(buf, sizeof(buf));
    if (n <= 0) break;
    dst.write(buf, n);
  }
  src.close(); dst.close();
  SPIFFS.remove(spiffsPath);
  return true;
}

inline bool writeSmall(const char* path, const uint8_t* data, size_t n){  // SPIFFS small writes
  File f = SPIFFS.open(path, FILE_WRITE);
  if (!f) return false;
  size_t w = f.write(data, n);
  f.close();
  return w == n;
}

}