# Releasing FloBrain

We use semantic versioning (e.g., `v1.2.0`) to tag releases.

## 📦 How to Cut a Release

1.  **Ensure `development` is Stable**
    *   Verify all features for the release are merged.
    *   Ensure CI is passing.

2.  **Create a Release PR**
    *   Create a branch: `release/vX.Y.Z` from `development`.
    *   Update version numbers in relevant files (e.g., `package.json`, `setup.py`, `version.h`).
    *   Update `CHANGELOG.md` (if applicable).
    *   Open a PR targeting **`main`**.

3.  **Merge & Tag**
    *   Once the PR is approved and merged to `main`:
    *   **Tag the commit on `main`**:
        ```bash
        git checkout main
        git pull origin main
        git tag -a vX.Y.Z -m "Release vX.Y.Z"
        git push origin vX.Y.Z
        ```

4.  **Back-Merge to Development**
    *   Merge `main` back into `development` to ensure it has the latest version tags and changelog updates.
    *   `git checkout development`
    *   `git merge main`
    *   `git push origin development`

## 🏷 Versioning Scheme
*   **Major (X.y.z)**: Breaking changes.
*   **Minor (x.Y.z)**: New features (backwards compatible).
*   **Patch (x.y.Z)**: Bug fixes.
