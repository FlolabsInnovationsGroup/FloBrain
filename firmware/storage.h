#ifndef STORAGE_H
#define STORAGE_H

#include <Arduino.h>

/**  
 * Box 1: Initialize SPI bus & mount SD; mount SPIFFS as fallback  
 */
void storage_init();

/**  
 * Box 2 & 3: Write `data` to `path` on SD if available, else SPIFFS.  
 *            On SD failure it falls back and logs a warning.  
 *  @return true on success, false on failure  
 */
bool Storage_write(const char* path, const char* data);

/**  
 * Box 4: Migrate oldest SPIFFS files over to SD  
 */
void migrate_spiffs_to_sd();

/**  
 * Box 5: Detect SD re-insertion and remount if needed  
 */
void storage_update();

#endif // STORAGE_H