#include "embeddings/embedding_generator.h"
#include "config.h"
#include "utils/logger.h"

namespace EmbeddingGenerator {

void init() {
    MFCC::init();
    Mobilenet::init();
    logger::info("EmbeddingGenerator initialized");
}

bool generate(const std::vector<int16_t> &audioSamples,
              Embedding &outEmbedding,
              EmbeddingMetadata &outMeta) {
    std::vector<float> mfccCoeffs;
    if (!MFCC::compute(audioSamples, mfccCoeffs)) {
        logger::error("MFCC failed");
        return false;
    }

    std::vector<float> modelOutput;
    if (!Mobilenet::infer(mfccCoeffs, modelOutput)) {
        logger::error("Model inference failed");
        return false;
    }

    for (int i=0; i<EMBEDDING_DIM; ++i) {
        outEmbedding[i] = modelOutput[i];
    }
    outMeta.timestamp = millis();
    outMeta.type = "audio";
    outMeta.label = "audio_embedding";
    return true;
}

} // namespace EmbeddingGenerator
