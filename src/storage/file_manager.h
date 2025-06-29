#ifndef FILE_MANAGER_H
#define FILE_MANAGER_H

#include <vector>
#include "vectordb/vector_store.h"

namespace FileManager {
    bool init();
    bool saveEntries(const std::vector<VectorStore::Entry> &entries);
    bool loadEntries(std::vector<VectorStore::Entry> &outEntries);
}

#endif // FILE_MANAGER_H
