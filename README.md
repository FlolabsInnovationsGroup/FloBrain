# Caipo Flomad Labs

Welcome to the Caipo Flomad Labs repository. This project is organized into a modular structure to separate concerns between backend, frontend, firmware, and hardware.

## 📂 Project Structure

### `backend/`
**Technology**: Python, FastAPI
The core backend service for the Caipo device.
- **API**: RESTful endpoints for audio transcription (`/transcribe`) and chat (`/chat`).
- **Services**:
    - **Transcription**: Integration with OpenAI Whisper.
    - **Vector DB**: FAISS-based vector storage for memory.
    - **LLM**: OpenAI GPT integration for intelligence.
    - **Synthesis**: ElevenLabs TTS for voice response.
- **Docs**: API documentation available at `/docs` when running.

### `frontend/`
**Technology**: React, TypeScript
The web interface for interacting with Caipo.
- **Features**: Real-time status, media management, and settings.
- **Stack**: Vite (or Create React App), Redux Toolkit, TailwindCSS (if applicable).

### `firmware/`
**Technology**: C++, PlatformIO (ESP32)
Embedded code for the Caipo hardware.
- **Platform**: ESP32-S3.
- **Features**: Audio recording, Wi-Fi connectivity, API communication.

### `hardware/`
**Content**: Schematics, PCB Designs, CAD files.
*(Currently empty, reserved for future hardware assets)*

### `scripts/`
**Content**: Standalone utility scripts.
- Python scripts for testing or one-off tasks.

### `docs/`
**Content**: Project documentation, diagrams, and research.
- Architecture diagrams, Postman collections, and simulation files.

### `legacy/`
**Content**: Archived code and prototypes.
- **`node_backend`**: Previous Node.js backend implementation.
- **`frontend_poc`**: Proof-of-concept frontend.
- **`prototypes`**: Experimental code (Whisper API tests, Vector DB tests).

---

## ✨ Features Implemented

### Backend
- **Modular Architecture**: Service-based design for easy scalability.
- **AI Integration**:
    - **Speech-to-Text**: High-accuracy transcription using OpenAI Whisper.
    - **Memory**: Vector database (FAISS) to store and retrieve past conversations.
    - **Intelligence**: Context-aware responses using GPT-4/3.5.
    - **Text-to-Speech**: Natural voice synthesis via ElevenLabs.
- **API**: Clean, documented REST API using FastAPI.

### Frontend
- **Modern UI**: Built with React and TypeScript.
- **State Management**: Redux for managing application state.
- **Integration**: Connected to the backend API for real-time updates.

---

## 🚀 Getting Started

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Firmware
Open `firmware/` in VS Code with the PlatformIO extension to build and upload.
