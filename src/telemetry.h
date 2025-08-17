#pragma once
#include <Arduino.h>

struct Reservoir {
  static constexpr size_t N = 200;
  double vals[N]; size_t idx=0, count=0;
  void add(double x){ vals[idx++ % N] = x; if (count < N) count++; }
  double percentile(double p) const {
    if (count==0) return 0;
    // simple selection-by-sort (N=200 → cheap)
    double tmp[N];
    for (size_t i=0;i<count;i++) tmp[i] = vals[i];
    // insertion sort (tiny N)
    for (size_t i=1;i<count;i++){
      double k = tmp[i]; int j = (int)i - 1;
      while (j>=0 && tmp[j] > k){ tmp[j+1]=tmp[j]; j--; }
      tmp[j+1]=k;
    }
    size_t k = (size_t)(p * (count-1));
    return tmp[k];
  }
};

struct Telemetry {
  // buffer health
  uint32_t audio_overruns=0, audio_underruns=0, cam_frame_drops=0;
  // uploader stats
  uint32_t up_attempts=0, up_success=0, up_retry=0, up_fail=0;

  Reservoir loop_lat_ms;
  uint32_t last_print_ms=0;

  inline void record_latency_ms(double ms){ loop_lat_ms.add(ms); }

  inline void print_every_10s(size_t spiffs_free, size_t sd_free){
    uint32_t now = millis();
    if (now - last_print_ms < 10000) return;
    last_print_ms = now;
    double p50 = loop_lat_ms.percentile(0.50);
    double p95 = loop_lat_ms.percentile(0.95);
    Serial.printf(
      "T=%lums | A_ovr=%u A_und=%u | C_drop=%u | POST ok=%u retry=%u fail=%u | p50=%.1fms p95=%.1fms | spiffs=%u sd=%u\n",
      (unsigned long)now, audio_overruns, audio_underruns, cam_frame_drops,
      up_success, up_retry, up_fail, p50, p95, (unsigned)spiffs_free, (unsigned)sd_free
    );
  }
};