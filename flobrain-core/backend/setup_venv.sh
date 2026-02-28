#!/bin/bash
# Create a fresh venv for the backend and install requirements.
# Run from backend/:  bash setup_venv.sh

set -e
BACKEND_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV_DIR="$BACKEND_DIR/.venv"

# Use system Python 3 (framework or Homebrew)
if command -v python3.12 &>/dev/null; then
    PYTHON=python3.12
elif command -v python3 &>/dev/null; then
    PYTHON=python3
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
