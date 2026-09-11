@echo off
REM Starts a local server for the PhotoVerify POC and opens it in the browser.
REM Usage: double-click start.bat

cd /d "%~dp0"
set PORT=8000

echo Starting local server at http://localhost:%PORT% ...
echo Press Ctrl+C in this window to stop the server when you're done.

start "" http://localhost:%PORT%/register.html

where python >nul 2>nul
if %errorlevel%==0 (
    python -m http.server %PORT%
) else (
    where python3 >nul 2>nul
    if %errorlevel%==0 (
        python3 -m http.server %PORT%
    ) else (
        echo Python not found. Please install Python from https://python.org and try again.
        pause
    )
)
