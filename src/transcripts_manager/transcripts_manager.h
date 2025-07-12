import os

# Prepare directory structure for display
base_dir = "/mnt/data/caipo_transcripts_integration"
src_dir = os.path.join(base_dir, "src")
tm_dir = os.path.join(src_dir, "transcripts_manager")
os.makedirs(tm_dir, exist_ok=True)

# transcripts_manager.h
tm_h = """\
// transcripts_manager.h
// Module to store and retrieve voice transcriptions on SPIFFS

#ifndef TRANSCRIPTS_MANAGER_H
#define TRANSCRIPTS_MANAGER_H

#include <vector>
#include <Arduino.h>

// Structure for a single transcript entry
struct TranscriptEntry {
    uint32_t timestamp;             // milliseconds since boot or epoch
    String text;                    // Transcribed text
    std::vector<String> keywords;   // Extracted keywords
};

namespace TranscriptsManager {

    /**
     * Initialize SPIFFS filesystem for transcripts.
     * @return true on success, false on failure
     */
    bool init();

    /**
     * Append a transcription entry to the log file.
     * @param timestamp Time of transcription
     * @param text Transcribed text
     * @param keywords List of keywords
     * @return true on success
     */
    bool saveTranscription(uint32_t timestamp, const String &text, const std::vector<String> &keywords);

    /**
     * Load all transcription entries from the log file.
     * @param outList Vector to populate with loaded entries
     * @return true on success
     */
    bool loadAll(std::vector<TranscriptEntry> &outList);

}

#endif // TRANSCRIPTS_MANAGER_H
"""