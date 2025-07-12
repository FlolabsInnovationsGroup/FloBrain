// keyword_extractor.cpp
// Implementation of simple keyword extraction

#include "keyword_extractor.h"

// Common English stopwords to ignore
static const std::set<String> STOPWORDS = {
    "the","and","that","have","for","not","with","you","this",
    "but","from","they","his","her","she","are","was","were"
};

std::vector<String> KeywordExtractor::extract(const String &text) {
    std::vector<String> result;
    std::set<String> seen;
    String token;

    auto flushToken = [&]() {
        if (token.length() > 2) {
            String lower = token;
            lower.toLowerCase();
            if (STOPWORDS.find(lower) == STOPWORDS.end() && seen.insert(lower).second) {
                result.push_back(lower);
            }
        }
        token = "";
    };

    for (size_t i = 0; i < text.length(); ++i) {
        char c = text.charAt(i);
        if (isalnum(c)) {
            token += c;
        } else {
            flushToken();
        }
    }
    // flush any trailing token
    flushToken();

    return result;
}
// End of keyword_extractor.cpp