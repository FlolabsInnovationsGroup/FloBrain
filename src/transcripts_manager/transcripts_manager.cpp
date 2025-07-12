# transcripts_manager.cpp
tm_cpp = """\
// transcripts_manager.cpp
// Implementation of TranscriptsManager using SPIFFS and ArduinoJson

#include "transcripts_manager.h"
#include <SPIFFS.h>
#include <ArduinoJson.h>
#include "utils/logger.h"

namespace TranscriptsManager {

static const char* LOG_FILE = "/spiffs/transcripts.log";

bool init() {
    if (!SPIFFS.begin(true)) {
        logger::error("TranscriptsManager: SPIFFS mount failed");
        return false;
    }
    logger::info("TranscriptsManager: SPIFFS mounted");
    return true;
}

bool saveTranscription(uint32_t timestamp, const String &text, const std::vector<String> &keywords) {
    File file = SPIFFS.open(LOG_FILE, FILE_APPEND);
    if (!file) {
        logger::error("TranscriptsManager: Failed to open log file");
        return false;
    }
    DynamicJsonDocument doc(512);
    doc["timestamp"] = timestamp;
    doc["text"] = text;
    JsonArray arr = doc.createNestedArray("keywords");
    for (auto &kw : keywords) {
        arr.add(kw);
    }
    serializeJson(doc, file);
    file.println();
    file.close();
    logger::info("TranscriptsManager: Saved transcription");
    return true;
}

bool loadAll(std::vector<TranscriptEntry> &outList) {
    if (!SPIFFS.exists(LOG_FILE)) {
        logger::warn("TranscriptsManager: No transcript log found");
        return true;
    }
    File file = SPIFFS.open(LOG_FILE, FILE_READ);
    if (!file) {
        logger::error("TranscriptsManager: Failed to open log file");
        return false;
    }
    outList.clear();
    while (file.available()) {
        DynamicJsonDocument doc(512);
        DeserializationError err = deserializeJson(doc, file);
        if (err) {
            logger::warn("TranscriptsManager: JSON parse error");
            file.readStringUntil('\\n');
            continue;
        }
        TranscriptEntry entry;
        entry.timestamp = doc["timestamp"] | 0;
        entry.text = doc["text"] | "";
        JsonArray arr = doc["keywords"].as<JsonArray>();
        for (auto v : arr) {
            entry.keywords.push_back(v.as<String>());
        }
        outList.push_back(entry);
    }
    file.close();
    logger::info("TranscriptsManager: Loaded " + String(outList.size()) + " entries");
    return true;
}

} // namespace TranscriptsManager
"""x    x`x