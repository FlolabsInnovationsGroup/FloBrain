#include "vectordb/vector_store.h"
#include "vectordb/vector_utils.h"
#include "utils/logger.h"
#include <algorithm>

VectorStore& VectorStore::getInstance() {
    static VectorStore instance;
    return instance;
}

void VectorStore::init() {
    entries.clear();
    entries.reserve(VDB_MAX_ENTRIES);
    logger::info("VectorStore initialized, capacity=" + String(VDB_MAX_ENTRIES));
}

bool VectorStore::add(const Embedding &embedding, const EmbeddingMetadata &meta) {
    if (entries.size() < VDB_MAX_ENTRIES) {
        entries.push_back({embedding, meta});
    } else {
        entries.erase(entries.begin());
        entries.push_back({embedding, meta});
    }
    return true;
}

std::vector<SearchResult> VectorStore::search(const Embedding &query, int k) const {
    std::vector<SearchResult> results;
    results.reserve(entries.size());

    std::vector<float> normQ(EMBEDDING_DIM);
    memcpy(normQ.data(), query.data(), EMBEDDING_DIM*sizeof(float));
    VectorUtils::normalize(normQ.data(), EMBEDDING_DIM);

    for (auto &e : entries) {
        std::vector<float> normE(EMBEDDING_DIM);
        memcpy(normE.data(), e.embedding.data(), EMBEDDING_DIM*sizeof(float));
        VectorUtils::normalize(normE.data(), EMBEDDING_DIM);

        float sim  = VectorUtils::cosineSimilarity(normQ.data(), normE.data(), EMBEDDING_DIM);
        float dist = 1.0f - sim;
        results.push_back({e.meta, dist});
    }

    std::sort(results.begin(), results.end(),
              [](auto &a, auto &b){ return a.distance < b.distance; });
    if (results.size() > (size_t)k) results.resize(k);
    return results;
}

const std::vector<VectorStore::Entry>& VectorStore::getEntries() const {
    return entries;
}
