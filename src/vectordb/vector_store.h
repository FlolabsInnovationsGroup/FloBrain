#ifndef VECTOR_STORE_H
#define VECTOR_STORE_H

#include <vector>
#include "utils/types.h"
#include "config.h"

struct SearchResult {
    EmbeddingMetadata meta;
    float distance;
};

class VectorStore {
public:
    static VectorStore& getInstance();
    void init();
    bool add(const Embedding &embedding, const EmbeddingMetadata &meta);
    std::vector<SearchResult> search(const Embedding &query, int k) const;
    const std::vector<Entry>& getEntries() const;

    struct Entry {
        Embedding embedding;
        EmbeddingMetadata meta;
    };

private:
    VectorStore() = default;
    std::vector<Entry> entries;
};

#endif // VECTOR_STORE_H
