@echo off
echo Installing Auto-Start Session Tracker for Cursor...
echo.

REM Get the current directory
set "SCRIPT_DIR=%~dp0"
set "TRACKER_SCRIPT=%SCRIPT_DIR%start-auto-tracker.bat"

REM Create startup folder path
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "STARTUP_LINK=%STARTUP_FOLDER%\Auto-Start-Session-Tracker.bat"

echo Installing to Windows Startup folder...
echo Source: %TRACKER_SCRIPT%
echo Target: %STARTUP_LINK%
echo.

REM Copy the batch file to startup folder
copy "%TRACKER_SCRIPT%" "%STARTUP_LINK%" >nul 2>nul

if %ERRORLEVEL% EQU 0 (
    echo ✅ Auto-Start Session Tracker installed successfully!
    echo.
    echo The tracker will now start automatically when Windows boots.
    echo It will monitor for Cursor and start the session tracker automatically.
    echo.
    echo To uninstall, delete the file from:
    echo %STARTUP_LINK%
    echo.
) else (
    echo ❌ Failed to install auto-start tracker.
    echo Please run this script as administrator.
    echo.
)

REM Ask if user wants to start it now
set /p START_NOW="Do you want to start the auto-start tracker now? (y/n): "
if /i "%START_NOW%"=="y" (
    echo.
    echo Starting auto-start tracker...
    start "" "%TRACKER_SCRIPT%"
) else (
    echo.
    echo Auto-start tracker will start automatically on next Windows boot.
)

echo.
pause
