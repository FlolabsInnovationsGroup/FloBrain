# transcription_service.cpp
ts_cpp = """\
// transcription_service.cpp
// HTTP client implementation for Whisper transcription

#include "transcription_service.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include "utils/logger.h"
#include <ArduinoJson.h>

static const char* HOST = "https://your-whisper-endpoint.com";
static const char* WIFI_SSID = nullptr;
static const char* WIFI_PASS = nullptr;

void TranscriptionService::init(const char *ssid, const char *pass) {
    WIFI_SSID = ssid;
    WIFI_PASS = pass;
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    logger::info("TranscriptionService: Connecting to Wi-Fi...");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
    }
    logger::info("TranscriptionService: Wi-Fi connected");
}

String TranscriptionService::transcribe(const uint8_t *data, size_t len) {
    if (WiFi.status() != WL_CONNECTED) {
        logger::error("TranscriptionService: Wi-Fi not connected");
        return "";
    }
    HTTPClient http;
    String url = String(HOST) + "/transcribe";
    http.begin(url);
    http.addHeader("Content-Type", "application/octet-stream");
    int code = http.POST(data, len);
    if (code != 200) {
        logger::error("TranscriptionService: HTTP error " + String(code));
        http.end();
        return "";
    }
    String resp = http.getString();
    http.end();
    // parse JSON {"text":"..."}
    DynamicJsonDocument doc(512);
    auto err = deserializeJson(doc, resp);
    if (err) {
        logger::error("TranscriptionService: JSON parse error");
        return "";
    }
    const char* txt = doc["text"];
    return String(txt);
}
"""