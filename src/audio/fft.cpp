#include "audio/fft.h"
#include "utils/logger.h"
#include <complex>
#include <vector>
#include <cmath>

namespace FFT {
    static void fftRecursive(std::vector<std::complex<float>> &x) {
        size_t N = x.size();
        if (N <= 1) return;
        std::vector<std::complex<float>> even(N/2), odd(N/2);
        for (size_t i = 0; i < N/2; ++i) {
            even[i] = x[i*2];
            odd[i]  = x[i*2 + 1];
        }
        fftRecursive(even);
        fftRecursive(odd);
        for (size_t k = 0; k < N/2; ++k) {
            auto t = std::polar(1.0f, -2 * M_PI * k / N) * odd[k];
            x[k]         = even[k] + t;
            x[k + N/2]   = even[k] - t;
        }
    }

    void computePowerSpectrum(const std::vector<float> &frame,
                              int fftSize,
                              std::vector<float> &outPowerSpectrum) {
        std::vector<std::complex<float>> buffer(fftSize);
        for (int i = 0; i < fftSize; ++i) {
            buffer[i] = (i < (int)frame.size())
                        ? std::complex<float>(frame[i], 0.0f)
                        : std::complex<float>(0.0f, 0.0f);
        }
        fftRecursive(buffer);
        int half = fftSize/2 + 1;
        outPowerSpectrum.resize(half);
        for (int i = 0; i < half; ++i) {
            float re = buffer[i].real();
            float im = buffer[i].imag();
            outPowerSpectrum[i] = (re*re + im*im) / fftSize;
        }
    }
}
