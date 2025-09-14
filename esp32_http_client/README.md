# ESP32 Resilient HTTP(S) Client with Retry/Backoff

## Project Overview

This project provides a robust and professional framework for making resilient HTTP(S) requests on the ESP32 platform. In IoT applications, network connections can be unreliable, and servers can be temporarily unavailable. This client is designed to gracefully handle these transient failures by implementing an intelligent retry mechanism with exponential backoff.

The entire project is structured for **PlatformIO** and is fully compatible with the **Wokwi simulator**, allowing for rapid development and testing without physical hardware.

### Key Features

-   **Robust HTTP Client:** Built upon the standard ESP32 `HTTPClient` library.
-   **Modular Helper Function:** All request logic is encapsulated in a clean, reusable `fetchWithRetry()` function.
-   **Smart Retry Mechanism:** Automatically retries requests that fail due to server errors (e.g., `503 Service Unavailable`) or connection timeouts.
-   **Exponential Backoff:** Prevents flooding a struggling server by progressively increasing the delay between each retry attempt.
-   **Capped Retries:** Avoids infinite loops by giving up after a configurable number of attempts.

## How the Core Tasks Were Implemented

This project successfully implemented three primary tasks to achieve its resilience.

### Task 1: Integrate Lightweight HTTP(S) Client

The foundation of the project is the `HTTPClient` library, which is part of the standard ESP32 Arduino core.

-   **Libraries Used:**
    -   `WiFi.h`: For connecting the ESP32 to the network.
    -   `HTTPClient.h`: Provides a simple API for making HTTP requests (e.g., `http.begin()`, `http.GET()`, `http.getString()`).

-   **HTTPS on Real Hardware:**
    For a production application using real hardware, secure `https://` communication is essential. This would be achieved by:
    1.  Including the `<WiFiClientSecure.h>` library.
    2.  Providing a Root CA certificate to validate the server's identity (`client.setCACert(root_ca)`).
    3.  Initializing the `HTTPClient` with the secure client object (`http.begin(client, url)`).

-   **Wokwi Simulation Note:**
    To simplify development and focus on the retry logic, this project uses plain `http://` URLs in the Wokwi simulator. This bypasses the need for SSL certificate management in a simulated environment where the core logic is the primary focus.

### Task 2: Wrap Requests in a Helper Function

To promote code reuse and maintainability, all the complex logic is encapsulated in a single helper function with a clear and simple interface.

-   **Function Signature:**
    ```cpp
    String fetchWithRetry(const char* url, int maxRetries, int initialBackoffMs);
    ```

-   **Parameters:**
    -   `const char* url`: The endpoint to fetch.
    -   `int maxRetries`: The number of times to **retry** after the first attempt fails. A value of `4` means a total of 5 attempts.
    -   `int initialBackoffMs`: The initial delay (in milliseconds) to wait before the first retry.

-   **Return Value:**
    -   On success (a `2xx` HTTP code), it returns the server response `String` (payload).
    -   On complete failure (after all retries are exhausted), it returns an empty `String`.

### Task 3: Implement Retry/Backoff on Failure Codes

This is the core of the project's resilience. The `fetchWithRetry` function contains a `while` loop that manages the attempts.

-   **Failure Triggers:** A retry is triggered under two specific conditions:
    1.  **Server-Side Errors:** If the HTTP response code is in the `5xx` range (e.g., `500 Internal Server Error`, `503 Service Unavailable`), indicating a problem on the server's end that might be temporary.
    2.  **Connection Errors:** If `http.GET()` returns a negative value, indicating a network-level failure like a timeout or DNS resolution error.

-   **Non-Retryable Failures:** The client is smart enough **not** to retry on `4xx` client-side errors (e.g., `404 Not Found`, `403 Forbidden`), as these are unlikely to be resolved by simply trying again.

-   **Exponential Backoff Logic:** The delay between retries is not static. After a failed attempt, the backoff delay is doubled for the next attempt. This is achieved with a simple line inside the loop:
    ```cpp
    backoffMs *= 2; // e.g., 500ms -> 1000ms -> 2000ms -> 4000ms
    ```
    This gives a struggling server an increasing amount of time to recover.

-   **Capping Retries:** The `while (attempt <= maxRetries)` loop ensures that the function will exit after the specified number of attempts, preventing it from getting stuck and consuming resources indefinitely.

## How to Run This Project

1.  **Prerequisites:** Visual Studio Code with the PlatformIO IDE extension.
2.  **Clone:** Clone this repository to your local machine.
3.  **Open:** Open the project folder in Visual Studio Code.
4.  **Build:** Click the checkmark icon (PlatformIO: Build) on the blue status bar at the bottom.
5.  **Simulate:** Press **F1** and type/select **"Wokwi: Start Simulator"**.
6.  **Observe:** The code will compile, and the Wokwi simulation pane will appear. The program's output, demonstrating the failure and success test cases, will be printed in the VS Code "Serial Monitor" terminal.