# PowerShell script to quickly update progress.md
# Usage: .\Update-Progress.ps1 -Title "Title" -Status "Status" -Description "Description" -Category "Category"

param(
    [Parameter(Mandatory=$true)]
    [string]$Title,

    [Parameter(Mandatory=$true)]
    [ValidateSet("completed", "in_progress", "pending", "blocked")]
    [string]$Status,

    [Parameter(Mandatory=$true)]
    [string]$Description,

    [Parameter(Mandatory=$false)]
    [ValidateSet("setup", "development", "testing", "deployment", "documentation", "mcp", "infrastructure")]
    [string]$Category = "development",

    [Parameter(Mandatory=$false)]
    [string[]]$Features = @(),

    [Parameter(Mandatory=$false)]
    [string[]]$Problems = @(),

    [Parameter(Mandatory=$false)]
    [string[]]$Solutions = @()
)

# Convert arrays to JSON strings for the Node.js script
$featuresJson = $Features | ConvertTo-Json -Compress
$problemsJson = $Problems | ConvertTo-Json -Compress
$solutionsJson = $Solutions | ConvertTo-Json -Compress

# Call the Node.js script
node update-progress.js $Title $Status $Description $Category $featuresJson $problemsJson $solutionsJson

Write-Host "Progress updated successfully!" -ForegroundColor Green
