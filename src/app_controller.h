// app_controller.h
#pragma once

#include <vector>
#include <Arduino.h>
#include "transcripts_manager/transcripts_manager.h"

class AppController {
public:
    void init();
    void loop();

private:
    // For async transcription callbacks (if you use HTTPClient callbacks)
    bool hasNewTranscription();
    String getLatestTranscription();

    // Handles saving text+keywords
    void handleTranscriptionResult(const String &text, const std::vector<String> &keywords);

    // Storage for an incoming transcription
    String latestTranscription;
};
