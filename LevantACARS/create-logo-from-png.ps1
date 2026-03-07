Add-Type -AssemblyName System.Drawing

$sourceImage = "C:\Users\Administrator\Downloads\aaa.png"
$outputPng = "c:\Users\Administrator\Desktop\Levant Virtual Airlines\LevantACARS\LevantACARS\Assets\logo.png"
$outputIco = "c:\Users\Administrator\Desktop\Levant Virtual Airlines\LevantACARS\LevantACARS\Assets\favicon.ico"

# Load the source image
$img = [System.Drawing.Image]::FromFile($sourceImage)

# Create logo.png (512x512 for high quality)
$size = 512
$bitmap = New-Object System.Drawing.Bitmap $size, $size
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$graphics.Clear([System.Drawing.Color]::Transparent)
$graphics.DrawImage($img, 0, 0, $size, $size)
$graphics.Dispose()

# Save PNG
$bitmap.Save($outputPng, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Created logo.png: $outputPng"

# Create multi-resolution ICO
$iconSizes = @(256, 128, 64, 48, 32, 16)
$iconBitmaps = @()

foreach ($iconSize in $iconSizes) {
    $iconBitmap = New-Object System.Drawing.Bitmap $iconSize, $iconSize
    $iconGraphics = [System.Drawing.Graphics]::FromImage($iconBitmap)
    $iconGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $iconGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $iconGraphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $iconGraphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $iconGraphics.Clear([System.Drawing.Color]::Transparent)
    $iconGraphics.DrawImage($img, 0, 0, $iconSize, $iconSize)
    $iconGraphics.Dispose()
    $iconBitmaps += $iconBitmap
}

# Create ICO file
$iconStreams = @()
foreach ($iconBitmap in $iconBitmaps) {
    $pngStream = New-Object System.IO.MemoryStream
    $iconBitmap.Save($pngStream, [System.Drawing.Imaging.ImageFormat]::Png)
    $iconStreams += $pngStream.ToArray()
}

$fs = [System.IO.File]::Create($outputIco)

# ICONDIR header
$iconDir = [byte[]]::new(6)
$iconDir[0] = 0
$iconDir[1] = 0
$iconDir[2] = 1
$iconDir[3] = 0
[BitConverter]::GetBytes([int16]$iconSizes.Length).CopyTo($iconDir, 4)
$fs.Write($iconDir, 0, 6)

# Calculate offset
$offset = 6 + ($iconSizes.Length * 16)

# Write entries
for ($i = 0; $i -lt $iconSizes.Length; $i++) {
    $entry = [byte[]]::new(16)
    
    if ($iconSizes[$i] -eq 256) {
        $entry[0] = 0
        $entry[1] = 0
    } else {
        $entry[0] = [byte]$iconSizes[$i]
        $entry[1] = [byte]$iconSizes[$i]
    }
    
    $entry[2] = 0
    $entry[3] = 0
    [BitConverter]::GetBytes([int16]1).CopyTo($entry, 4)
    [BitConverter]::GetBytes([int16]32).CopyTo($entry, 6)
    [BitConverter]::GetBytes([int32]$iconStreams[$i].Length).CopyTo($entry, 8)
    [BitConverter]::GetBytes([int32]$offset).CopyTo($entry, 12)
    
    $fs.Write($entry, 0, 16)
    $offset += $iconStreams[$i].Length
}

# Write image data
foreach ($stream in $iconStreams) {
    $fs.Write($stream, 0, $stream.Length)
}

$fs.Close()

# Cleanup
foreach ($iconBitmap in $iconBitmaps) {
    $iconBitmap.Dispose()
}
$bitmap.Dispose()
$img.Dispose()

Write-Host "Created favicon.ico: $outputIco"
Write-Host "Icon sizes: $($iconSizes -join ', ') pixels"
Write-Host ""
Write-Host "Logo and favicon created successfully from aaa.png!"
