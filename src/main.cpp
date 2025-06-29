#include <Arduino.h>
#include "app_controller.h"
#include "config.h"
#include "utils/logger.h"

// Global controller instance
static AppController controller;

void setup() {
    // Initialize serial logging
    Serial.begin(CONFIG_SERIAL_BAUDRATE);
    while (!Serial) { /* wait for serial port */ }
    logger::init();
    logger::info("Starting CAIPO ESP32 Project...");

    // Initialize the application controller
    controller.init();
}

void loop() {
    // Run one iteration of the application logic
    controller.loop();

    // Small delay to yield to other tasks and avoid watchdog reset
    delay(CONFIG_MAIN_LOOP_DELAY_MS);
}
