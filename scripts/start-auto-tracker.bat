@echo off
echo Starting Auto-Start Session Tracker...
echo.
echo This will automatically start the session tracker when Cursor is launched.
echo The tracker will monitor for Cursor processes and start automatically.
echo.
echo Press Ctrl+C to stop the auto-start tracker.
echo.

REM Check if Node.js is available
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js not found. Please install Node.js to use the auto-start tracker.
    echo You can download it from: https://nodejs.org/
    pause
    exit /b 1
)

REM Start the auto-start tracker
echo Starting auto-start tracker...
node "%~dp0auto-start-tracker.js"

pause
