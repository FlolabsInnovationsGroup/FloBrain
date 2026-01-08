# Contributing to FloBrain

We follow a structured process to ensure stability and code quality. Please follow these guidelines when contributing.

## 🌿 Branching Model

We use a simplified Git flow:

*   **`main`**: 🛡️ **Stable, Production-Ready**. Do not push directly here.
*   **`development`**: 🚧 **Integration Branch**. Pull Requests (PRs) should target this branch.
*   **`feat/<scope>-<short-desc>`**: ✨ **New Features**. Branch off `development`.
*   **`fix/<scope>-<short-desc>`**: 🐛 **Bug Fixes**. Branch off `development` (or `main` for hotfixes).

### Examples
*   `feat/cloud-add-login`
*   `fix/robotics-sensor-parsing`
*   `docs/update-readme`

## 📝 Pull Request (PR) Rules

1.  **Target `development`**: Unless it's a hotfix or release, always target the `development` branch.
2.  **Review Required**: All PRs must be approved by at least one reviewer.
3.  **CI Must Pass**: Ensure all automated checks (linting, tests) are green.
4.  **Descriptive Title & Body**: explain *what* changed and *why*.
5.  **Small & Focused**: Keep PRs small to make reviewing easier.

## 🚀 Commits

*   Use semantic commit messages if possible (e.g., `feat: ...`, `fix: ...`, `chore: ...`).
