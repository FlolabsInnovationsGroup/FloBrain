#ifndef FFT_H
#define FFT_H

#include <vector>

namespace FFT {
    /** Compute power spectrum of the signal using FFT */
    void computePowerSpectrum(const std::vector<float> &frame,
                              int fftSize,
                              std::vector<float> &outPowerSpectrum);
}

#endif // FFT_H
