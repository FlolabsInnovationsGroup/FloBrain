#include <Arduino.h>
#include <SPIFFS.h>
#include <ArduinoJson.h>

static const char* TRANSCRIPTS_PATH = "/transcripts.json";

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("[CaipoTranscription] Starting…");

  // mount (format if missing)
  if (!SPIFFS.begin(true)) {
    Serial.println("[ERROR] SPIFFS mount failed");
    while (true) delay(100);
  }

  // if file missing, create stub
  if (!SPIFFS.exists(TRANSCRIPTS_PATH)) {
    File f = SPIFFS.open(TRANSCRIPTS_PATH, FILE_WRITE);
    f.print("[]");
    f.close();
    Serial.println("[INFO] Initialized empty transcript store");
  }

  Serial.println("[INFO] Press 's' to save, 'p' to print.");
}

void loop() {
  if (!Serial.available()) return;
  char c = Serial.read();
  if (c == 's') saveDemo();
  if (c == 'p') printTranscripts();
}

void saveDemo() {
  // read + parse
  File fr = SPIFFS.open(TRANSCRIPTS_PATH, FILE_READ);
  DynamicJsonDocument doc(2048);
  auto err = deserializeJson(doc, fr);
  fr.close();
  if (err) {
    Serial.println("[ERROR] JSON parse failed");
    return;
  }

  JsonArray arr = doc.as<JsonArray>();
  // append an entry
  JsonObject o = arr.createNestedObject();
  o["ts"]   = millis();
  o["text"] = "Demo transcription";

  // write back
  File fw = SPIFFS.open(TRANSCRIPTS_PATH, FILE_WRITE);
  serializeJson(arr, fw);
  fw.close();
  Serial.println("[INFO] Saved demo entry");
}

void printTranscripts() {
  File f = SPIFFS.open(TRANSCRIPTS_PATH, FILE_READ);
  DynamicJsonDocument doc(4096);
  auto err = deserializeJson(doc, f);
  f.close();
  if (err) {
    Serial.println("[ERROR] JSON parse failed");
    return;
  }

  JsonArray arr = doc.as<JsonArray>();
  if (arr.size() == 0) {
    Serial.println("[INFO] No transcripts");
    return;
  }

  for (JsonObject e : arr) {
    Serial.print(e["ts"].as<unsigned long>());
    Serial.print(": ");
    Serial.println(e["text"].as<const char*>());
  }
}
