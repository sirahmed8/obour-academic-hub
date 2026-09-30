# scripts/clean-project.ps1
# Deep Workspace & Disk Cleanup Utility
# Safely purges build caches, transient artifacts, and optimizes git repository

param(
    [switch]$SkipGitGc = $false
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Deep Project Disk Cleanup Utility      " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

function Get-PathSizeInMB($path) {
    if (Test-Path $path) {
        $measure = Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum
        if ($measure.Sum) {
            return [math]::Round($measure.Sum / 1MB, 2)
        }
    }
    return 0
}

$driveName = (Get-Location).Drive.Name
$initialFree = (Get-PSDrive -Name $driveName).Free

$targets = @(
    ".next\dev",
    ".next\cache",
    "node_modules\.cache",
    ".vs",
    ".idea",
    "coverage",
    "tsconfig.tsbuildinfo",
    "firebase-debug.log"
)

$freedMB = 0

foreach ($target in $targets) {
    $fullPath = Join-Path $projectRoot $target
    if (Test-Path $fullPath) {
        $size = Get-PathSizeInMB $fullPath
        Write-Host "Purging: $target ($size MB)..." -ForegroundColor Yellow
        Remove-Item -Path $fullPath -Recurse -Force -ErrorAction SilentlyContinue
        $freedMB += $size
    }
}

# Remove stray log files outside node_modules
Get-ChildItem -Path $projectRoot -Filter "*.log" -File -Recurse -Force -ErrorAction SilentlyContinue | ForEach-Object {
    if ($_.FullName -notmatch "node_modules") {
        Write-Host "Deleting log: $($_.Name)" -ForegroundColor Yellow
        Remove-Item $_.FullName -Force -ErrorAction SilentlyContinue
    }
}

if (-not $SkipGitGc) {
    Write-Host "Optimizing git repository database (git gc --prune=now)..." -ForegroundColor Yellow
    git gc --prune=now --quiet
}

$finalFree = (Get-PSDrive -Name $driveName).Free
$totalFreedGB = [math]::Round(($finalFree - $initialFree) / 1GB, 2)

Write-Host "------------------------------------------" -ForegroundColor Green
Write-Host "Cleanup completed successfully!" -ForegroundColor Green
Write-Host "Approx. space freed: $totalFreedGB GB" -ForegroundColor Green
Write-Host "Current Drive Free Space: $([math]::Round($finalFree / 1GB, 2)) GB" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
