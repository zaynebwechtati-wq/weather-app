#!/usr/bin/env bash
# Create the virtualenv if needed, install dependencies, start the app.
# Usage: ./run.sh [extra uvicorn args...]
set -euo pipefail

cd "$(dirname "$0")"

PYTHON=${PYTHON:-python3}
VENV=.venv
HOST=${HOST:-127.0.0.1}
PORT=${PORT:-8000}

# numpy==2.5.1 / pandas==3.0.3 in requirements.txt need Python 3.12+
required="3.12"
have=$("$PYTHON" -c 'import sys; print("%d.%d" % sys.version_info[:2])')
if [ "$(printf '%s\n%s\n' "$required" "$have" | sort -V | head -1)" != "$required" ]; then
    echo "Python $required+ required, found $have." >&2
    echo "Set PYTHON=/path/to/python3.12 and retry." >&2
    exit 1
fi

if [ ! -d "$VENV" ]; then
    echo "==> Creating virtualenv in $VENV"
    "$PYTHON" -m venv "$VENV"
fi

echo "==> Installing dependencies"
"$VENV/bin/pip" install --quiet --upgrade pip
"$VENV/bin/pip" install --quiet -r requirements.txt

echo "==> Starting on http://$HOST:$PORT  (Ctrl+C to stop)"
exec "$VENV/bin/uvicorn" backend.app.main:app --host "$HOST" --port "$PORT" "$@"
