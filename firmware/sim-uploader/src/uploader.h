#pragma once
#include <Arduino.h>
#include "telemetry.h"

// returns true on 2xx, fills http_code (0 on local failure)
bool post_file_multipart(const char* url,
                         const char* file_path, // absolute path in SPIFFS or SD
                         const String& meta_json,
                         int& http_code);

void run_queue_worker(const char* url, uint8_t max_tries, Telemetry& T);