Add-Type -AssemblyName System.Drawing

$projectDir = "D:\Projects\Obour Academic Hub"
$pngPath = Join-Path $projectDir "public\obour-logo.png"
$icoPath = Join-Path $projectDir "public\obour-logo.ico"

if (-not (Test-Path $pngPath)) {
    Write-Error "Source PNG not found at $pngPath"
    exit 1
}

$sizes = @(256, 128, 64, 48, 32, 16)
$sourceImg = [System.Drawing.Image]::FromFile($pngPath)
$msList = [System.Collections.Generic.List[System.IO.MemoryStream]]::new()

foreach ($sz in $sizes) {
    $bmp = [System.Drawing.Bitmap]::new($sz, $sz)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($sourceImg, 0, 0, $sz, $sz)
    $g.Dispose()
    
    $ms = [System.IO.MemoryStream]::new()
    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    $msList.Add($ms)
}
$sourceImg.Dispose()

$fs = [System.IO.File]::Create($icoPath)
$bw = [System.IO.BinaryWriter]::new($fs)

# ICONDIR header (6 bytes)
$bw.Write([uint16]0)          # Reserved
$bw.Write([uint16]1)          # Type: 1 = Icon
$bw.Write([uint16]$sizes.Count) # Number of images

$offset = 6 + (16 * $sizes.Count)

# Write ICONDIRENTRY for each size
for ($i = 0; $i -lt $sizes.Count; $i++) {
    $sz = $sizes[$i]
    $data = $msList[$i].ToArray()
    
    $bWidth = if ($sz -eq 256) { [byte]0 } else { [byte]$sz }
    $bHeight = if ($sz -eq 256) { [byte]0 } else { [byte]$sz }
    
    $bw.Write([byte]$bWidth)        # Width
    $bw.Write([byte]$bHeight)       # Height
    $bw.Write([byte]0)              # Color count
    $bw.Write([byte]0)              # Reserved
    $bw.Write([uint16]1)            # Color planes
    $bw.Write([uint16]32)           # Bits per pixel
    $bw.Write([uint32]$data.Length) # Image data size in bytes
    $bw.Write([uint32]$offset)      # File offset of image data
    
    $offset += $data.Length
}

# Write image data blocks
for ($i = 0; $i -lt $sizes.Count; $i++) {
    $data = $msList[$i].ToArray()
    $bw.Write($data)
    $msList[$i].Dispose()
}

$bw.Flush()
$bw.Close()
$fs.Close()

Write-Output "ICO successfully generated at: $icoPath ($((Get-Item $icoPath).Length) bytes)"
