# FloBrain Robotics Technical Assessment

**Status:** Assessment / documentation only. No robotics functionality was built
or modified as part of this assessment, per explicit instruction. All findings
below are backed by file paths (and line numbers where applicable) in this
repository; nothing here should be read as a claim that robotics functionality
is implemented unless the evidence column says so.

**Scope inspected:** `flobrain-robotics/`, `legacy/firmware_archived/`,
`docs/architecture/CLOUD_VS_BRAIN.md`, `docs/Simulation/XIAO-ESP32-S3.zip`,
`flobrain-cloud/`, and `CAIPO_DEV_KIT_Electrical_Schematics_v1.0.zip`
(KiCad project + BOM, inspected read-only - not extracted/committed anywhere).

## Bottom line

`flobrain-robotics/` is an empty repository with a one-line README that
honestly says "Planned" (`flobrain-robotics/README.md:10`). There is no
robot, no motor control, and no robot-facing backend integration anywhere in
this codebase today. The only real, buildable, testable hardware/firmware
artifacts in the whole repository relate to a **wearable audio device**
("Caipo"), not a robot - and that prior art is explicitly archived, not an
active product.

## 1-3. Implementation status: implemented / partial / planned

| Capability | Status | Evidence | Missing work |
|---|---|---|---|
| Robot behaviors / locomotion | **Planned only** | `flobrain-robotics/README.md:10` ("Planned"). Directory contains no other files. | Everything - no code exists. |
| Motor control | **Not implemented; not even present in the schematics** | `CAIPO_DEV_KIT.csv` BOM (refs U1-U4, BT1) lists no motor driver, H-bridge, or PWM motor-control IC. | Motor driver IC, motors, and firmware, all from scratch. |
| Sensor integration | **Partially implemented, but for a wearable, not a robot** | BOM: `U2 = TTP223` (capacitive touch), `U3 = uxcell` (microphone). `legacy/firmware_archived/CaipoTranscription.ino`, `storage.cpp`/`storage.h` implement audio capture + SD storage on real ESP32 firmware. | No distance/IMU/camera sensing for navigation or obstacle avoidance exists. |
| Robot communication | **Not implemented for robotics; BLE exists for the wearable** | `legacy/firmware_archived/main.cpp` implements BLE file transfer (`BLEDevice`/`BLEServer`). No MQTT/robot-telemetry protocol anywhere in the repo. | A robot-communication protocol (MQTT/WebSocket/REST) does not exist yet. |
| Control / decision-making logic | **Architectural proposal only** | `docs/architecture/CLOUD_VS_BRAIN.md:30-40` describes a conceptual "Observe -> Orient -> Decide -> Act" loop for `caipo-core`, possibly running on robot edge hardware (e.g. Jetson). No corresponding code anywhere. | All of it - this is a design diagram, not an implementation. |
| Error handling / safety mechanisms | **Not implemented** | No file in the repository implements an e-stop, watchdog, or safety interlock. | Full design, required before any motor is ever energized. |
| Simulation support | **Exists, but for the wearable's MCU, not a robot** | `docs/Simulation/XIAO-ESP32-S3.zip` is a Wokwi project (diagram/sketch/project files) simulating the Seeed XIAO ESP32-S3 used in the wearable BOM. `.pio/build/seeed_xiao_esp32s3/firmware.bin` confirms the firmware actually builds for that chip. | No simulation of motors, actuators, or robot physics exists (would need Gazebo/Webots or similar, not Wokwi). |
| Backend integration | **Not implemented** | No firmware or robotics code anywhere calls the Django API. `docs/architecture/CLOUD_VS_BRAIN.md:17-19` only *describes* an intended "Device Registry (MQTT/WebSockets)" responsibility for `flobrain-cloud`; `flobrain-cloud/main.py` (FastAPI) itself has no device/MQTT code implemented either. | The entire integration layer needs to be built. |

## 4-6. Hardware, components, and simulation

**Confirmed present in the schematics** (KiCad project + BOM inside
`CAIPO_DEV_KIT_Electrical_Schematics_v1.0.zip`, bill of materials
`CAIPO_DEV_KIT.csv`):

| Ref | Component | Role |
|---|---|---|
| U1 | Seeeduino XIAO ESP32-S3 (`MODULE-SEEEDUINO-XIAO-ESP32S3`) | Main MCU |
| U2 | TTP223 | Capacitive touch sensor |
| U3 | uxcell (generic) | Microphone |
| U4 | MAX98357 | I2S Class-D speaker amplifier |
| BT1 | 3.7V Li-ion cell | Battery |

Additional KiCad library symbols exist in the project but are **not placed in
the BOM**: a TP4056 battery-charging module, a voltage booster, an SD card
holder, an RGB LED, and a Raspberry Pi Zero 2 W footprint/symbol. These read
as explored/available library parts, not confirmed-placed components on this
specific board.

This is a **wearable audio device** (touch + microphone + speaker + battery +
MCU), consistent with the archived Caipo transcription/BLE-transfer firmware.
**There is no motor, actuator, motor driver, or H-bridge anywhere in this
BOM.**

**Software dependencies already present (for the wearable, not a robot):**
Arduino/ESP32 core, `BLEDevice`/`BLEServer` (ESP32 BLE Arduino library),
`SD`/`SPI` (`legacy/firmware_archived/main.cpp`), a FAISS-lite on-device
library stub (`legacy/firmware_archived/lib/faiss-lite`), and a PlatformIO
build config (`legacy/firmware_archived/platformio.ini`), confirmed buildable
via `.pio/build/seeed_xiao_esp32s3/firmware.bin`.

