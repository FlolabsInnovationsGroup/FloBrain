# Getting Started with CAIPO

Welcome to the CAIPO Mono-repo. This document will help you get set up and understand the project structure.

## 📂 Repository Structure

| Project | Path | Description | Stack |
|:---|:---|:---|:---|
| **Core** | `/caipo-core` | The AI Brain & Logic Layer | Python |
| **Cloud** | `/caipo-cloud` | Backend & API Services | Python (FastAPI) |
| **Website** | `/caipo-website` | Public Interface & Brain UI | Next.js 14, Tailwind |
| **Robotics** | `/caipo-robotics` | Robot Control Firmware | C++ / PlatformIO |
| **Tools** | `/caipo-tools` | CLI & DevKit | Node.js |

## 🚀 Environment Setup

### Prerequisites
- Node.js 18+
- Python 3.10+
- Docker (Optional, for running local DBs)

### 1. Setup Website
The website is the primary UI for "The Brain".

```bash
cd caipo-website
npm install
npm run dev
```

Visit `http://localhost:3000`.

### 2. Setup Cloud (Backend)
```bash
cd caipo-cloud
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## 📝 Workflow
- **Tasks**: Check `docs/tasks/` for clear implementation guides.
- **Branching**: Use `feature/WEB-00X-feature-name` format.
- **Commits**: Use semantic commits (e.g., `feat: add memory graph`).
