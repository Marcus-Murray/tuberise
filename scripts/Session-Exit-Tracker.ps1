# Session Exit Tracker - PowerShell Version
# Automated Work Log Updates for Windows

param(
    [Parameter(Mandatory=$false)]
    [string]$SessionType = "development"
)

# Session tracking variables
$sessionStartTime = Get-Date
$sessionEndTime = $null
$sessionDuration = $null

# File paths (relative to project root)
$projectRoot = Split-Path -Parent $PSScriptRoot
$workLogFile = Join-Path $projectRoot "process-status.md"
$progressFile = Join-Path $projectRoot "progress.md"

# Function to format duration
function Format-Duration {
    param([TimeSpan]$duration)

    if ($duration.TotalHours -ge 1) {
        return "{0}h {1}m {2}s" -f [int]$duration.TotalHours, $duration.Minutes, $duration.Seconds
    } elseif ($duration.TotalMinutes -ge 1) {
        return "{0}m {1}s" -f [int]$duration.TotalMinutes, $duration.Seconds
    } else {
        return "{0}s" -f [int]$duration.TotalSeconds
    }
}

# Function to show work log popup
function Show-WorkLogPopup {
    $sessionEndTime = Get-Date
    $sessionDuration = $sessionEndTime - $sessionStartTime

    Write-Host ""
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host "📝 WORK LOG UPDATE REQUIRED" -ForegroundColor Yellow
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host "⏱️  Session Duration: $(Format-Duration $sessionDuration)" -ForegroundColor Green

    # Prompt for session information
    $sessionSummary = Read-Host "📋 Session Summary (what was accomplished)"
    $features = Read-Host "🔧 Features Implemented (comma-separated)"
    $problems = Read-Host "🚨 Problems Encountered (comma-separated, or 'none')"
    $solutions = Read-Host "✅ Solutions Implemented (comma-separated, or 'none')"
    $nextSteps = Read-Host "🚀 Next Steps (comma-separated)"
    $status = Read-Host "📊 Session Status (completed/in_progress/blocked)"

    # Validate status
    $validStatuses = @("completed", "in_progress", "blocked")
    if ($validStatuses -notcontains $status.ToLower()) {
        Write-Host "⚠️  Invalid status, defaulting to 'completed'" -ForegroundColor Yellow
        $status = "completed"
    }

    # Parse comma-separated values
    $featuresList = if ($features.ToLower() -eq "none") { @() } else { $features -split "," | ForEach-Object { $_.Trim() } | Where-Object { $_ } }
    $problemsList = if ($problems.ToLower() -eq "none") { @() } else { $problems -split "," | ForEach-Object { $_.Trim() } | Where-Object { $_ } }
    $solutionsList = if ($solutions.ToLower() -eq "none") { @() } else { $solutions -split "," | ForEach-Object { $_.Trim() } | Where-Object { $_ } }
    $nextStepsList = $nextSteps -split "," | ForEach-Object { $_.Trim() } | Where-Object { $_ }

    # Update work logs
    Update-WorkLogs -SessionSummary $sessionSummary -Features $featuresList -Problems $problemsList -Solutions $solutionsList -NextSteps $nextStepsList -Status $status.ToLower()

    Write-Host ""
    Write-Host "✅ Work logs updated successfully!" -ForegroundColor Green
}

# Function to update work logs
function Update-WorkLogs {
    param(
        [string]$SessionSummary,
        [string[]]$Features,
        [string[]]$Problems,
        [string[]]$Solutions,
        [string[]]$NextSteps,
        [string]$Status
    )

    $timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ"

    # Update progress.md
    Update-ProgressFile -SessionSummary $SessionSummary -Features $Features -Problems $Problems -Solutions $Solutions -NextSteps $NextSteps -Status $Status -Timestamp $timestamp

    # Update process-status.md
    Update-ProcessStatusFile -SessionSummary $SessionSummary -Features $Features -Problems $Problems -Solutions $Solutions -NextSteps $NextSteps -Status $Status -Timestamp $timestamp

    # Create session summary file
    Create-SessionSummary -SessionSummary $SessionSummary -Features $Features -Problems $Problems -Solutions $Solutions -NextSteps $NextSteps -Status $Status -Timestamp $timestamp
}

