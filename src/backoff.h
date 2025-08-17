#pragma once
#include <Arduino.h>

inline uint32_t backoff_ms(uint32_t attempt) {
  const uint32_t steps[] = {1000, 2000, 4000, 8000, 16000, 30000};  // cap 30s
  uint32_t base = steps[(attempt < 5) ? attempt : 5];
  int32_t jitter = (int32_t)((random(base/5)) - (int32_t)(base/10)); // ±20%
  return base + jitter;
}
