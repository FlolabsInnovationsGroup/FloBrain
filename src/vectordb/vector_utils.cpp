#include "vectordb/vector_utils.h"
#include <cmath>

namespace VectorUtils {

float euclideanDistance(const float *a, const float *b, int dim) {
    float sum = 0;
    for (int i=0; i<dim; ++i) {
        float d = a[i] - b[i];
        sum += d*d;
    }
    return sqrtf(sum);
}

float cosineSimilarity(const float *a, const float *b, int dim) {
    float dot=0, na=0, nb=0;
    for (int i=0; i<dim; ++i) {
        dot += a[i]*b[i];
        na  += a[i]*a[i];
        nb  += b[i]*b[i];
    }
    return dot / (sqrtf(na)*sqrtf(nb) + 1e-6f);
}

void normalize(float *a, int dim) {
    float norm=0;
    for (int i=0; i<dim; ++i) norm += a[i]*a[i];
    norm = sqrtf(norm) + 1e-6f;
    for (int i=0; i<dim; ++i) a[i] /= norm;
}

} // namespace VectorUtils
