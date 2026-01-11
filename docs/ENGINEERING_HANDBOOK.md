# Engineering Handbook 📘

Welcome to the **FloBrain** engineering guide. This document explains "How" we work and "Why" things are set up the way they are.

## 1. Repository Structure 📂

We separate active development from legacy experiments to keep the codebase clean.

- **`flobrain-website/`**: The active frontend (Next.js, React, Tailwind).
- **`flobrain-cloud/`**: The active backend (FastAPI, Python, AI Services).
- **`docs/`**: Project documentation (Architecture, API specs, Handbook).
- **`legacy/`**: Archived code. **Read-only**. Do not build new features here.

## 2. Workflow & Branching 🌿

We follow a strict branching model to ensure stability.

| Branch | Purpose | Protection |
| :--- | :--- | :--- |
| `main` | **Production Code**. Only stable, tested code. | **Protected**: No direct pushes. |
| `development` | **Integration**. Feature branches merge here first. | **Protected**: No direct pushes. |
| `feat/name` | New features (e.g., `feat/auth`). | Open. |
| `fix/name` | Bug fixes (e.g., `fix/login-error`). | Open. |

### The "Perfect" PR
1.  Create a branch: `git checkout -b feat/my-feature`
2.  Do work.
3.  **Local Check**: Run CI commands locally (see below).
4.  Push: `git push origin feat/my-feature`
5.  Open PR -> Target `development`.
6.  Fill out the PR Template.

## 3. CI Pipelines (Automated Checks) 🤖

Every PR runs these checks. If they fail, you cannot merge.

### Frontend (`flobrain-website`)
Runs on Node.js 20.
- **Lint**: `npm run lint` (Checks code style/errors)
- **Typecheck**: `npm run typecheck` (Checks TypeScript types)
- **Build**: `npm run build` (Ensures the app compiles)

**➡️ How to run locally:**
```bash
cd flobrain-website
npm run lint  # Fix errors if shown
npm run typecheck
npm run build
```

### Backend (`flobrain-cloud`)
Runs on Python 3.11.
- **Formatting**: `black --check .` (Code style)
- **Linting**: `ruff check .` (fast linting)
- **Typecheck**: `mypy .` (Strict typing)
- **Tests**: `pytest` (Unit/Integration tests)

**➡️ How to run locally:**
```bash
cd flobrain-cloud
# Activate your venv first! source .venv/bin/activate
black .      # Reformat code automatically
ruff check . --fix # Fix lint errors automatically
mypy .       # Check types
pytest       # Run tests
```

## 4. Mobile Strategy (Future) 📱

Since we use **Next.js + Tailwind**, we have two paths to mobile:
1.  **PWA (Progressive Web App)**: Add a `manifest.json`. Users "install" the website on their phone. Easy, instant.
2.  **Capacitor**: Wrap the Next.js app in a native container. Generates real iOS/Android projects.
    *   *Pros*: Access to native features (Camera, Push Notifs), App Store presence.
    *   *Cons*: Requires building iOS/Android binaries.

## 5. Templates & Hygiene

- **Bug Report**: Use `.github/ISSUE_TEMPLATE/bug_report.yml`. Be specific!
- **Tasks**: Use `.github/ISSUE_TEMPLATE/task.yml` for small units of work.

## 6. QA & Observability Strategy (Recommended) 🧪

As the project grows, manual testing won't be enough. Here is the recommended "Next Level" QA stack:

### A. End-to-End (E2E) Testing
**Tool: Playwright**
- **Why**: It allows you to script real user scenarios (e.g., "User logs in, clicks upload, sees success message"). It runs in a real browser (Headless Chrome/Safari/Firefox).
- **Setup**: Install inside `flobrain-website`.
- **Benefit**: Catches regressions that unit tests miss (e.g., "Button is covered by a modal").

### B. Visual Regression Testing
**Tool: Chromatic (or Percy)**
- **Why**: Even if code works, the UI might look broken (e.g., CSS shifted).
- **How**: It takes screenshots of every component/page on every PR and compares them to the "master" version. You get an alert if pixels change.
- **Benefit**: Zero "surprise" UI breakages.

### C. Error Tracking
**Tool: Sentry**
- **Why**: When users hit errors in production, you need to know *exactly* what happened (stack trace, user actions, device info).
- **Setup**: One SDK for Next.js, one for FastAPI.
- **Benefit**: Fix bugs before users even complain.

### D. API Integration Testing
**Tool: Pytest (Expanded)**
- **Why**: Mocking is great, but you need to test the *real* database and *real* external APIs (or realistic mocks of them).
- **Action**: Create a `tests/integration` folder in `flobrain-cloud` that spins up a test DB.
