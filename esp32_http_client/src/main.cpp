#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>

// --- Configuration ---
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// Use the HTTP versions of these URLs for reliable Wokwi simulation
const char* testUrl = "http://httpbin.org/status/500"; 
const char* successUrl = "http://httpbin.org/get"; // CHANGED: This URL returns a JSON payload

// Function prototype
String fetchWithRetry(const char* url, int maxRetries, int initialBackoffMs);

void setup() {
  Serial.begin(115200);
  Serial.println("\nBooting...");

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // --- Test Case 1: A URL that is expected to fail with a 500 error ---
  Serial.println("\n--- Testing Failure Scenario (expecting retries) ---");
  String responseFail = fetchWithRetry(testUrl, 4, 500); 
  if (responseFail.isEmpty()) {
    Serial.println("\n[RESULT] Correctly failed to fetch from the URL after all retries.");
  } else {
    Serial.println("\n[RESULT] Received unexpected response: " + responseFail);
  }

  // --- Test Case 2: A URL that is expected to succeed ---
  Serial.println("\n--- Testing Success Scenario ---");
  String responseSuccess = fetchWithRetry(successUrl, 4, 500);
  if (responseSuccess.isEmpty()) {
    Serial.println("\n[RESULT] Failed to fetch from the URL.");
  } else {
    Serial.println("\n[RESULT] Successfully received a response:");
    Serial.println(responseSuccess);
  }

  Serial.println("\n--- All tests complete ---");
}

void loop() {
  delay(10000);
}


// Helper function with retry/backoff logic
String fetchWithRetry(const char* url, int maxRetries, int backoffMs) {
  int attempt = 0;
  
  while (attempt <= maxRetries) {
    HTTPClient http;
    
    Serial.printf("\n[Attempt %d/%d] Connecting to: %s\n", attempt + 1, maxRetries + 1, url);
    http.begin(url); 

    int httpCode = http.GET();

    if (httpCode > 0) { 
      String payload = http.getString();
      Serial.printf("[HTTP] Response Code: %d\n", httpCode);

      if (httpCode >= 200 && httpCode < 300) {
        Serial.println("[HTTP] Request successful.");
        http.end();
        return payload;
      } 
      else if (httpCode >= 500 && httpCode < 600) {
        Serial.printf("[HTTP] Server error (code %d).", httpCode);
        if (attempt < maxRetries) {
          Serial.printf(" Retrying in %dms...\n", backoffMs);
        } else {
          Serial.println(" No more retries left.");
        }
      }
      else {
        Serial.printf("[HTTP] Client error (code %d). Not retrying.\n", httpCode);
        http.end();
        return ""; 
      }

    } else {
      Serial.printf("[HTTP] GET... failed. Error: %s.", http.errorToString(httpCode).c_str());
       if (attempt < maxRetries) {
          Serial.printf(" Retrying in %dms...\n", backoffMs);
        } else {
          Serial.println(" No more retries left.");
        }
    }
    
    http.end(); 

    if (attempt < maxRetries) {
        delay(backoffMs);
        backoffMs *= 2; 
    }
    
    attempt++;
  }

  Serial.println("Max retries reached. Giving up.");
  return ""; 
}