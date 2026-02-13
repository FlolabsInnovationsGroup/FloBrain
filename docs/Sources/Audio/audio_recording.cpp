#include <SD.h>
#include <SPI.h>
#include <I2S.h>

#define SENSOR_PIN A10
#define SD_CS_PIN 5  // Use the default CS pin for the onboard microSD
#define RECORD_THRESHOLD 4000

File audioFile;
bool isRecording = false;

void setup() {
  Serial.begin(115200);
  pinMode(SD_CS_PIN, OUTPUT);

  // Initialize the SD card

  while(!Serial);
    if(!SD.begin(21)){
        Serial.println("Card Mount Failed");
        return;
    }
    uint8_t cardType = SD.cardType();

    if(cardType == CARD_NONE){
        Serial.println("No SD card attached");
        return;
    }

    Serial.print("SD Card Type: ");
    if(cardType == CARD_MMC){
        Serial.println("MMC");
    } else if(cardType == CARD_SD){
        Serial.println("SDSC");
    } else if(cardType == CARD_SDHC){
        Serial.println("SDHC");
    } else {
        Serial.println("UNKNOWN");
    }

    uint64_t cardSize = SD.cardSize() / (1024 * 1024);
    Serial.printf("SD Card Size: %lluMB\n", cardSize);

  // Initialize I2S for audio capture (16 kHz, 16-bit)
  I2S.setAllPins(-1, 42, 41, -1, -1);
  if (!I2S.begin(PDM_MONO_MODE, 16000, 16)) {
    Serial.println("Failed to initialize I2S!");
    while (1); // do nothing
  }
}

void loop() {
  int sensorValue = analogRead(SENSOR_PIN);

  if (sensorValue < RECORD_THRESHOLD && !isRecording) {
    startRecording();
  }

  if (sensorValue >= RECORD_THRESHOLD && isRecording) {
    stopRecording();
  }

  if (isRecording) {
    recordAudioChunk();
  }

  delay(10);
}

void startRecording() {
  Serial.println("Starting recording...");
  // Open the file on the SD card to write audio data
  audioFile = SD.open("/command.wav", FILE_WRITE);
  if (!audioFile) {
    Serial.println("Could not open file for recording.");
    return;
  }
  isRecording = true;
}

void stopRecording() {
  Serial.println("Stopping recording...");
  if (isRecording) {
    audioFile.flush();  // Ensure all data is written to the SD card
    audioFile.close();
    isRecording = false;
  }
}

void recordAudioChunk() {
  const int bytesToRead = 512;
  byte buffer[bytesToRead];
  int bytesRead = I2S.read(buffer, bytesToRead);

  if (bytesRead > 0 && audioFile) {
    audioFile.write(buffer, bytesRead);
  }
}
