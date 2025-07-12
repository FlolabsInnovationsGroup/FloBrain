# transcription_service.h
ts_h = """\
// transcription_service.h
// Module to call Whisper transcription service over HTTP

#ifndef TRANSCRIPTION_SERVICE_H
#define TRANSCRIPTION_SERVICE_H

#include <Arduino.h>
#include <vector>

namespace TranscriptionService {

    /**
     * Initialize Wi-Fi and HTTP client.
     * Must be called before using transcribe().
     * @param ssid Wi-Fi SSID
     * @param pass Wi-Fi password
     */
    void init(const char *ssid, const char *pass);

    /**
     * Send raw PCM or WAV data to backend Whisper endpoint.
     * Blocks until response or error.
     * @param data Pointer to audio buffer
     * @param len Length in bytes
     * @return Transcribed text, or empty on error
     */
    String transcribe(const uint8_t *data, size_t len);

}

#endif // TRANSCRIPTION_SERVICE_H
"""
