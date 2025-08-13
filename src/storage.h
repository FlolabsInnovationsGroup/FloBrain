#ifndef STORAGE_H
#define STORAGE_H

#include <Arduino.h>
#include "storage_config.h"

// Init SPI + SD (with retries) and mount SPIFFS
void storage_init();

// SD-first write; on failure, fall back to SPIFFS
bool Storage_write(const char* path, const char* data);

// Migrate oldest SPIFFS files to SD until only KEEP_FILES_COUNT remain
void migrate_spiffs_to_sd();

// Try to remount SD when re-inserted (hot-plug)
void storage_update();

#endif // STORAGE_H
