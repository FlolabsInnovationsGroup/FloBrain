#include <FastLED.h>
#include "esp_camera.h"

// WS2812B LED configuration
#define LED_PIN     D0
#define NUM_LEDS    1
#define LED_TYPE    WS2812B
#define COLOR_ORDER GRB

CRGB leds[NUM_LEDS];

// XIAO ESP32-S3 Sense integrated camera pin definitions
#define CAMERA_MODEL_XIAO_ESP32S3
#define PWDN_GPIO_NUM     -1
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM     10
#define SIOD_GPIO_NUM     40
#define SIOC_GPIO_NUM     39
#define Y9_GPIO_NUM       48
#define Y8_GPIO_NUM       11
#define Y7_GPIO_NUM       12
#define Y6_GPIO_NUM       14
#define Y5_GPIO_NUM       16
#define Y4_GPIO_NUM       18
#define Y3_GPIO_NUM       17
#define Y2_GPIO_NUM       15
#define VSYNC_GPIO_NUM    38
#define HREF_GPIO_NUM     47
#define PCLK_GPIO_NUM     13

int photoCount = 0;

void setup() {
  Serial.begin(115200);
  Serial.println();
  Serial.println("=== XIAO ESP32-S3 Sense with WS2812B LED ===");
  Serial.println("Using integrated OV2640 camera sensor");
  
  // Initialize FastLED
  FastLED.addLeds<LED_TYPE, LED_PIN, COLOR_ORDER>(leds, NUM_LEDS);
  FastLED.setBrightness(80); // Moderate brightness
  
  // Initialize the integrated camera
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  
  // Configure camera settings for XIAO ESP32-S3 Sense
  if(psramFound()){
    config.frame_size = FRAMESIZE_UXGA; // 1600x1200
    config.jpeg_quality = 10;
    config.fb_count = 2;
    config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;
  } else {
    config.frame_size = FRAMESIZE_SVGA; // 800x600
    config.jpeg_quality = 12;
    config.fb_count = 1;
    config.grab_mode = CAMERA_GRAB_LATEST;
  }
  
  // Initialize camera
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("❌ Camera init failed with error 0x%x\n", err);
    // Continue without camera functionality
  } else {
    Serial.println("✅ Integrated OV2640 camera initialized successfully!");
    
    // Get camera sensor and apply optimizations
    sensor_t * s = esp_camera_sensor_get();
    if (s != NULL) {
      // Optimize settings for better image quality
      s->set_brightness(s, 0);     // -2 to 2
      s->set_contrast(s, 0);       // -2 to 2
      s->set_saturation(s, 0);     // -2 to 2
      s->set_special_effect(s, 0); // 0 to 6 (0-No Effect, 1-Negative, 2-Grayscale...)
      s->set_whitebal(s, 1);       // 0 = disable , 1 = enable
      s->set_awb_gain(s, 1);       // 0 = disable , 1 = enable
      s->set_wb_mode(s, 0);        // 0 to 4 - if awb_gain enabled (0 - Auto, 1 - Sunny, 2 - Cloudy...)
      s->set_exposure_ctrl(s, 1);  // 0 = disable , 1 = enable
      s->set_aec2(s, 0);           // 0 = disable , 1 = enable
      s->set_ae_level(s, 0);       // -2 to 2
      s->set_aec_value(s, 300);    // 0 to 1200
      s->set_gain_ctrl(s, 1);      // 0 = disable , 1 = enable
      s->set_agc_gain(s, 0);       // 0 to 30
      s->set_gainceiling(s, (gainceiling_t)0);  // 0 to 6
      s->set_bpc(s, 0);            // 0 = disable , 1 = enable
      s->set_wpc(s, 1);            // 0 = disable , 1 = enable
      s->set_raw_gma(s, 1);        // 0 = disable , 1 = enable
      s->set_lenc(s, 1);           // 0 = disable , 1 = enable
      s->set_hmirror(s, 0);        // 0 = disable , 1 = enable
      s->set_vflip(s, 0);          // 0 = disable , 1 = enable
      s->set_dcw(s, 1);            // 0 = disable , 1 = enable
      Serial.println("📷 Camera sensor optimized for XIAO ESP32-S3 Sense");
    }
  }
  
  Serial.println("💡 WS2812B LED initialized!");
  Serial.println("🚀 System ready - Starting photo sequence...");
  Serial.println();
}

void loop() {
  // Photo sequence with LED status indication
  takePhotoWithLED("Red", CRGB::Red);
  delay(1500);
  
  takePhotoWithLED("Green", CRGB::Green);
  delay(1500);
  
  takePhotoWithLED("Blue", CRGB::Blue);
  delay(1500);
  
  takePhotoWithLED("Yellow", CRGB::Yellow);
  delay(1500);
  
  takePhotoWithLED("Purple", CRGB::Purple);
  delay(1500);
  
  takePhotoWithLED("Cyan", CRGB::Cyan);
  delay(1500);
  
  takePhotoWithLED("White", CRGB::White);
  delay(1500);
  
  // Processing indication
  Serial.println("📊 Processing captured images...");
  blinkLED(CRGB::Orange, 3);
  
  // Turn off LED
  Serial.println("💤 Sequence complete - LED off");
  leds[0] = CRGB::Black;
  FastLED.show();
  delay(2000);
  
  Serial.println("=== Starting new cycle ===");
  Serial.println();
}

void takePhotoWithLED(const char* colorName, CRGB color) {
  Serial.printf("📸 %s LED - Capturing photo...\n", colorName);
  
  // Set LED color
  leds[0] = color;
  FastLED.show();
  
  // Take photo with integrated camera
  camera_fb_t * fb = esp_camera_fb_get();
  if(fb) {
    photoCount++;
    Serial.printf("✅ Photo #%d captured successfully!\n", photoCount);
    Serial.printf("   📏 Resolution: %dx%d pixels\n", fb->width, fb->height);
    Serial.printf("   💾 File size: %u bytes (%.1f KB)\n", fb->len, fb->len / 1024.0);
    Serial.printf("   🎨 Format: JPEG\n");
    
    // Return the frame buffer back to the driver for reuse
    esp_camera_fb_return(fb);
    
    // Success blink
    delay(200);
    leds[0] = CRGB::Black;
    FastLED.show();
    delay(100);
    leds[0] = color;
    FastLED.show();
    
  } else {
    Serial.printf("❌ Failed to capture photo with %s LED\n", colorName);
    // Error indication - quick red blink
    leds[0] = CRGB::Red;
    FastLED.show();
    delay(100);
    leds[0] = CRGB::Black;
    FastLED.show();
    delay(100);
    leds[0] = color;
    FastLED.show();
  }
  Serial.println();
}

void blinkLED(CRGB color, int times) {
  for(int i = 0; i < times; i++) {
    leds[0] = color;
    FastLED.show();
    delay(300);
    leds[0] = CRGB::Black;
    FastLED.show();
    delay(300);
  }
}