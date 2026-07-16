# FloBrain Monorepo

Welcome to the central repository for the FloBrain ecosystem. This monorepo hosts the active development pillars of the FloBrain architecture.

## 🚨 Active vs Legacy

**Active code lives in `/flobrain-*` directories.**
Legacy code is archived in `/legacy`. Please do not build new features in `/legacy`.

## 📂 Project Structure

### 1. [FloBrain Core](./flobrain-core) (The Brain)
The central intelligence layer. Handles logic, memory, and decision making.

### 2. [FloBrain Cloud](./flobrain-cloud)
The backend infrastructure providing API services, persistent storage, and heavy compute routing.

### 3. [FloBrain Robotics](./flobrain-robotics)
Firmware and control software for FloBrain-powered robots and devices.

### 4. [FloBrain Website](./flobrain-website)
The public face of FloBrain.

### 5. [Hardware](./hardware) & [Docs](./docs)
Hardware schematics and project documentation.

## 🗄 Legacy
Old firmware and frontend code is archived in `./legacy`.

## 🐳 Local Docker (recommended)

One-command local stack (Windows Docker Desktop):

```powershell
Copy-Item .env.example .env
.\scripts\start-flobrain-local.ps1
```

- Website → http://localhost:3000  
- Backend → http://localhost:8000  
- Cloud → http://localhost:8001  

See [DOCKER_LOCAL.md](./DOCKER_LOCAL.md) and [FLOBrain_LOCAL_SETUP.md](./FLOBrain_LOCAL_SETUP.md).
