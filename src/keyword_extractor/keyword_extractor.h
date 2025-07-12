// keyword_extractor.h
// Simple keyword extraction from transcription text

#ifndef KEYWORD_EXTRACTOR_H
#define KEYWORD_EXTRACTOR_H

#include <vector>
#include <Arduino.h>
#include <set>

namespace KeywordExtractor {

    /**
     * Extract keywords from input text.
     * Splits on non-alphanumeric, filters stopwords and duplicates.
     * @param text Transcription text
     * @return Vector of keywords (lower-cased, unique)
     */
    std::vector<String> extract(const String &text);

}

#endif // KEYWORD_EXTRACTOR_H
