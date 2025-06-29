#include "app_controller.h"
#include "audio/audio_record.h"
#include "embeddings/embedding_generator.h"
#include "vectordb/vector_store.h"
#include "storage/file_manager.h"
#include "utils/logger.h"
#include <Arduino.h>

void AppController::init() {
    logger::info("Initializing AppController...");

    // Mount filesystem and load saved embeddings
    if (FileManager::init()) {
        std::vector<VectorStore::Entry> loaded;
        if (FileManager::loadEntries(loaded)) {
            auto &store = VectorStore::getInstance();
            store.init();
            for (auto &e : loaded) {
                store.add(e.embedding, e.meta);
            }
            logger::info("Loaded previous embeddings into VectorStore");
        } else {
            logger::warn("No previous embeddings loaded");
            VectorStore::getInstance().init();
        }
    } else {
        logger::error("FileManager init failed; running in-memory only");
        VectorStore::getInstance().init();
    }

    // Initialize live submodules
    AudioRecorder::init();
    EmbeddingGenerator::init();

    pinMode(PIN_LED_STATUS, OUTPUT);
}

void AppController::loop() {
    unsigned long now = millis();
    if (now - lastProcessTimeMillis < PROCESS_INTERVAL_MS) return;
    lastProcessTimeMillis = now;

    Embedding embedding;
    EmbeddingMetadata meta;
    if (processAudio(embedding, meta)) {
        handleEmbedding(embedding, meta);
    } else {
        logger::warn("Audio processing failed or insufficient data");
    }
}

bool AppController::processAudio(Embedding &outEmbedding, EmbeddingMetadata &outMeta) {
    std::vector<int16_t> buffer;
    if (!AudioRecorder::record(buffer)) {
        return false;
    }
    if (!EmbeddingGenerator::generate(buffer, outEmbedding, outMeta)) {
        return false;
    }
    return true;
}

void AppController::handleEmbedding(const Embedding &embedding, const EmbeddingMetadata &meta) {
    auto &store = VectorStore::getInstance();
    store.add(embedding, meta);

    // Persist immediately
    FileManager::saveEntries(store.getEntries());

    // Perform nearest‐neighbor search
    auto results = store.search(embedding, VDB_K_NEIGHBORS);
    if (!results.empty()) {
        const auto &top = results[0];
        logger::info("Top match: " + top.meta.label + " (dist=" + String(top.distance) + ")");
        digitalWrite(PIN_LED_STATUS, HIGH);
        delay(50);
        digitalWrite(PIN_LED_STATUS, LOW);
    }
}
