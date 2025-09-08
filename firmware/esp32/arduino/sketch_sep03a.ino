// unified_capture_store_upload.ino
//One Sketch that collects ,stores to SPIFFS/SD CARD ,can upload via HTTP

#include <Arduino.h>
#include <FS.h>
#include <SPIFFS.h>
#include <WiFi.h>//ESP32 WIFI
#include <HTTPClient.h>//Simple HTTP GET

// Build-time switch 
//1= run in sim mode i.e on fake data
//0= run in real mode when hardware is available
#define USE_SIM 1  

//  Wi-Fi (you will put yours) 
const char* WIFI_SSID = "MALTYMAX";
const char* WIFI_PASS = "70809991";

// Upload target (change to your backend when ready) 
const char* UPLOAD_URL = "http://httpbin.org/post";

//  Storage choice sd card is prefferred otherwise will use SPIIFFS i.e eps32 flash 
// Start on SPIFFS. If SD mounts (SPI), switch to SD and migrate SPIFFS -> SD.
#include <SD.h>        // SPI SD (simple and common on ESP32)
const int SD_CS = 5;   // adjust for your SPI SD module

FS* activeFS = &SPIFFS;
bool sdMounted = false;

//  Timing 
static unsigned long tAudio = 0;
static unsigned long tFrame = 0;
static unsigned long tMig   = 0;
static unsigned long tScan  = 0;

//Periods
const uint32_t AUDIO_PERIOD_MS   = 1000;   // every 1s
const uint32_t FRAME_PERIOD_MS   = 3000;   // every 3s
const uint32_t MIGRATE_PERIOD_MS = 10000;  // every 10s
const uint32_t SCAN_PERIOD_MS    = 5000;   // every 5s

//  I2S + Camera (only used when USE_SIM == 0) 
#if !USE_SIM
extern "C" { #include "driver/i2s.h" }
#include "esp_camera.h"

// I2S pins & audio config
#define I2S_PORT         I2S_NUM_0
const int I2S_BCLK_PIN  = 26;
const int I2S_LRCLK_PIN = 25;
const int I2S_DATA_PIN  = 22;
const int AUDIO_FS_HZ   = 16000;
const int AUDIO_BITS    = 32;
const int CHUNK_MS      = 250;
const size_t SAMPLES_PER_CHUNK = (AUDIO_FS_HZ * CHUNK_MS) / 1000; // 4000
static int32_t i2s_in[SAMPLES_PER_CHUNK];
static int16_t pcm16[SAMPLES_PER_CHUNK];

// AI Thinker ESP32-CAM pins (change if your board differs)
#define PWDN_GPIO_NUM    -1
#define RESET_GPIO_NUM   -1
#define XCLK_GPIO_NUM     0
#define SIOD_GPIO_NUM    26
#define SIOC_GPIO_NUM    27
#define Y9_GPIO_NUM      35
#define Y8_GPIO_NUM      34
#define Y7_GPIO_NUM      39
#define Y6_GPIO_NUM      36
#define Y5_GPIO_NUM      21
#define Y4_GPIO_NUM      19
#define Y3_GPIO_NUM      18
#define Y2_GPIO_NUM       5
#define VSYNC_GPIO_NUM   25
#define HREF_GPIO_NUM    23
#define PCLK_GPIO_NUM    22
#endif

//  Upload backoff 
uint32_t backoffMs = 2000;    // start 2s
const uint32_t BACKOFF_MAX_MS = 60000;
unsigned long nextTryAt = 0;

//  Counters 
static uint32_t audioIdx  = 0;
static uint32_t frameIdx  = 0;

//  Helpers 
static void ensureFolders(fs::FS &fs) {
  if (!fs.exists("/audio"))  fs.mkdir("/audio");
  if (!fs.exists("/frames")) fs.mkdir("/frames");
}

static bool writeBytes(fs::FS &fs, const char* path, const uint8_t* data, size_t len) {
  File f = fs.open(path, FILE_WRITE);
  if (!f) { Serial.printf("open fail: %s\n", path); return false; }
  size_t w = f.write(data, len);
  f.close();
  Serial.printf("%s %s (%u bytes)\n", (w == len) ? "write ok:" : "write partial:", path, (unsigned)w);
  return (w == len);
}

static void copyFile(fs::FS &src, const char* srcPath, fs::FS &dst, const char* dstPath) {
  File in = src.open(srcPath, FILE_READ);
  if (!in) { Serial.printf("copy: open src fail %s\n", srcPath); return; }
  File out = dst.open(dstPath, FILE_WRITE);
  if (!out) { Serial.printf("copy: open dst fail %s\n", dstPath); in.close(); return; }
  uint8_t buf[2048];
  size_t total = 0;
  while (true) {
    size_t r = in.read(buf, sizeof(buf));
    if (!r) break;
    out.write(buf, r);
    total += r;
  }
  in.close(); out.close();
  src.remove(srcPath);
  Serial.printf("migrate ok %s -> %s (%u bytes)\n", srcPath, dstPath, (unsigned)total);
}

static void migrateSpiffsToSd() {
  if (!sdMounted) { Serial.println("SD not mounted; skip migration"); return; }
  File root = SPIFFS.open("/");
  if (!root) { Serial.println("SPIFFS root open fail"); return; }
  for (File f = root.openNextFile(); f; f = root.openNextFile()) {
    String src = String("/") + f.name();
    f.close();
    String dst = src; // same relative path
    copyFile(SPIFFS, src.c_str(), *activeFS, dst.c_str());
  }
}

//  Fake data (camera and audio data)(sim mode) 
#if USE_SIM
static void makeFakeAudio(int16_t* dst, size_t n) {
  static int16_t v = 0;
  for (size_t i = 0; i < n; ++i) { dst[i] = v; v += 300; }
}
static void makeFakeJpeg(uint8_t* buf, size_t n) {
  const char hdr[] = "FAKEJPEG";
  size_t h = min(n, sizeof(hdr));
  memcpy(buf, hdr, h);
  for (size_t i = h; i < n; ++i) buf[i] = (uint8_t)random(0, 255);
}
#endif

//  I2S init & capture (real mode) hardware avaiable
#if !USE_SIM
 #include <SD.h>
 const int SD_CS = 5;// Adjust for your spi model
#endif
static bool i2sInit() {
  i2s_config_t cfg = {};
  cfg.mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX);
  cfg
