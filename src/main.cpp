
// SD Module Pin	ESP32 Pin
// CS	GPIO 5
// MOSI	GPIO 23
// MISO	GPIO 19
// SCK	GPIO 18
// VCC (3.3V)	3.3 V
// GND	GND
#include <Arduino.h>
#include "storage.h"

unsigned long lastMigrate = 0;
const unsigned long MIGRATE_INTERVAL = 60UL * 60UL * 1000UL;  // 1 hour

void setup() {
  Serial.begin(115200);        // start debug console
  storage_init();              // Box 1

  // Box 2 & 3: initial write test
  if (Storage_write("/hello.txt", "Hello from SPI-SD/SPIFFS!\n")) {
    Serial.println("✅ Initial write succeeded");
  }
}

void loop() {
  storage_update();            // Box 5: hot-plug handling

  // Box 4: migrate SPIFFS → SD every hour
  if (millis() - lastMigrate > MIGRATE_INTERVAL) {
    migrate_spiffs_to_sd();
    lastMigrate = millis();
  }

  // example periodic log
  Storage_write("/ping.log", "Ping\n");
  delay(5000);
}