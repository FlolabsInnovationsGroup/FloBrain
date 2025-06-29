#include "audio/mfcc.h"
#include "audio/fft.h"
#include "utils/logger.h"
#include <cmath>
#include <algorithm>

namespace {
    int frameLen, frameStep;
    std::vector<float> hammingWin;
    std::vector<std::vector<float>> melFilterbank;

    float hzToMel(float hz) {
        return 2595.0f * log10f(1 + hz/700.0f);
    }
    float melToHz(float mel) {
        return 700.0f * (powf(10, mel/2595.0f) - 1);
    }

    void computeHamming() {
        hammingWin.resize(frameLen);
        for (int i = 0; i < frameLen; ++i) {
            hammingWin[i] = 0.54f - 0.46f * cosf(2*M_PI*i/(frameLen-1));
        }
    }

    void computeFilterbank() {
        int numFilters = 26;
        int fftSize = 1;
        while (fftSize < frameLen) fftSize <<= 1;
        float melMin = hzToMel(0), melMax = hzToMel(AUDIO_I2S_SAMPLE_RATE/2);
        std::vector<float> melPts(numFilters+2);
        for (int i=0; i< numFilters+2; ++i)
            melPts[i] = melMin + (melMax-melMin)*i/(numFilters+1);
        std::vector<int> bins(numFilters+2);
        for (int i=0; i<melPts.size(); ++i) {
            float freq = melToHz(melPts[i]);
            bins[i] = (int)floor((fftSize+1)*freq/AUDIO_I2S_SAMPLE_RATE);
        }
        melFilterbank.assign(numFilters, std::vector<float>(fftSize/2+1,0));
        for (int m=1; m<=numFilters; ++m) {
            for (int k=bins[m-1]; k<bins[m]; ++k)
                melFilterbank[m-1][k] = (float)(k-bins[m-1])/(bins[m]-bins[m-1]);
            for (int k=bins[m]; k<bins[m+1]; ++k)
                melFilterbank[m-1][k] = (float)(bins[m+1]-k)/(bins[m+1]-bins[m]);
        }
    }
}

void MFCC::init() {
    frameLen  = AUDIO_I2S_SAMPLE_RATE * MFCC_FRAME_LENGTH_MS / 1000;
    frameStep = AUDIO_I2S_SAMPLE_RATE * MFCC_FRAME_STEP_MS / 1000;
    computeHamming();
    computeFilterbank();
    logger::info("MFCC initialized");
}

bool MFCC::compute(const std::vector<int16_t>& samples,
                   std::vector<float>& outCoeffs) {
    if (samples.size() < frameLen) {
        logger::warn("Insufficient samples");
        return false;
    }
    int fftSize = 1; while (fftSize < frameLen) fftSize <<= 1;
    std::vector<float> frame(fftSize, 0);
    for (int i=0; i<frameLen; ++i)
        frame[i] = samples[i] * hammingWin[i];

    std::vector<float> ps;
    FFT::computePowerSpectrum(frame, fftSize, ps);

    int numFilt = melFilterbank.size();
    std::vector<float> melE(numFilt, 0);
    for (int m=0; m<numFilt; ++m)
        for (int k=0; k<ps.size(); ++k)
            melE[m] += ps[k] * melFilterbank[m][k];
    for (auto &e: melE) e = logf(e + 1e-6f);

    outCoeffs.assign(MFCC_NUM_COEFFICIENTS, 0);
    for (int n=0; n<MFCC_NUM_COEFFICIENTS; ++n)
        for (int m=0; m<numFilt; ++m)
            outCoeffs[n] += melE[m] * cosf(M_PI*n*(m+0.5f)/numFilt);

    return true;
}
