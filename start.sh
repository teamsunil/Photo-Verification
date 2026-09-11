#!/bin/bash
# Starts a local server for the PhotoVerify POC and opens it in the browser.
# Usage: ./start.sh   (or: bash start.sh)

cd "$(dirname "$0")"
PORT=8000

echo "Starting local server at http://localhost:$PORT ..."
echo "Press Ctrl+C to stop the server when you're done."

( sleep 1 && (
    if command -v open >/dev/null 2>&1; then open "http://localhost:$PORT/register.html";
    elif command -v xdg-open >/dev/null 2>&1; then xdg-open "http://localhost:$PORT/register.html";
    fi
  ) ) &

if command -v python3 >/dev/null 2>&1; then
  python3 -m http.server $PORT
elif command -v python >/dev/null 2>&1; then
  python -m http.server $PORT
else
  echo "Python not found. Please install Python, or serve this folder with any static file server."
  exit 1
fi
