#include <Arduino.h>
#include <FS.h>
#include <SPIFFS.h>//internal flash of esp32

// decidw which SD mode to use pick one only
//1 means you are using external flash
//0 means you are using esp32 
#define USE_SD_SPI   1    // 1 = external SD module over SPI 
#define USE_SD_MMC   0    // 1 = onboard SD slot (ESP32-CAM)

#if USE_SD_SPI
  #include <SD.h>
  const int SD_CS = 5;    // you cn change if your SD module uses a different CS pin,Cs is chip select basically
#endif
#if USE_SD_MMC
  #include <SD_MMC.h>
#endif
#include "esp_camera.h"

// AI Thinker ESP32-CAM pin map ,will differ base on boards
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

// I2S mic uses the driver (SPH series)
extern "C" {
  #include "driver/i2s.h"
}
#define I2S_PORT         I2S_NUM_0
//pins match with yur microphone wiring
const int I2S_BCLK_PIN  = 26;   // BCLK
const int I2S_LRCLK_PIN = 25;   // LRCLK
const int I2S_DATA_PIN  = 22;   // DATA from mic

// Audio config 
//read 32 bit and convert to 16 bit
const int AUDIO_FS_HZ   = 16000;
const int AUDIO_BITS    = 32;
const int CHUNK_MS      = 250;

//size based on sample rate and chunk length
const size_t SAMPLES_PER_CHUNK = (AUDIO_FS_HZ * CHUNK_MS) / 1000; // 4000
static int32_t i2s_in[SAMPLES_PER_CHUNK];   // ~16 KB
static int16_t pcm16[SAMPLES_PER_CHUNK];    // ~8 KB

// Timing: timers and counters for simple periodic work
static unsigned long tAudio = 0;
static unsigned long tFrame = 0;
static unsigned long tMig   = 0;
static uint32_t audioIdx    = 0;

// Active filesystem is esp32 flash that is SPIFFS and sd card is not avaiable here
FS* activeFS = &SPIFFS;
bool sdMounted = false;

// Create folders if they do not exist
static void ensureFolders(fs::FS &fs) {
  if (!fs.exists("/audio"))  fs.mkdir("/audio");
  if (!fs.exists("/frames")) fs.mkdir("/frames");
}

//write file system and print 
static bool writeBytes(fs::FS &fs, const char* path, const uint8_t* data, size_t len) {
  File f = fs.open(path, FILE_WRITE);
  if (!f) { Serial.printf("open fail: %s\n", path); return false; }
  size_t w = f.write(data, len);
  f.close();
  Serial.printf("%s %s (%u bytes)\n", (w == len) ? "write ok:" : "write partial:", path, (unsigned)w);
  return (w == len);
}

//Copy one file and remove space
static void copyFile(fs::FS &src, const char* srcPath, fs::FS &dst, const char* dstPath) {
  File in = src.open(srcPath, FILE_READ);
  if (!in) return;
  File out = dst.open(dstPath, FILE_WRITE);
  if (!out) { in.close(); return; }
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

//move all files to sd card when mounted
static void migrateSpiffsToSd() {
  if (!sdMounted) return;
  File root = SPIFFS.open("/");
  if (!root) return;
  for (File f = root.openNextFile(); f; f = root.openNextFile()) {
    String src = String("/") + f.name();
    f.close();
    String dst = src;
#if USE_SD_SPI
    copyFile(SPIFFS, src.c_str(), SD, dst.c_str());
#elif USE_SD_MMC
    copyFile(SPIFFS, src.c_str(), SD_MMC, dst.c_str());
#endif
  }
}

// I2S init
static bool i2sInit() {
  i2s_config_t cfg = {};
  cfg.mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX);
  cfg.sample_rate = AUDIO_FS_HZ;
  cfg.bits_per_sample = (i2s_bits_per_sample_t)AUDIO_BITS;
  cfg.channel_format = I2S_CHANNEL_FMT_ONLY_RIGHT;
  cfg.communication_format = I2S_COMM_FORMAT_I2S;
  cfg.intr_alloc_flags = 0;
  cfg.dma_buf_count = 8;
  cfg.dma_buf_len   = 256;
  if (i2s_driver_install(I2S_PORT, &cfg, 0, NULL) != ESP_OK) {
    Serial.println("i2s_driver_install failed");
    return false;
  }
  i2s_pin_config_t pins = {};
  pins.bck_io_num   = I2S_BCLK_PIN;
  pins.ws_io_num    = I2S_LRCLK_PIN;
  pins.data_out_num = I2S_PIN_NO_CHANGE;
  pins.data_in_num  = I2S_DATA_PIN;
  if (i2s_set_pin(I2S_PORT, &pins) != ESP_OK) {
    Serial.println("i2s_set_pin failed");
    return false;
  }
  return true;
}

