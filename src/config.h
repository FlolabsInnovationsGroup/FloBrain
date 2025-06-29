#ifndef CONFIG_H
#define CONFIG_H

#include <stdint.h>

// Serial Logging
#define CONFIG_SERIAL_BAUDRATE 115200

// Main Loop
#define CONFIG_MAIN_LOOP_DELAY_MS 10

// Audio Recorder Settings
#define AUDIO_I2S_SAMPLE_RATE 16000
#define AUDIO_I2S_BITS_PER_SAMPLE 16
#define AUDIO_I2S_CHANNEL_FORMAT I2S_CHANNEL_FMT_ONLY_LEFT
#define AUDIO_I2S_BUFFER_SIZE 1024

// MFCC Feature Extraction
#define MFCC_NUM_COEFFICIENTS 13
#define MFCC_FRAME_LENGTH_MS 25
#define MFCC_FRAME_STEP_MS 10

// Embedding Model
#define EMBEDDING_DIM 128

// Vector Database Settings
#define VDB_MAX_ENTRIES 100
#define VDB_K_NEIGHBORS 3

// Sensor Pins
#define PIN_PRESSURE_SENSOR 34
#define PIN_TOUCH_SENSOR 27

// Indicator LEDs or Buttons
#define PIN_LED_STATUS 2
#define PIN_BUTTON_RECORD 0

// Storage
#define CONFIG_STORAGE_FILENAME "/spiffs/vectors.bin"

#endif // CONFIG_H
