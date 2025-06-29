#ifndef AUDIO_RECORD_H
#define AUDIO_RECORD_H

#include <vector>
#include <stdint.h>

namespace AudioRecorder {
    /** Initialize audio input (I2S or ADC) */
    void init();

    /** Record a buffer of samples */
    bool record(std::vector<int16_t> &outBuffer);
}

#endif // AUDIO_RECORD_H
