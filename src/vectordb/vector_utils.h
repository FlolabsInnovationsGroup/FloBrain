#ifndef VECTOR_UTILS_H
#define VECTOR_UTILS_H

#include "config.h"

namespace VectorUtils {
    float euclideanDistance(const float *a, const float *b, int dim);
    float cosineSimilarity(const float *a, const float *b, int dim);
    void normalize(float *a, int dim);
}

#endif // VECTOR_UTILS_H
