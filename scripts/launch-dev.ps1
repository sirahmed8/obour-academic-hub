# Obour Academic Hub - Background Dev Server Launcher
$projectDir = "D:\Projects\Obour Academic Hub"
$port = 3000
$url = "http://localhost:$port"

# Helper function to check if port 3000 is actively listening
function Test-PortListening {
    param([int]$p)
    $tcp = [System.Net.Sockets.TcpClient]::new()
    try {
        $ar = $tcp.BeginConnect("127.0.0.1", $p, $null, $null)
        $ok = $ar.AsyncWaitHandle.WaitOne(400, $false)
        if ($ok) {
            $tcp.EndConnect($ar)
            $tcp.Close()
            return $true
        }
        $tcp.Close()
    } catch {
        try { $tcp.Close() } catch {}
    }
    return $false
}

# 1. If already listening, open browser immediately
if (Test-PortListening $port) {
    Start-Process $url
    exit 0
}

# 2. Launch 'npm run dev' silently in the background
$startInfo = [System.Diagnostics.ProcessStartInfo]::new()
$startInfo.FileName = "cmd.exe"
$startInfo.Arguments = "/c npm run dev"
$startInfo.WorkingDirectory = $projectDir
$startInfo.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
$startInfo.UseShellExecute = $true

[System.Diagnostics.Process]::Start($startInfo) | Out-Null

# 3. Wait for the server to bind to port 3000 (up to 40 seconds)
$maxAttempts = 80
$attempt = 0
$serverReady = $false

while ($attempt -lt $maxAttempts) {
    Start-Sleep -Milliseconds 500
    $attempt++
    
    if (Test-PortListening $port) {
        $serverReady = $true
        break
    }
}

# 4. Once port is open, wait a moment for route compilation, then launch browser
if ($serverReady) {
    Start-Sleep -Milliseconds 600
    Start-Process $url
} else {
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.MessageBox]::Show(
        "Obour Academic Hub dev server is taking longer than usual to start. You can check http://localhost:3000 in your browser.",
        "Obour Academic Hub",
        [System.Windows.Forms.MessageBoxButtons]::OK,
        [System.Windows.Forms.MessageBoxIcon]::Information
    )
}
