#ifndef MOBILENETV2_H
#define MOBILENETV2_H

#include <vector>

/**
 * Stub for MobileNetV2-based embedding inference.
 * Replace with your actual model code or inference engine.
 */
namespace Mobilenet {
    /** Initialize the model (load weights, setup runtime) */
    bool init();

    /**
     * Run inference: input MFCC coefficients, output fixed-size vector.
     * @param input  Vector of MFCC floats
     * @param output Pre-allocated vector; must be EMBEDDING_DIM in length
     * @return true on success
     */
    bool infer(const std::vector<float> &input, std::vector<float> &output);
}

#endif // MOBILENETV2_H
