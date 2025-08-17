#include <Arduino.h>
#include <WiFi.h>
#include <FS.h>
#include <SPIFFS.h>
#include <SD.h>

#include "config.h"
#include "storage.h"
#include "uploader.h"
#include "telemetry.h"

Telemetry T;

static void wifi_connect() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.printf("WiFi: connecting to %s", WIFI_SSID);
  uint32_t t0 = millis();
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    if (millis() - t0 > 20000) break; // 20s
  }
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("WiFi: connected, IP=%s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("WiFi: NOT connected (will still queue to SD).");
  }
}

static void ensure_queue_dirs(){
  SD.begin();
  if (!SD.exists(SD_QUEUE_DIR)) SD.mkdir(SD_QUEUE_DIR);
  if (!SD.exists(SD_FAILED_DIR)) SD.mkdir(SD_FAILED_DIR);
}

// make a small ~64KB file in /sd/queue and write sidecar meta JSON
static void enqueue_fake_chunk() {
  SD.begin();
  uint32_t ts = millis();
  String fn = String(SD_QUEUE_DIR) + "/aud_" + String(ts) + ".wav";
  File f = SD.open(fn, FILE_WRITE);
  if (!f) { Serial.println("queue: cannot create file"); return; }
  const size_t N = 64*1024;
  static uint8_t buf[1024];
  memset(buf, 'A', sizeof(buf));
  for (size_t left=N; left>0; ){
    size_t n = min(left, sizeof(buf));
    uint32_t t0 = millis();
    size_t w = f.write(buf, n);
    uint32_t t1 = millis();
    T.record_latency_ms((double)(t1 - t0)); // measure a small write latency
    if (w != n) break;
    left -= n;
  }
  f.close();
  // sidecar meta
  String mpath = fn + ".meta.json";
  File m = SD.open(mpath, FILE_WRITE);
  if (m) { m.printf("{\"device_id\":\"esp32-sim\",\"ts\":%lu}", (unsigned long)ts); m.close(); }
  Serial.printf("queue: + %s\n", fn.c_str());
}

uint32_t last_enq = 0, last_worker = 0;

void setup() {
  Serial.begin(115200);
  delay(400);
  Serial.println("\n== CAIPO v0.1 sim: HTTP retry + telemetry ==");

  randomSeed((uint32_t)esp_timer_get_time());
  if (!Storage::begin()) {
    Serial.println("SPIFFS init failed (but SD queue may still work).");
  }
  ensure_queue_dirs();
  wifi_connect();

  // seed queue with a couple of files
  enqueue_fake_chunk();
  delay(100);
  enqueue_fake_chunk();
}

void loop() {
  // (A) every 5s, create another fake "audio chunk"
  if (millis() - last_enq > 5000) {
    enqueue_fake_chunk();
    last_enq = millis();
  }

  // (B) every 1-2s run uploader queue worker (retries inside)
  if (millis() - last_worker > 1200) {
    // when Wi-Fi is down, worker will queue & backoff quietly
    run_queue_worker(BACKEND_URL, 6, T);
    last_worker = millis();
  }

  // (C) print telemetry every 10s (p50/p95 + counters)
  T.print_every_10s(Storage::spiffs_free(), SD.cardSize());

  delay(100);
}