// Capture 0.25s of audio and write as RAW 16-bit PCM
static void captureAndWriteAudioChunk() {
  size_t bytesTarget = SAMPLES_PER_CHUNK * sizeof(int32_t); // 16 KB
  size_t bytesRead = 0;
  if (i2s_read(I2S_PORT, (void*)i2s_in, bytesTarget, &bytesRead, portMAX_DELAY) != ESP_OK || bytesRead == 0) {
    Serial.println("i2s_read fail");
    return;
  }
  size_t samples = bytesRead / sizeof(int32_t);
  for (size_t i = 0; i < samples; ++i) pcm16[i] = (int16_t)(i2s_in[i] >> 11);
  char path[64];
  snprintf(path, sizeof(path), "/audio/chunk_%06u.raw", audioIdx++);
  writeBytes(*activeFS, path, (uint8_t*)pcm16, samples * sizeof(int16_t));
}

// Camera
static bool cameraInitOnce() {
  static bool done = false;
  if (done) return true;
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer   = LEDC_TIMER_0;
  config.pin_d0       = Y2_GPIO_NUM;
  config.pin_d1       = Y3_GPIO_NUM;
  config.pin_d2       = Y4_GPIO_NUM;
  config.pin_d3       = Y5_GPIO_NUM;
  config.pin_d4       = Y6_GPIO_NUM;
  config.pin_d5       = Y7_GPIO_NUM;
  config.pin_d6       = Y8_GPIO_NUM;
  config.pin_d7       = Y9_GPIO_NUM;
  config.pin_xclk     = XCLK_GPIO_NUM;
  config.pin_pclk     = PCLK_GPIO_NUM;
  config.pin_vsync    = VSYNC_GPIO_NUM;
  config.pin_href     = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn     = PWDN_GPIO_NUM;
  config.pin_reset    = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size   = FRAMESIZE_QVGA;  // small to save RAM
  config.jpeg_quality = 12;
  config.fb_count     = 1;
  if (esp_camera_init(&config) != ESP_OK) {
    Serial.println("camera init failed");
    return false;
  }
  done = true;
  return true;
}

//Take one jpeg frame and save it
static void captureAndWriteJpeg() {
  if (!cameraInitOnce()) return;
  camera_fb_t* fb = esp_camera_fb_get();
  if (!fb) { Serial.println("camera fb null"); return; }
  char jpgPath[64];
  snprintf(jpgPath, sizeof(jpgPath), "/frames/frame_%06lu.jpg", millis()/1000);
  writeBytes(*activeFS, jpgPath, fb->buf, fb->len);
  esp_camera_fb_return(fb);
}

void setup() {
  Serial.begin(115200);

  SPIFFS.begin(true);
  ensureFolders(SPIFFS);

#if USE_SD_SPI
  if (SD.begin(SD_CS)) { sdMounted = true; activeFS = &SD; ensureFolders(SD); }
#elif USE_SD_MMC
  if (SD_MMC.begin("/sdcard", true)) { sdMounted = true; activeFS = &SD_MMC; ensureFolders(SD_MMC); }
#endif

  i2sInit();
}

// in this step do jpeg fram and audio chunk and often try migration
void loop() {
  unsigned long now = millis();

  if (now - tAudio >= (unsigned long)CHUNK_MS) {
    tAudio = now;
    captureAndWriteAudioChunk();
  }
  if (now - tFrame >= 3000UL) {
    tFrame = now;
    captureAndWriteJpeg();
  }
  if (now - tMig >= 10000UL) {
    tMig = now;
    migrateSpiffsToSd();
  }
}
