# Auto-Start Session Tracker for Cursor - PowerShell Version
# This script automatically starts the session tracker when Cursor is launched

param(
    [Parameter(Mandatory=$false)]
    [switch]$Background
)

# Check if Node.js is available
try {
    $nodeVersion = node --version 2>$null
    if (-not $nodeVersion) {
        throw "Node.js not found"
    }
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js to use the auto-start tracker." -ForegroundColor Red
    Write-Host "You can download it from: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Function to check if Cursor is running
function Test-CursorRunning {
    try {
        $cursorProcess = Get-Process -Name "Cursor" -ErrorAction SilentlyContinue
        return $cursorProcess -ne $null
    } catch {
        return $false
    }
}

# Function to start session tracker
function Start-SessionTracker {
    try {
        $trackerScript = Join-Path $PSScriptRoot "session-exit-tracker.js"

        if (-not (Test-Path $trackerScript)) {
            Write-Host "❌ Session tracker script not found: $trackerScript" -ForegroundColor Red
            return $null
        }

        Write-Host "🚀 Starting session tracker..." -ForegroundColor Green
        $process = Start-Process -FilePath "node" -ArgumentList $trackerScript -PassThru -WindowStyle Hidden

        return $process
    } catch {
        Write-Host "❌ Failed to start session tracker: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Function to stop session tracker
function Stop-SessionTracker {
    param([System.Diagnostics.Process]$Process)

    if ($Process -and -not $Process.HasExited) {
        Write-Host "📝 Stopping session tracker..." -ForegroundColor Yellow
        $Process.Kill()
        $Process.WaitForExit(5000)
    }
}

# Main monitoring loop
function Start-CursorMonitoring {
    $trackerProcess = $null
    $isRunning = $false
    $lastCursorState = $false

    Write-Host "🚀 Auto-Start Session Tracker initialized" -ForegroundColor Green
    Write-Host "📅 Waiting for Cursor to start..." -ForegroundColor Yellow

    try {
        while ($true) {
            $cursorRunning = Test-CursorRunning

            if ($cursorRunning -and -not $isRunning) {
                Write-Host "✅ Cursor detected - Starting session tracker" -ForegroundColor Green
                $trackerProcess = Start-SessionTracker
                $isRunning = $true
                $lastCursorState = $true
            } elseif (-not $cursorRunning -and $isRunning) {
                Write-Host "🔄 Cursor closed - Session tracker will continue running" -ForegroundColor Yellow
                $lastCursorState = $false

                # Keep tracker running for a bit in case Cursor restarts
                Start-Sleep -Seconds 10
                $stillRunning = Test-CursorRunning
                if (-not $stillRunning) {
                    Write-Host "📝 Cursor session ended - Tracker will prompt for work log update" -ForegroundColor Cyan
                }
            }

            Start-Sleep -Seconds 5
        }
    } catch {
        Write-Host "❌ Error in monitoring loop: $($_.Exception.Message)" -ForegroundColor Red
    } finally {
        # Cleanup
        if ($trackerProcess) {
            Stop-SessionTracker -Process $trackerProcess
        }
    }
}

# Set up exit handler
$null = Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action {
    Write-Host "`n🔄 Auto-start tracker exiting..." -ForegroundColor Yellow
}

# Start monitoring
if ($Background) {
    Write-Host "🔄 Starting auto-start tracker in background..." -ForegroundColor Green
    Start-CursorMonitoring
} else {
    Write-Host "🔄 Starting auto-start tracker..." -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop the auto-start tracker." -ForegroundColor Yellow
    Write-Host ""

    try {
        Start-CursorMonitoring
    } catch {
        Write-Host "❌ Auto-start tracker stopped: $($_.Exception.Message)" -ForegroundColor Red
    }
}
