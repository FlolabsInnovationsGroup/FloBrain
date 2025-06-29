#ifndef LOGGER_H
#define LOGGER_H

#include <Arduino.h>

namespace logger {
    inline void init() { /* no-op for now */ }
    inline void info(const String &msg)  { Serial.println("[INFO]  " + msg); }
    inline void warn(const String &msg)  { Serial.println("[WARN]  " + msg); }
    inline void error(const String &msg) { Serial.println("[ERROR] " + msg); }
}

#endif // LOGGER_H
