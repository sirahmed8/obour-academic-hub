# Obour Academic Hub - Desktop Shortcut Installer
$desktopPath = [Environment]::GetFolderPath("Desktop")
$projectDir = "D:\Projects\Obour Academic Hub"
$icoPath = Join-Path $projectDir "public\obour-logo.ico"
$launchVbs = Join-Path $projectDir "scripts\launch-dev.vbs"
$stopVbs = Join-Path $projectDir "scripts\stop-dev.vbs"
$wscriptExe = "$env:SystemRoot\System32\wscript.exe"

$wshShell = New-Object -ComObject WScript.Shell

# 1. Main Launcher Shortcut
$mainShortcutPath = Join-Path $desktopPath "Obour Academic Hub.lnk"
$shortcut = $wshShell.CreateShortcut($mainShortcutPath)
$shortcut.TargetPath = $wscriptExe
$shortcut.Arguments = "`"$launchVbs`""
$shortcut.WorkingDirectory = $projectDir
$shortcut.IconLocation = "$icoPath,0"
$shortcut.Description = "Launch Obour Academic Hub locally in background and open in browser"
$shortcut.Save()

Write-Output "Created main shortcut: $mainShortcutPath"

# 2. Stop Server Shortcut
$stopShortcutPath = Join-Path $desktopPath "Stop Obour Hub.lnk"
$stopShortcut = $wshShell.CreateShortcut($stopShortcutPath)
$stopShortcut.TargetPath = $wscriptExe
$stopShortcut.Arguments = "`"$stopVbs`""
$stopShortcut.WorkingDirectory = $projectDir
$stopShortcut.IconLocation = "$env:SystemRoot\System32\shell32.dll,27"
$stopShortcut.Description = "Stop background Obour Academic Hub dev server"
$stopShortcut.Save()

Write-Output "Created stop shortcut: $stopShortcutPath"
