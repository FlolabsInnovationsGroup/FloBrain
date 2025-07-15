// Bluetooth_Transfer_simulation.cpp
// This code simulates the transfer of audio data over Bluetooth using the ESP32S3 on Wokwi.
// Ensure that you have PSRAM enabled (not necessary on most modern ESP32)
// Make sure that you have the SD and SPI libraries for the ESP32 installed

#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>

#define CHUNK_SIZE 512     // Size of each data chunk to send over BLE

BLEServer *pServer = NULL;
BLECharacteristic *pCharacteristic = NULL;
bool deviceConnected = false;

// BLE Server Callbacks
class MyServerCallbacks : public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) override {
        deviceConnected = true;
        Serial.println("Device connected.");
    }

    void onDisconnect(BLEServer* pServer) override {
        deviceConnected = false;
        Serial.println("Device disconnected. Restarting advertising...");
        BLEDevice::startAdvertising(); // Restart advertising after disconnect
    }
};

void setup() {
    Serial.begin(115200);
    while(!Serial);

    // Initialize BLE
    BLEDevice::init("ESP32S3_Audio_Transfer"); //Here is where you can change the name of the device
    pServer = BLEDevice::createServer();
    pServer->setCallbacks(new MyServerCallbacks());

    // Create BLE Service and Characteristic
    BLEService *pService = pServer->createService(BLEUUID((uint16_t)0x180D));
    pCharacteristic = pService->createCharacteristic(
        BLEUUID((uint16_t)0x2A37),
        BLECharacteristic::PROPERTY_READ |
        BLECharacteristic::PROPERTY_NOTIFY
    );

    pService->start();

    // Start BLE Advertising
    BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
    pAdvertising->addServiceUUID(pService->getUUID());
    pAdvertising->start();

    Serial.println("Bluetooth device is ready to pair.");
}

void loop() {
    if (deviceConnected) {
        uint8_t buffer[CHUNK_SIZE];
        size_t bytesRead;

        // Simulate reading and sending a file
        for(int i = 0; i < 1024; i++) { // Simulate 1 KB of data
            buffer[i % CHUNK_SIZE] = (uint8_t)('A' + (i % 26));
            bytesRead = i + 1;

            pCharacteristic->setValue(buffer, bytesRead);
            pCharacteristic->notify();  // Send the chunk over BLE
        }
    }

    delay(1000); // Wait before checking again
}