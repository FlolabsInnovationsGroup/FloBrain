#include "storage/file_manager.h"
#include "utils/logger.h"
#include "config.h"
#include <SPIFFS.h>

namespace FileManager {

bool init() {
    if (!SPIFFS.begin(true)) {
        logger::error("Failed to mount SPIFFS");
        return false;
    }
    logger::info("SPIFFS mounted successfully");
    return true;
}

static bool writeString(File &f, const String &s) {
    uint16_t len = s.length();
    f.write((uint8_t*)&len, sizeof(len));
    return f.write((const uint8_t*)s.c_str(), len) == len;
}

static bool readString(File &f, String &s) {
    uint16_t len;
    if (f.read((uint8_t*)&len, sizeof(len)) != sizeof(len)) return false;
    std::vector<char> buf(len+1);
    if (f.read((uint8_t*)buf.data(), len) != len) return false;
    buf[len] = '\0';
    s = String(buf.data());
    return true;
}

bool saveEntries(const std::vector<VectorStore::Entry> &entries) {
    File file = SPIFFS.open(CONFIG_STORAGE_FILENAME, FILE_WRITE);
    if (!file) {
        logger::error("Failed to open storage file for writing");
        return false;
    }
    uint32_t count = entries.size();
    file.write((uint8_t*)&count, sizeof(count));
    for (auto &e : entries) {
        file.write((uint8_t*)e.embedding.data(), EMBEDDING_DIM*sizeof(float));
        file.write((uint8_t*)&e.meta.timestamp, sizeof(e.meta.timestamp));
        if (!writeString(file, e.meta.type)) {
            logger::error("Failed writing meta.type");
            file.close();
            return false;
        }
        if (!writeString(file, e.meta.label)) {
            logger::error("Failed writing meta.label");
            file.close();
            return false;
        }
    }
    file.close();
    logger::info("Entries saved: " + String(count));
    return true;
}

bool loadEntries(std::vector<VectorStore::Entry> &outEntries) {
    if (!SPIFFS.exists(CONFIG_STORAGE_FILENAME)) {
        logger::warn("Storage file does not exist");
        return false;
    }
    File file = SPIFFS.open(CONFIG_STORAGE_FILENAME, FILE_READ);
    if (!file) {
        logger::error("Failed opening storage file for reading");
        return false;
    }
    uint32_t count = 0;
    if (file.read((uint8_t*)&count, sizeof(count)) != sizeof(count)) {
        logger::error("Failed reading entry count");
        file.close();
        return false;
    }
    outEntries.clear();
    outEntries.reserve(count);
    for (uint32_t i=0; i<count; ++i) {
        VectorStore::Entry e;
        file.read((uint8_t*)e.embedding.data(), EMBEDDING_DIM*sizeof(float));
        file.read((uint8_t*)&e.meta.timestamp, sizeof(e.meta.timestamp));
        readString(file, e.meta.type);
        readString(file, e.meta.label);
        outEntries.push_back(e);
    }
    file.close();
    logger::info("Entries loaded: " + String(outEntries.size()));
    return true;
}

} // namespace FileManager
