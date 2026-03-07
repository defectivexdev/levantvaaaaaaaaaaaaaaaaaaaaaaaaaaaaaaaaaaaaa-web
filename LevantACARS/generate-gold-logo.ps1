Add-Type -AssemblyName System.Drawing

$outputPng = "c:\Users\Administrator\Desktop\Levant Virtual Airlines\LevantACARS\LevantACARS\Assets\logo.png"
$outputIco = "c:\Users\Administrator\Desktop\Levant Virtual Airlines\LevantACARS\LevantACARS\Assets\favicon.ico"

# Create a 512x512 bitmap for the logo
$size = 512
$bitmap = New-Object System.Drawing.Bitmap $size, $size
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)

# Enable high-quality rendering
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

# Fill with dark blue/navy background
$darkBlue = [System.Drawing.Color]::FromArgb(255, 15, 23, 42)  # #0F172A
$graphics.Clear($darkBlue)

# Define gold/yellow colors
$gold = [System.Drawing.Color]::FromArgb(255, 234, 179, 8)     # #EAB308 - bright gold
$lightGold = [System.Drawing.Color]::FromArgb(255, 250, 204, 21) # #FACC15 - light gold
$blue = [System.Drawing.Color]::FromArgb(255, 59, 130, 246)    # #3B82F6 - blue accent

# Create pens and brushes
$goldPen = New-Object System.Drawing.Pen($gold, 8)
$goldBrush = New-Object System.Drawing.SolidBrush($gold)
$lightGoldBrush = New-Object System.Drawing.SolidBrush($lightGold)
$bluePen = New-Object System.Drawing.Pen($blue, 6)

# Center point
$centerX = $size / 2
$centerY = $size / 2

# Draw circular background with gradient effect
$circleSize = 420
$circleRect = New-Object System.Drawing.Rectangle(($centerX - $circleSize/2), ($centerY - $circleSize/2), $circleSize, $circleSize)
$circleBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $circleRect,
    [System.Drawing.Color]::FromArgb(40, 234, 179, 8),
    [System.Drawing.Color]::FromArgb(10, 234, 179, 8),
    45
)
$graphics.FillEllipse($circleBrush, $circleRect)

# Draw globe circle (orbit)
$globeSize = 280
$globeRect = New-Object System.Drawing.Rectangle(($centerX - $globeSize/2), ($centerY - $globeSize/2), $globeSize, $globeSize)
$graphics.DrawEllipse($bluePen, $globeRect)

# Draw diagonal orbit line
$orbitPen = New-Object System.Drawing.Pen($lightGold, 5)
$graphics.DrawEllipse($orbitPen, ($centerX - $globeSize/2 - 10), ($centerY - $globeSize/2 + 30), $globeSize + 20, ($globeSize - 60))

# Draw airplane silhouette (simplified)
# Fuselage
$fuselagePoints = @(
    (New-Object System.Drawing.Point(($centerX - 80), $centerY)),
    (New-Object System.Drawing.Point(($centerX + 100), ($centerY - 5))),
    (New-Object System.Drawing.Point(($centerX + 100), ($centerY + 5))),
    (New-Object System.Drawing.Point(($centerX - 80), $centerY))
)
$graphics.FillPolygon($goldBrush, $fuselagePoints)

# Wings
$wingPoints = @(
    (New-Object System.Drawing.Point(($centerX - 20), ($centerY - 5))),
    (New-Object System.Drawing.Point(($centerX - 60), ($centerY - 80))),
    (New-Object System.Drawing.Point(($centerX - 40), ($centerY - 80))),
    (New-Object System.Drawing.Point(($centerX + 10), ($centerY - 5)))
)
$graphics.FillPolygon($lightGoldBrush, $wingPoints)

# Tail
$tailPoints = @(
    (New-Object System.Drawing.Point(($centerX - 75), ($centerY - 3))),
    (New-Object System.Drawing.Point(($centerX - 90), ($centerY - 50))),
    (New-Object System.Drawing.Point(($centerX - 70), ($centerY - 50))),
    (New-Object System.Drawing.Point(($centerX - 60), ($centerY - 3)))
)
$graphics.FillPolygon($goldBrush, $tailPoints)

# Draw text "LEVANT ACARS"
$font = New-Object System.Drawing.Font("Arial", 48, [System.Drawing.FontStyle]::Bold)
$textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$text = "LEVANT"
$textSize = $graphics.MeasureString($text, $font)
$graphics.DrawString($text, $font, $textBrush, ($centerX - $textSize.Width/2), ($centerY + 140))

$smallFont = New-Object System.Drawing.Font("Arial", 32, [System.Drawing.FontStyle]::Bold)
$text2 = "ACARS"
$textSize2 = $graphics.MeasureString($text2, $smallFont)
$graphics.DrawString($text2, $smallFont, $textBrush, ($centerX - $textSize2.Width/2), ($centerY + 195))

# Cleanup
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
    $iconGraphics.DrawImage($bitmap, 0, 0, $iconSize, $iconSize)
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

Write-Host "Created favicon.ico: $outputIco"
Write-Host "Icon sizes: $($iconSizes -join ', ') pixels"
Write-Host ""
Write-Host "Gold-colored ACARS logo generated successfully!"
