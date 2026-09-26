# Obour Academic Hub - Stop Dev Server Script
param([switch]$Quiet)
$port = 3000
$stopped = $false

# 1. Kill process listening on port 3000 via netstat PID matching
try {
    $lines = netstat -ano | Select-String ":$port\s+"
    foreach ($line in $lines) {
        if ($line.Line -match '\s+(\d+)$') {
            $pidToKill = [int]$matches[1]
            if ($pidToKill -gt 0) {
                try {
                    $proc = Get-Process -Id $pidToKill -ErrorAction SilentlyContinue
                    if ($proc -and ($proc.ProcessName -eq "node" -or $proc.ProcessName -eq "cmd")) {
                        Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
                        $stopped = $true
                    }
                } catch {}
            }
        }
    }
} catch {}

# 2. Terminate any node processes running Next.js dev server for this project
try {
    $nodes = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" -ErrorAction SilentlyContinue
    foreach ($proc in $nodes) {
        if ($proc.CommandLine -like "*next*dev*" -or $proc.CommandLine -like "*Obour Academic Hub*") {
            Stop-Process -Id $proc.ProcessId -Force -ErrorAction SilentlyContinue
            $stopped = $true
        }
    }
} catch {}

# 3. User feedback
if (-not $Quiet) {
    Add-Type -AssemblyName System.Windows.Forms
    if ($stopped) {
        [System.Windows.Forms.MessageBox]::Show(
            "Obour Academic Hub Dev Server has been stopped successfully.",
            "Obour Academic Hub",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Information
        )
    } else {
        [System.Windows.Forms.MessageBox]::Show(
            "No running dev server was found on port $port.",
            "Obour Academic Hub",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Information
        )
    }
}
Write-Output "Stop script completed. Stopped: $stopped"