**Hardware that would be needed for an actual robot (not present - do not
assume it is owned without confirming with the robotics/hardware team):** a
chassis/platform, DC or servo motors, a motor driver (e.g. an H-bridge), wheel
or track encoders, a battery sized for motor current draw (the current
Li-ion cell is sized for a low-power wearable, not motors), and likely an
additional MCU/SBC with more GPIO/PWM channels for motor control. The
ESP32-S3 already in the BOM could in principle drive motors via PWM, but
nothing in the repository suggests that has been planned or wired.

**Simulation:** Wokwi (`docs/Simulation/XIAO-ESP32-S3.zip`) simulates the
MCU/peripherals in the wearable BOM only. A physics-capable simulator
(Gazebo, Webots, or similar) does not exist in this repository in any form
and would be required for actual robot behavior.

## 8. Backend integration - recommendation (not implemented)

`flobrain-cloud` (FastAPI) is architecturally described
(`docs/architecture/CLOUD_VS_BRAIN.md:17-19`) as the intended "Device
Registry... MQTT/WebSockets" layer, but none of that exists in code today in
either `flobrain-cloud` or `flobrain-core/backend`. Given the Django
backend's current patterns (Bearer-token auth via `get_user_from_request`,
DRF `APIView`s, owner-scoped Postgres models):

- **Recommended starting point once real hardware exists:** a REST
  polling/command-queue pattern (robot polls `GET /api/robotics/commands/`,
  posts `POST /api/robotics/telemetry/`), authenticated with a
  **device-scoped** token (not a user's own JWT - a robot is not a logged-in
  user), mirroring the existing `Role`/`UserRole`-style join-table pattern
  with a new `Device`/`DeviceToken` model.
- **MQTT/WebSockets** (as `CLOUD_VS_BRAIN.md` envisions) is a better fit than
  REST polling once there is continuous telemetry and low-latency commands,
  but it requires materially more infrastructure (a broker, connection
  lifecycle management) than the current Django-only stack has today. Defer
  this until roadmap milestone 2-3 below, after a minimal REST path proves
  the integration works end-to-end.
- REST polling is trivial to build on the existing Django architecture and
  testable with the existing `APITestCase` conventions; its limitation is the
  latency/battery cost of polling, which matters once there is a real robot
  needing fast commands.

## 9. Major gaps and technical risks

- Zero actual robot hardware or motor-control code exists today - this is a
  from-scratch build, not an extension of existing work.
- No safety/e-stop design exists; this must be designed **before** any motor
  is ever energized.
- `flobrain-cloud`'s device-registry responsibility is currently aspirational
  text in a doc, not an API.
- Hardware ownership is unconfirmed - do not assume the team already has a
  chassis, motors, or drivers on hand.

## 10. Realistic roadmap (5 milestones)

| # | Milestone | Required work | Dependencies | Deliverable | Verification | Team/HW dependency |
|---|---|---|---|---|---|---|
| 1 | Device registration + telemetry stub (software only) | New minimal `Device`/`DeviceToken` Django models + 2 endpoints (register device, post heartbeat), following existing `users`/`teams` test conventions | None - pure software, extends the existing Django backend | A merge-able PR with tests, no hardware needed | `APITestCase`s for auth/ownership, run in CI | None |
| 2 | Simulated "robot" client against milestone 1 | A small script (Python, or the existing Wokwi ESP32-S3 sim) that authenticates as a device and posts fake telemetry/polls fake commands | Milestone 1 merged | A documented demo script + recorded run | Manual run + a test asserting the backend records telemetry correctly | None (software-only) |
| 3 | Hardware selection & safety design doc | Written spec choosing chassis/motor/driver, plus an e-stop/watchdog design, reviewed by the robotics/hardware team | None technical, but needs sign-off | A design doc (not code) | Team review/approval | **Robotics team hardware decision required** |
| 4 | First real motor-control firmware (bench test only, no backend yet) | PlatformIO firmware driving one motor via the chosen driver, with the e-stop design from milestone 3 implemented and tested on a bench, not integrated with any network yet | Milestone 3 hardware in hand | Working firmware + a short demo video/log | Physical bench test, with the e-stop verified to actually cut power | **Requires physical hardware the team must source** |
| 5 | End-to-end: firmware <-> milestone-1 backend | Wire milestone 4's firmware to call milestone 1's REST endpoints for commands/telemetry | Milestones 1 and 4 both done | A working demo: backend sends a command, robot moves, telemetry comes back | Live demo + integration test against a staging backend | Hardware, and possibly DevOps for a reachable staging endpoint |

## Open questions / blockers (robotics/hardware team)

1. Does the robotics team already own any chassis/motor/driver hardware, or
   does milestone 3 start from zero procurement?
2. Is `flobrain-cloud` (FastAPI) or `flobrain-core/backend` (Django) intended
   to own device/telemetry endpoints long-term? `CLOUD_VS_BRAIN.md` suggests
   Cloud, but Cloud currently has no code for it either - this should be
   decided before milestone 1 starts.
3. Is the "Caipo" wearable hardware meant to be reused/extended toward
   robotics, or is it a fully separate product line? This materially changes
   whether milestone 3's hardware choice starts from the existing BOM or from
   scratch.

These are documentation/planning questions only; answering them does not
require or imply building anything described above.
