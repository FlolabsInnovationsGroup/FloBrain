#!/bin/bash
# Create a fresh venv for the backend and install requirements.
# Run from backend/:  bash setup_venv.sh

set -e
BACKEND_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV_DIR="$BACKEND_DIR/.venv"

# Use system Python 3 (framework or Homebrew).
# Python 3.11 matches CI (.github/workflows/core-backend-ci.yml) and mypy.ini;
# keep this script aligned with that version rather than picking a newer one,
# so "works locally" and "works in CI" mean the same interpreter.
if command -v python3.11 &>/dev/null; then
    PYTHON=python3.11
elif command -v python3 &>/dev/null; then
    PYTHON=python3
    echo "Warning: python3.11 not found; falling back to $($PYTHON --version 2>&1)." \
         "CI runs on Python 3.11 - behaviour may differ on a newer/older interpreter."
else
    echo "python3 not found"
    exit 1
fi

echo "Using: $($PYTHON --version)"
echo "Creating venv at $VENV_DIR ..."
rm -rf "$VENV_DIR"
"$PYTHON" -m venv "$VENV_DIR"
source "$VENV_DIR/bin/activate"
echo "Installing requirements..."
pip install -r requirements.txt
echo "Done. Activate with: source $VENV_DIR/bin/activate"
echo "Then run: python manage.py runserver"
