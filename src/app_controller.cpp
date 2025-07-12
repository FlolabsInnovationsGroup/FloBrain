// app_controller.cpp
#include "app_controller.h"
#include "audio/audio_record.h"
#include "embeddings/embedding_generator.h"
#include "vectordb/vector_store.h"
#include "storage/file_manager.h"
#include "transcripts_manager/transcripts_manager.h"
#include "transcription_service/transcription_service.h"
#include "keyword_extractor/keyword_extractor.h"
#include "utils/logger.h"
#include <Arduino.h>

void AppController::init() {
    logger::info("Initializing AppController...");

    // Init Wi-Fi & transcription service
    TranscriptionService::init("YOUR_SSID", "YOUR_PASS");

    // Mount transcripts log FS
    if (!TranscriptsManager::init()) {
        logger::error("Failed to init TranscriptsManager");
    } else {
        std::vector<TranscriptEntry> history;
        if (TranscriptsManager::loadAll(history)) {
            logger::info("Loaded past transcripts: " + String(history.size()));
            for (auto &e : history) {
                logger::info("[" + String(e.timestamp) + "] " + e.text);
            }
        }
    }

    // Load saved embeddings
    if (FileManager::init()) {
        std::vector<VectorStore::Entry> loaded;
        if (FileManager::loadEntries(loaded)) {
            auto &store = VectorStore::getInstance();
            store.init();
            for (auto &e : loaded) {
                store.add(e.embedding, e.meta);
            }
            logger::info("Loaded previous embeddings");
        } else {
            VectorStore::getInstance().init();
        }
    } else {
        VectorStore::getInstance().init();
    }

    AudioRecorder::init();
    EmbeddingGenerator::init();
    pinMode(PIN_LED_STATUS, OUTPUT);
}

bool AppController::hasNewTranscription() {
    return !latestTranscription.isEmpty();
}

String AppController::getLatestTranscription() {
    String t = latestTranscription;
    latestTranscription = "";
    return t;
}

void AppController::handleTranscriptionResult(
    const String &text,
    const std::vector<String> &keywords
) {
    uint32_t ts = millis();
    TranscriptsManager::saveTranscription(ts, text, keywords);
    logger::info("Saved transcription [" + String(ts) + "]: " + text);
}

void AppController::loop() {
    // 1) Check for fresh audio buffer
    if (AudioRecorder::hasNewBuffer()) {
        auto buf = AudioRecorder::getBuffer();
        size_t len = buf.size() * sizeof(buf[0]);

        // 2) Transcribe via Whisper (or echo stub)
        String text = TranscriptionService::transcribe(buf.data(), len);
        logger::info("TranscriptionService response: " + text);

        // 3) Extract keywords
        auto keywords = KeywordExtractor::extract(text);
        logger::info("Extracted " + String(keywords.size()) + " keywords");

        // 4) Save result
        handleTranscriptionResult(text, keywords);
    }
}

// Write files to disk
with open(os.path.join(tm_dir, "transcripts_manager.h"), "w") as f:
    f.write(tm_h)
with open(os.path.join(tm_dir, "transcripts_manager.cpp"), "w") as f:
    f.write(tm_cpp)

with open(os.path.join(src_dir, "app_controller.cpp"), "w") as f:
    f.write(app_controller)

//Display the directory tree and files for user

import ace_tools as tools
files_list = [
    "src/transcripts_manager/transcripts_manager.h",
    "src/transcripts_manager/transcripts_manager.cpp",
    "src/app_controller.cpp"
]
tools.display_dataframe_to_user(name="Updated Code Files", dataframe=pd.DataFrame(files_list, columns=["file"]))