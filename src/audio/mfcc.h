#ifndef MFCC_H
#define MFCC_H

#include <vector>
#include "config.h"

namespace MFCC {
    /** Initialize precomputed windows and filterbanks */
    void init();

    /** Compute MFCC coefficients */
    bool compute(const std::vector<int16_t>& samples,
                 std::vector<float>& outCoeffs);
}

#endif // MFCC_H
