#include "embeddings/mobilenetv2.h"
#include "config.h"
#include "utils/logger.h"

namespace Mobilenet {

bool init() {
    // TODO: load your model weights or initialize interpreter here
    logger::info("Mobilenet stub initialized (no real model load).");
    return true;
}

bool infer(const std::vector<float> &input, std::vector<float> &output) {
    // Simple stub: copy or average input into output
    if (input.size() < MFCC_NUM_COEFFICIENTS) {
        logger::error("Mobilenet::infer input too small");
        return false;
    }
    output.resize(EMBEDDING_DIM);
    // For now, just fill with the first coefficient
    float sample = input[0];
    for (int i = 0; i < EMBEDDING_DIM; ++i) {
        output[i] = sample;
    }
    return true;
}

} // namespace Mobilenet
