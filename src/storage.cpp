#include "storage.h"
#include <SPI.h>         // 1) SPI bus control
#include <SD.h>          // 2) SD card over SPI
#include <SPIFFS.h>      // 3) Internal flash filesystem
#include <vector>        // 4) std::vector
#include <algorithm>     // 5) std::sort

// ─── SPI pin assignments ─────────────────────────────────────────────────────
#define SD_CS_PIN    5   // CS pin wired to SD module
#define SD_SCK_PIN  18   // SCLK
#define SD_MISO_PIN 19   // MISO
#define SD_MOSI_PIN 23   // MOSI

static bool sd_available = false;  


void storage_init() {
 
  SPI.begin(SD_SCK_PIN, SD_MISO_PIN, SD_MOSI_PIN, SD_CS_PIN);


  sd_available = SD.begin(SD_CS_PIN, SPI);
  if (sd_available) {
    Serial.println("✅ SD mounted over SPI");
  } else {
    Serial.println("⚠️ SD mount failed; using SPIFFS");
  }

  
  if (!SPIFFS.begin(true)) {
    Serial.println("❌ SPIFFS mount failed!");
  }
}


bool Storage_write(const char* path, const char* data) {
  File file;

 
  if (sd_available) {
    file = SD.open(path, FILE_WRITE);
    if (!file) {
      
      Serial.println("⚠️ SD write failed → falling back to SPIFFS");
      sd_available = false;
    }
  }

  
  if (!sd_available) {
    file = SPIFFS.open(path, FILE_WRITE);
    if (!file) {
      Serial.println("❌ SPIFFS write failed");
      return false;
    }
  }

  file.print(data);
  file.close();
  return true;
}


struct FileInfo {
  String name;
  time_t ts;
};

void migrate_spiffs_to_sd() {
  if (!sd_available) return;  // skip if no SD

  //  Gather filenames + timestamps
  std::vector<FileInfo> files;
  File root = SPIFFS.open("/");
  File entry;
  while ((entry = root.openNextFile())) {
    FileInfo fi;
    fi.name = entry.name();
    fi.ts   = entry.getLastWrite();
    files.push_back(fi);
    entry.close();
  }

  // Sort oldest-first (C++11 lambda with explicit types)
  std::sort(files.begin(), files.end(),
    [](const FileInfo &a, const FileInfo &b) {
      return a.ts < b.ts;
    }
  );

  // Migrate until only 5 files remain in SPIFFS
  const size_t KEEP = 5;
  while (files.size() > KEEP) {
    auto f = files.front();
    File src = SPIFFS.open(f.name, FILE_READ);
    File dst = SD.open(f.name, FILE_WRITE);
    if (src && dst) {
      while (src.available()) dst.write(src.read());
      src.close(); dst.close();
      SPIFFS.remove(f.name);
      Serial.printf("📦 Migrated %s to SD\n", f.name.c_str());
    } else {
      Serial.printf("❌ Migration of %s failed\n", f.name.c_str());
      break;
    }
    files.erase(files.begin());
  }
}

// hot-plug detection & SD re-mount ────────────────────────────────
void storage_update() {
  if (!sd_available) {
    // try remounting SD
    if (SD.begin(SD_CS_PIN, SPI)) {
      sd_available = true;
      Serial.println("🔄 SD re-mounted");
    }
  }
}