# Function to update progress.md
function Update-ProgressFile {
    param(
        [string]$SessionSummary,
        [string[]]$Features,
        [string[]]$Problems,
        [string[]]$Solutions,
        [string[]]$NextSteps,
        [string]$Status,
        [string]$Timestamp
    )

    $content = ""

    if (Test-Path $progressFile) {
        $content = Get-Content $progressFile -Raw
    } else {
        $content = "# Project Progress Tracker`n`n**Project:** Tuberise Analytics`n**Last Updated:** $Timestamp`n`n---`n`n"
    }

    $statusEmoji = @{
        "completed" = "✅"
        "in_progress" = "🔄"
        "blocked" = "🚫"
    }

    $featuresText = if ($Features.Count -gt 0) { "**Features Implemented:**`n" + ($Features | ForEach-Object { "- $_" }) -join "`n" + "`n`n" } else { "" }
    $problemsText = if ($Problems.Count -gt 0) { "**Problems Encountered:**`n" + ($Problems | ForEach-Object { "- $_" }) -join "`n" + "`n`n" } else { "" }
    $solutionsText = if ($Solutions.Count -gt 0) { "**Solutions Implemented:**`n" + ($Solutions | ForEach-Object { "- $_" }) -join "`n" + "`n`n" } else { "" }
    $nextStepsText = if ($NextSteps.Count -gt 0) { "**Next Steps:**`n" + ($NextSteps | ForEach-Object { "- $_" }) -join "`n" + "`n`n" } else { "" }

    $newEntry = @"

## $($statusEmoji[$Status]) Session Work Log - $(Get-Date -Format "yyyy-MM-dd")

**Status:** $($Status.ToUpper())
**Category:** documentation
**Date:** $(Get-Date -Format "yyyy-MM-dd")
**Duration:** $(Format-Duration $sessionDuration)
**Description:** $SessionSummary

$featuresText$problemsText$solutionsText$nextStepsText---
"@

    # Update the last updated timestamp
    $content = $content -replace "\*\*Last Updated:\*\* .*", "**Last Updated:** $Timestamp"

    # Add new entry
    $content += $newEntry

    Set-Content -Path $progressFile -Value $content -Encoding UTF8
}

# Function to update process-status.md
function Update-ProcessStatusFile {
    param(
        [string]$SessionSummary,
        [string[]]$Features,
        [string[]]$Problems,
        [string[]]$Solutions,
        [string[]]$NextSteps,
        [string]$Status,
        [string]$Timestamp
    )

    $content = ""

    if (Test-Path $workLogFile) {
        $content = Get-Content $workLogFile -Raw
    } else {
        $content = "# Process Status & Work Log`n`n## Project Overview`n**Project:** Tuberise Analytics`n**Session Date:** $(Get-Date -Format 'yyyy-MM-dd')`n**Status:** $($Status.ToUpper())`n`n---`n`n"
    }

    $featuresText = if ($Features.Count -gt 0) { $Features | ForEach-Object { "- $_" } | Out-String } else { "- None" }
    $problemsText = if ($Problems.Count -gt 0) { $Problems | ForEach-Object { "- $_" } | Out-String } else { "- None" }
    $solutionsText = if ($Solutions.Count -gt 0) { $Solutions | ForEach-Object { "- $_" } | Out-String } else { "- None" }
    $nextStepsText = if ($NextSteps.Count -gt 0) { $NextSteps | ForEach-Object { "- $_" } | Out-String } else { "- None" }

    $sessionEntry = @"

## 📋 Session Summary - $(Get-Date -Format "yyyy-MM-dd")

**Session Duration:** $(Format-Duration $sessionDuration)
**Status:** $($Status.ToUpper())
**Summary:** $SessionSummary

### 🔧 Features Implemented:
$featuresText
### 🚨 Problems Encountered:
$problemsText
### ✅ Solutions Implemented:
$solutionsText
### 🚀 Next Steps:
$nextStepsText

---

"@

    # Update the last updated timestamp
    $content = $content -replace "\*\*Last Updated:\*\* .*", "**Last Updated:** $Timestamp"

    # Add new entry
    $content += $sessionEntry

    Set-Content -Path $workLogFile -Value $content -Encoding UTF8
}

# Function to create session summary
function Create-SessionSummary {
    param(
        [string]$SessionSummary,
        [string[]]$Features,
        [string[]]$Problems,
        [string[]]$Solutions,
        [string[]]$NextSteps,
        [string]$Status,
        [string]$Timestamp
    )

    $summaryFile = Join-Path $projectRoot "session-summary-$(Get-Date -Format 'yyyy-MM-dd').md"

    $featuresText = if ($Features.Count -gt 0) { $Features | ForEach-Object { "- $_" } | Out-String } else { "- None" }
    $problemsText = if ($Problems.Count -gt 0) { $Problems | ForEach-Object { "- $_" } | Out-String } else { "- None" }
    $solutionsText = if ($Solutions.Count -gt 0) { $Solutions | ForEach-Object { "- $_" } | Out-String } else { "- None" }
    $nextStepsText = if ($NextSteps.Count -gt 0) { $NextSteps | ForEach-Object { "- $_" } | Out-String } else { "- None" }

    $summaryContent = @"
# Session Summary - $(Get-Date -Format "yyyy-MM-dd")

**Session Duration:** $(Format-Duration $sessionDuration)
**Status:** $($Status.ToUpper())
**Timestamp:** $Timestamp

## 📋 Summary
$SessionSummary

## 🔧 Features Implemented
$featuresText
## 🚨 Problems Encountered
$problemsText
## ✅ Solutions Implemented
$solutionsText
## 🚀 Next Steps
$nextStepsText

---

*Generated automatically by Session Exit Tracker*
"@

    Set-Content -Path $summaryFile -Value $summaryContent -Encoding UTF8
}

# Main execution
Write-Host "🔄 Session Exit Tracker initialized" -ForegroundColor Green
Write-Host "📅 Session started: $($sessionStartTime.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor Green
Write-Host "💡 Press Ctrl+C or close Cursor to trigger work log update" -ForegroundColor Yellow

# Set up exit handler
$null = Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action {
    Show-WorkLogPopup
}

# Keep the script running
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} catch {
    Show-WorkLogPopup
}
