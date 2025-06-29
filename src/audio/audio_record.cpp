#include "audio/audio_record.h"
#include "config.h"
#include "utils/logger.h"
#include <driver/i2s.h>

void AudioRecorder::init() {
    i2s_config_t cfg = {
        .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX),
        .sample_rate = AUDIO_I2S_SAMPLE_RATE,
        .bits_per_sample = (i2s_bits_per_sample_t)AUDIO_I2S_BITS_PER_SAMPLE,
        .channel_format = (i2s_channel_fmt_t)AUDIO_I2S_CHANNEL_FORMAT,
        .communication_format = I2S_COMM_FORMAT_I2S,
        .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
        .dma_buf_count = 4,
        .dma_buf_len = AUDIO_I2S_BUFFER_SIZE
    };
    i2s_driver_install((i2s_port_t)0, &cfg, 0, NULL);
    logger::info("I2S audio recorder initialized");
}

bool AudioRecorder::record(std::vector<int16_t> &outBuffer) {
    size_t bytesRead = 0;
    outBuffer.resize(AUDIO_I2S_BUFFER_SIZE);
    esp_err_t err = i2s_read((i2s_port_t)0, outBuffer.data(),
                             AUDIO_I2S_BUFFER_SIZE * sizeof(int16_t),
                             &bytesRead, portMAX_DELAY);
    if (err != ESP_OK) {
        logger::error("I2S read failed: " + String(err));
        return false;
    }
    return true;
}
