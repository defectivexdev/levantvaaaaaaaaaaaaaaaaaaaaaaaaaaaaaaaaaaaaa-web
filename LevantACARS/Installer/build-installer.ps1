# Levant ACARS MSI Installer Build Script
# Requires WiX Toolset 3.11+ installed

param(
    [string]$BuildPath = "..\bin\Release\net8.0-windows",
    [string]$WebUIPath = "..\frontend\out",
    [string]$OutputPath = ".\Output",
    [string]$Version = "3.0.0.0"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Levant ACARS Installer Builder" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if WiX is installed
$wixPath = "${env:WIX}bin"
if (-not (Test-Path $wixPath)) {
    Write-Host "ERROR: WiX Toolset not found!" -ForegroundColor Red
    Write-Host "Please install WiX Toolset from: https://wixtoolset.org/releases/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ WiX Toolset found at: $wixPath" -ForegroundColor Green

# Set WiX tools
$candle = Join-Path $wixPath "candle.exe"
$light = Join-Path $wixPath "light.exe"
$heat = Join-Path $wixPath "heat.exe"

# Create output directory
if (-not (Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath | Out-Null
}

Write-Host ""
Write-Host "Building installer with:" -ForegroundColor Yellow
Write-Host "  Build Path: $BuildPath" -ForegroundColor Gray
Write-Host "  Web UI Path: $WebUIPath" -ForegroundColor Gray
Write-Host "  Output Path: $OutputPath" -ForegroundColor Gray
Write-Host "  Version: $Version" -ForegroundColor Gray
Write-Host ""

# Step 1: Harvest Web UI files
Write-Host "[1/5] Harvesting Web UI files..." -ForegroundColor Cyan
& $heat dir $WebUIPath `
    -cg WebUIComponents `
    -gg `
    -scom `
    -sreg `
    -srd `
    -dr WebUIFolder `
    -var "var.WebUIPath" `
    -out "WebUI.wxs"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to harvest Web UI files" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Web UI files harvested" -ForegroundColor Green

# Step 2: Compile WiX source files
Write-Host ""
Write-Host "[2/5] Compiling WiX source files..." -ForegroundColor Cyan

$wixFiles = @("Product.wxs", "CustomUI.wxs", "WebUI.wxs")
$wixObjects = @()

foreach ($file in $wixFiles) {
    Write-Host "  Compiling $file..." -ForegroundColor Gray
    $objFile = [IO.Path]::ChangeExtension($file, ".wixobj")
    
    & $candle $file `
        -dBuildPath=$BuildPath `
        -dWebUIPath=$WebUIPath `
        -dVersion=$Version `
        -ext WixUIExtension `
        -ext WixUtilExtension `
        -out $objFile
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to compile $file" -ForegroundColor Red
        exit 1
    }
    
    $wixObjects += $objFile
}

Write-Host "✓ All source files compiled" -ForegroundColor Green

# Step 3: Link and create MSI
Write-Host ""
Write-Host "[3/5] Linking and creating MSI..." -ForegroundColor Cyan

$msiFile = Join-Path $OutputPath "LevantACARS-$Version.msi"

& $light $wixObjects `
    -ext WixUIExtension `
    -ext WixUtilExtension `
    -cultures:en-us `
    -out $msiFile

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to create MSI" -ForegroundColor Red
    exit 1
}

Write-Host "✓ MSI created successfully" -ForegroundColor Green

# Step 4: Clean up intermediate files
Write-Host ""
Write-Host "[4/5] Cleaning up..." -ForegroundColor Cyan
Remove-Item "*.wixobj" -ErrorAction SilentlyContinue
Remove-Item "*.wixpdb" -ErrorAction SilentlyContinue
Remove-Item "WebUI.wxs" -ErrorAction SilentlyContinue
Write-Host "✓ Cleanup complete" -ForegroundColor Green

# Step 5: Display results
Write-Host ""
Write-Host "[5/5] Build Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$msiInfo = Get-Item $msiFile
Write-Host "✓ Installer created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "  File: $($msiInfo.Name)" -ForegroundColor White
Write-Host "  Size: $([math]::Round($msiInfo.Length / 1MB, 2)) MB" -ForegroundColor White
Write-Host "  Path: $($msiInfo.FullName)" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Ready to distribute!" -ForegroundColor Green
Write-Host ""

# Optional: Open output folder
$openFolder = Read-Host "Open output folder? (Y/N)"
if ($openFolder -eq "Y" -or $openFolder -eq "y") {
    Invoke-Item $OutputPath
}
