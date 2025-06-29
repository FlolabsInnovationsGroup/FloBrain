#ifndef APP_CONTROLLER_H
#define APP_CONTROLLER_H

#include <Arduino.h>
#include "utils/types.h"

class AppController {
public:
    /** Initialize hardware, modules, and subsystems */
    void init();

    /** Main loop iteration: capture, process, and store/query embeddings */
    void loop();

private:
    unsigned long lastProcessTimeMillis = 0;
    static const unsigned long PROCESS_INTERVAL_MS = 1000;

    /** Capture audio from mic and generate embedding vector */
    bool processAudio(Embedding &outEmbedding, EmbeddingMetadata &outMeta);

    /** Insert or query embedding in the vector store */
    void handleEmbedding(const Embedding &embedding, const EmbeddingMetadata &meta);
};

#endif // APP_CONTROLLER_H
