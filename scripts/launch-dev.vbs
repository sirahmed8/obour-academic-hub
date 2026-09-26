Set WshShell = CreateObject("WScript.Shell")
projectDir = "D:\Projects\Obour Academic Hub"
WshShell.CurrentDirectory = projectDir
command = "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & projectDir & "\scripts\launch-dev.ps1"""
WshShell.Run command, 0, False
