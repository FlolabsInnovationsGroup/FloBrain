#ifndef STORAGE_CONFIG_H
#define STORAGE_CONFIG_H

// ── Build profile example ─────────────────────────────────────────────
// Enable DEV build (KEEP=10, faster migration interval) via:
// platformio.ini → build_flags = -D DEV_BUILD
#ifdef DEV_BUILD
  #define KEEP_FILES_COUNT      10
  #define MIGRATE_INTERVAL_MS   (10UL * 60UL * 1000UL)  // 10 min
#else
  #define KEEP_FILES_COUNT       5
  #define MIGRATE_INTERVAL_MS   (60UL * 60UL * 1000UL)  // 1 hour
#endif

// SPI pins for SD card interface
#define SD_CS_PIN               5
#define SD_SCK_PIN             18
#define SD_MISO_PIN            19
#define SD_MOSI_PIN            23

// SD.begin() retry/backoff
#define SD_RETRY_COUNT          3
#define SD_RETRY_DELAY_MS     100  // base backoff (ms)

// Migration copy retries
#define MIGRATE_RETRY_COUNT     2
#define MIGRATE_RETRY_DELAY_MS 50  // between attempts (ms)

// Copy validation toggle (cheap & reliable): compare sizes
#define VALIDATE_COPY_BY_SIZE   1

#endif // STORAGE_CONFIG_H