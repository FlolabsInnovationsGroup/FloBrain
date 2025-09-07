# CAIPO
**Chief AI Productivity Officer — CAIPO** is a transcription device thought to be ergonomic and easy to use. It records audio and video of its surroundings to provide an accurate transcription of any dialogue happening in its vicinity and provide detailed information about the recorded scene.

---

## 1. Introduction to CAIPO

CAIPO is a wearable AI assistant designed to provide quick, intelligent responses and task management directly from a small, lightweight device — without the distraction of traditional phone or computer interfaces.

It uses a capacitive touch sensor for activation, making interaction silent, quick, and privacy-friendly.

---

## 2. Key Features & Capabilities

* **Capacitive Touch Activation** — no wake word required; a tap triggers listening.
* **Multi-Sensor Interaction** — LEDs for feedback, haptic vibration, speaker for responses.
* **Wireless AI Connection** — via Wi-Fi using ESP32-S3 board.
* **Compact Design** — 3D-printed casing with magnetic mounting.
* **Long-Term Vision** — expand into fully offline AI mode and extended battery life.

---

## 3. Hardware Overview

### Bill of materials
| Component | Reference | Internal resources | Store links |
|-----------|-----------|--------------------|-------------|
| Microcontroller board | Seeed Studio Xiao ESP32-S3 Sense | [Introductory software](https://github.com/FlomadLabsRD/Seeed-Studio-Xiao-ESP32-S3-Sense) | [Amazon](https://www.amazon.com/Seeed-Studio-XIAO-ESP32-Sense/dp/B0C69FFVHH/ref=sr_1_22_sspa?crid=RPA3F6MZ3AM6&dib=eyJ2IjoiMSJ9.Bbi0rItDlZp4p_vjHEq7eIEcKgl7-atHllt6tRHkHq216HDOucLBV-dAVq4pqtKFGpQH1IHx9HF3oFqXo4ILhjqrVpqxn3SZlL4bp1KTMqo19yNanTtErzT0_9JJMHciog8P15sLbmLtee0nEIeZys2OqB2EViAbmdEdc1Gg9b6UC9ba87QnePvVNyCTK9L6.pgxWLi-5dZkPG_k_jMakC0cvl1NaDyPSoZoDQGG7Cwk&dib_tag=se&keywords=esp32%2Bpower%2Bsupply&qid=1718676384&sprefix=esp32%2Bpower%2Bsupply%2Caps%2C155&sr=8-22-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9tdGY&th=1) |
| Power Supply Distribution Board (PSDB) | Keenso0x6zgrh12c | *Not required* | [Amazon](https://www.amazon.com/Keenso-Supply-Distribution-Connection-Connectors/dp/B0BQFBM7DP/ref=sr_1_22?sr=8-22) |
| Haptic Motor Controller | DRV2605L | *Not yet implemented* | [Amazon](https://www.amazon.com/Quality-Controller-General-DRV2605L-Generate/dp/B0B6CK4XLF/ref=sr_1_1_sspa?sr=8-1-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1) |
| Class D Amplifier Breakout Interface | MAX98357 | *Not required* | [Amazon](https://www.amazon.com/Rakstore-MAX98357-MAX98357A-Amplifier-Interface/dp/B09L6VL43Q/ref=sr_1_15?sr=8-15) |
| Thin Plastic Speaker | Adafruit 1891 | *Not required* | [Amazon](https://www.amazon.com/Speakers-Transducers-Plastic-Speaker-Wires/dp/B00N4YW7G4/ref=sr_1_1?dib=eyJ2IjoiMSJ9.iV-2gPgcTqRJ-VW6POceWkS15KXiy8dYNtHbAhtFkgmQjfxldJuIeyuhsbUccOu3Biokh6w0aCqr-LbmMSX_Ol3j9HSU_TyUK9z8Ns_tyHL1k2SB21Wit0ySpF43LdxKy856yQkQHrXNJBsp_IjI8BZNgNy-hnbnvDmomaC1BacajAp2X8lko1nFWj-CwlyVWZk_a8CrEvZNx-LZjlL_gLOOelbRSzQ1v1kpIqRLlYE.zzs3MDdakk9z4JXR-V543JXn12xn16SlgfJk_ZvYDg0&dib_tag=se&keywords=adafruit+speaker&qid=1730595791&sr=8-1) |
| Individually Addressable Smart RGB LED | WS2812BLEDW-W100pcs | *Not required* | [Amazon](https://www.amazon.com/BTF-LIGHTING-WS2812B-Heatsink-10mm3mm-WS2811/dp/B01DC0J0WS/ref=sr_1_5?crid=27WXRQOMND7NF&dib=eyJ2IjoiMSJ9.1IpMYYKy-PwaqBnVhgqgaiT_CTifLDDTHnOBE1CAT0Jk91YvC48m9HzK-NmXNjqX7NEIxqGTutSMJhMdP1MiWPWzQa_aPB9i6JGbyveG0TzKSxdtqceDa8dX0ZJsFvTStXM_l2-NRUaymIQWBylUavU_m4_u6DJbWctBbBMEsG2PA4NLu5szrOAQ_tdO4lbEfYVzX6N9fPFqHXoXTFBjJqsDsmERVXIaO92ToH6g6Zso_PvX1mCBlwL7-jwccGMp9wECiWdoDEWdDMxJrwn5bcmxRQe0OZEk30l7nv3raZQ.2jtj14DYyMwAj5_93vXd4X8-kk4lox_pQQaY6anoN0Y&dib_tag=se&keywords=WS2812B%2BNeoPixel&qid=1730594248&sprefix=ws2812b%2Bneopixel%2Caps%2C117&sr=8-5&th=1) |
| Mini Vibration Motors | B07Q1ZV4MJ | *Not yet implemented* | [Amazon](https://www.amazon.com/tatoko-Vibration-Button-Type-Vibrating-Appliances/dp/B07Q1ZV4MJ?content-id=amzn1.sym.4311067e-a9df-4e8a-a5ce-d6836ea1723b) |
| Thin Film Pressure Sensor | MD30-60 | *Not required* | [Amazon](https://www.amazon.com/Pressure-Sensitivity-Sensitive-Automotive-Electronics/dp/B0BSLN4NFR?content-id=amzn1.sym.4311067e-a9df-4e8a-a5ce-d6836ea1723b) |


### Main Components

* **XIAO ESP32-S3 (Seeed Studio)** — Wi-Fi microcontroller.
* **MEMS microphone** — captures audio after activation.
* **MAX98357A audio DAC + speaker** — plays AI responses.
* **DRV2605L motor driver + vibration motor** — haptic feedback.
* **WS2812B LED** — visual feedback.
* **Capacitive touch sensor** — user activation.
* **Power system** — 3.7V 1000mAh LiPo battery + charging board + power distribution board (PDB).
* **3D-printed casing with embedded magnet** for mounting.

---

## 4. Software Architecture

**Firmware on ESP32-S3**

* Monitors the capacitive sensor for activation.
* Captures audio and sends to backend for processing.
* Controls LEDs, haptics, and speaker output.

**Backend AI Processing**

* Transcription → AI Response → Text-to-Speech conversion.
* Sends back audio for playback.

**Data Handling**

* No raw audio stored locally after processing.
* Optional session summaries stored securely.

---

## 5. Wiring & Assembly Guide

Below is the simplified pin mapping table based on the detailed wiring diagrams.

### **Power**

| Component                  | Connection                                 |
| -------------------------- | ------------------------------------------ |
| Battery B+ / B-            | Charging Board B+ / B-                     |
| Charging Board OUT+ / OUT- | PDB + / -                                  |
| ESP32 3.3V / GND           | PDB + / -                                  |
| Capacitor                  | Between ESP32 3.3V and GND (stabilization) |

---

### **Audio (MAX98357A DAC)**

| Pin       | ESP32 Connection | Notes                                |
| --------- | ---------------- | ------------------------------------ |
| LRC       | GPIO 1           | Left/Right channel sync              |
| BCLK      | GPIO 2           | Bit clock                            |
| DIN       | GPIO 3           | Audio data                           |
| GAIN      | GND              | Default max gain (optional resistor) |
| SD        | GND              | Always active                        |
| Vin / GND | PDB + / -        | With 10µF capacitor                  |

---

### **Haptic Motor Driver (DRV2605L)**

| Pin         | ESP32 Connection   | Notes               |
| ----------- | ------------------ | ------------------- |
| Vin / GND   | PDB + / -          | With 10µF capacitor |
| SCL         | GPIO 6             | I²C clock           |
| SDA         | GPIO 5             | I²C data            |
| Motor + / - | To vibration motor | —                   |

---

### **LED (WS2812B)**

| Pin       | ESP32 Connection | Notes                     |
| --------- | ---------------- | ------------------------- |
| VCC / GND | PDB + / -        | With 100µF capacitor      |
| DIN       | GPIO 44          | With 330Ω series resistor |

---

### **Capacitive Touch Sensor**

*(Exact GPIO will be finalized once wiring is verified — placeholder for prototyping.)*

* Touch signal → ESP32 GPIO (TBD)
* VCC → PDB +
* GND → PDB -

---

## 6. Assembly Steps

1. **3D Print Casing** — ensure precise fit for ESP32 board, battery, and components.
2. **Mount Electronics** — solder according to wiring map above.
3. **Add Capacitors/Resistors** — as per audio, LED, and power stability recommendations.
4. **Secure Battery & Charging Board** — ensure easy USB access for charging.
5. **Magnetic Mount Integration** — insert magnet into casing slot before sealing.
6. **Final Assembly & Testing** — verify capacitive touch triggers LED + mic activation.

---

## 7. User Interaction Flow

1. **Idle:** Device waits for capacitive touch input.
2. **Activation:** Touch triggers LED + vibration feedback.
3. **Audio Capture:** Mic records and sends data to AI backend.
4. **Response:** AI generates and sends audio back for speaker output.

---

## 8. Security & Privacy

* Encrypted Wi-Fi communication (TLS).
* No raw audio stored after processing.
* Optional manual data wipe via capacitive sensor gesture.

---

## 9. Future Development

* Add multi-touch gestures for different modes.
* Implement deep sleep mode to save battery.
* Offline AI mode for private processing.

---

## Getting started with the firmware
The firmware was thought to be run using Arduino IDE, the best tool for the Microcontroller we're using in this version of the device.

## Hardware Simulation
### Online Simulation
You may sometimes need to run the source code without the hardware at hand. For those situations, we have a Wokwi simulation you can customise to your needs. All files are inside the [Simulation](https://github.com/FlomadLabsInternational/Caipo-flomad-labs/tree/main/Simulation) folder.

To run the simulation, you can go directly to the [Simulation on wokwi.com](https://wokwi.com/projects/411276781876475905) or create your own by creating a XIAO-ESP32-S3 project and including the files in the folder.

### Local Simulation
To Simulate on your machine, you can use Wokwi with the VS code extension.
To get started with the VS Code extension, you can check the official guide: https://docs.wokwi.com/vscode/getting-started

