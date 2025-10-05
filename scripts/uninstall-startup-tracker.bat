@echo off
echo Uninstalling Auto-Start Session Tracker for Cursor...
echo.

REM Get startup folder path
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "STARTUP_LINK=%STARTUP_FOLDER%\Auto-Start-Session-Tracker.bat"

echo Removing from Windows Startup folder...
echo Target: %STARTUP_LINK%
echo.

REM Check if file exists
if exist "%STARTUP_LINK%" (
    del "%STARTUP_LINK%" >nul 2>nul

    if %ERRORLEVEL% EQU 0 (
        echo ✅ Auto-Start Session Tracker uninstalled successfully!
        echo.
        echo The tracker will no longer start automatically when Windows boots.
        echo.
    ) else (
        echo ❌ Failed to uninstall auto-start tracker.
        echo Please run this script as administrator.
        echo.
    )
) else (
    echo ⚠️  Auto-Start Session Tracker was not found in startup folder.
    echo It may have already been uninstalled.
    echo.
)

echo.
pause
