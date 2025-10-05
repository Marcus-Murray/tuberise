@echo off
echo Starting Session Exit Tracker...
echo.
echo This will monitor your Cursor session and prompt for work log updates when you exit.
echo Press Ctrl+C to stop the tracker.
echo.

REM Check if Node.js is available
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js not found. Using PowerShell version...
    powershell -ExecutionPolicy Bypass -File "%~dp0Session-Exit-Tracker.ps1"
) else (
    echo Using Node.js version...
    node "%~dp0session-exit-tracker.js"
)

pause
