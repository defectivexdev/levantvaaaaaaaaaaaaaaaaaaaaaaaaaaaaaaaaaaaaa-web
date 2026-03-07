# Build MSI Installer for Levant ACARS
# This script builds the ACARS application and creates an MSI installer using WiX Toolset

param(
    [string]$Version = "1.5.8",
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Levant ACARS MSI Builder v$Version" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Paths
$scriptDir = $PSScriptRoot
$solutionPath = Join-Path $scriptDir "LevantACARS.sln"
$projectPath = Join-Path $scriptDir "LevantACARS\LevantACARS.csproj"
$installerDir = Join-Path $scriptDir "installer"
$publishDir = Join-Path $installerDir "publish"
$outputMsi = Join-Path $installerDir "LevantACARS-$Version.msi"

# Check for WiX Toolset
Write-Host "[1/6] Checking for WiX Toolset..." -ForegroundColor Yellow
$wixPath = "C:\Program Files (x86)\WiX Toolset v3.11\bin"
if (-not (Test-Path $wixPath)) {
    $wixPath = "C:\Program Files (x86)\WiX Toolset v3.14\bin"
}
if (-not (Test-Path $wixPath)) {
    Write-Host "ERROR: WiX Toolset not found!" -ForegroundColor Red
    Write-Host "Please install WiX Toolset v3.11 or later from: https://wixtoolset.org/releases/" -ForegroundColor Red
    Write-Host "Or run: choco install wixtoolset" -ForegroundColor Yellow
    exit 1
}
$env:PATH = "$wixPath;$env:PATH"
Write-Host "  Found WiX Toolset at: $wixPath" -ForegroundColor Green

# Build the application
if (-not $SkipBuild) {
    Write-Host ""
    Write-Host "[2/6] Building ACARS Client..." -ForegroundColor Yellow
    dotnet build $solutionPath -c Release
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Build failed!" -ForegroundColor Red
        exit $LASTEXITCODE
    }
    Write-Host "  Build completed successfully" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[2/6] Skipping build (using existing binaries)" -ForegroundColor Yellow
}

# Publish the application
Write-Host ""
Write-Host "[3/6] Publishing ACARS Client..." -ForegroundColor Yellow
if (Test-Path $publishDir) {
    Remove-Item $publishDir -Recurse -Force
}
dotnet publish $projectPath -c Release -r win-x64 --self-contained -o $publishDir
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Publish failed!" -ForegroundColor Red
    exit $LASTEXITCODE
}
Write-Host "  Published to: $publishDir" -ForegroundColor Green

# Harvest files with WiX Heat
Write-Host ""
Write-Host "[4/6] Harvesting published files..." -ForegroundColor Yellow
Push-Location $installerDir
$harvestedFile = "PublishedFiles.wxs"
& heat.exe dir publish -cg PublishedFiles -gg -sfrag -srd -dr INSTALLDIR -out $harvestedFile
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: File harvesting failed!" -ForegroundColor Red
    Pop-Location
    exit $LASTEXITCODE
}
Write-Host "  Harvested files to: $harvestedFile" -ForegroundColor Green

# Compile WiX sources
Write-Host ""
Write-Host "[5/6] Compiling WiX sources..." -ForegroundColor Yellow
& candle.exe -ext WixUIExtension -ext WixUtilExtension Package.wxs $harvestedFile
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: WiX compilation failed!" -ForegroundColor Red
    Pop-Location
    exit $LASTEXITCODE
}
Write-Host "  Compiled WiX object files" -ForegroundColor Green

# Link into MSI
Write-Host ""
Write-Host "[6/6] Linking MSI installer..." -ForegroundColor Yellow
& light.exe -ext WixUIExtension -ext WixUtilExtension -sval -b publish Package.wixobj PublishedFiles.wixobj -o "LevantACARS-$Version.msi"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: MSI linking failed!" -ForegroundColor Red
    Pop-Location
    exit $LASTEXITCODE
}
Pop-Location

Write-Host "  Created MSI: $outputMsi" -ForegroundColor Green

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BUILD SUCCESSFUL!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "MSI Installer: $outputMsi" -ForegroundColor White
Write-Host "Size: $([math]::Round((Get-Item $outputMsi).Length / 1MB, 2)) MB" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Test the installer locally" -ForegroundColor Gray
Write-Host "  2. Create a git tag: git tag v$Version" -ForegroundColor Gray
Write-Host "  3. Push the tag: git push origin v$Version" -ForegroundColor Gray
Write-Host "  4. GitHub Actions will build and publish the release" -ForegroundColor Gray
Write-Host ""
