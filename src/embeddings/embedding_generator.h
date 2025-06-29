#ifndef EMBEDDING_GENERATOR_H
#define EMBEDDING_GENERATOR_H

#include <vector>
#include "audio/mfcc.h"
#include "embeddings/mobilenetv2.h"
#include "utils/types.h"

namespace EmbeddingGenerator {
    /** Initialize MFCC extractor and model */
    void init();

    /** Generate an embedding from raw audio samples */
    bool generate(const std::vector<int16_t> &audioSamples,
                  Embedding &outEmbedding,
                  EmbeddingMetadata &outMeta);
}

#endif // EMBEDDING_GENERATOR_H
