
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

void setup() {
  Serial.begin(115200);
  storage_init();

  if (Storage_write("/hello.txt", "Hello with improvements!\n")) {
    Serial.println("✅ Initial write succeeded");
  }
}

void loop() {
  storage_update();

  if (millis() - lastMigrate > MIGRATE_INTERVAL_MS) {
    migrate_spiffs_to_sd();
    lastMigrate = millis();
  }

  Storage_write("/ping.log", "Ping\n");
  delay(5000);
}