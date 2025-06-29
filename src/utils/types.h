#ifndef TYPES_H
#define TYPES_H

#include <array>
#include <string>

constexpr int EMBEDDING_DIM = EMBEDDING_DIM;  // from config.h

using Embedding = std::array<float, EMBEDDING_DIM>;

struct EmbeddingMetadata {
    uint32_t timestamp;
    std::string type;
    std::string label;
};

#endif // TYPES_H
