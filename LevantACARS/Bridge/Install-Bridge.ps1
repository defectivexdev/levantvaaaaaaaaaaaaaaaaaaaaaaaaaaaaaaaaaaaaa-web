# ============================================================================
# Install-Bridge.ps1 — Levant VA ACARS Bridge Installer
# Automatically installs FSUIPC/XPUIPC configuration files
# ============================================================================

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Levant ACARS Bridge Installer v1.5.6" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$installed = $false

# ──────────────────────────────────────────────────────────────────────────
# FSUIPC7 (MSFS) Installation
# ──────────────────────────────────────────────────────────────────────────

$fsuipcPath = Join-Path $env:APPDATA "FSUIPC7"

if (Test-Path $fsuipcPath) {
    Write-Host "[FSUIPC7] Found at: $fsuipcPath" -ForegroundColor Green
    
    # Copy ACARS_Master.lua
    $masterLua = Join-Path $scriptDir "ACARS_Master.lua"
    if (Test-Path $masterLua) {
        Copy-Item $masterLua -Destination $fsuipcPath -Force
        Write-Host "  ✓ Copied ACARS_Master.lua" -ForegroundColor Green
    }
    
    # Copy Profiles folder
    $profilesSource = Join-Path $scriptDir "Profiles"
    $profilesDest = Join-Path $fsuipcPath "Profiles"
    if (Test-Path $profilesSource) {
        if (-not (Test-Path $profilesDest)) {
            New-Item -ItemType Directory -Path $profilesDest -Force | Out-Null
        }
        Copy-Item "$profilesSource\*" -Destination $profilesDest -Recurse -Force
        Write-Host "  ✓ Copied Profiles folder" -ForegroundColor Green
    }
    
    # Check FSUIPC7.ini for auto-start
    $iniPath = Join-Path $fsuipcPath "FSUIPC7.ini"
    if (Test-Path $iniPath) {
        $iniContent = Get-Content $iniPath -Raw
        if ($iniContent -notmatch "Lua ACARS_Master") {
            Write-Host ""
            Write-Host "  ⚠ IMPORTANT: Add this to FSUIPC7.ini under [Auto] section:" -ForegroundColor Yellow
            Write-Host "    1=Lua ACARS_Master" -ForegroundColor White
            Write-Host ""
        } else {
            Write-Host "  ✓ Auto-start already configured" -ForegroundColor Green
        }
    }
    
    $installed = $true
    Write-Host ""
}

# ──────────────────────────────────────────────────────────────────────────
# XPUIPC (X-Plane) Installation
# ──────────────────────────────────────────────────────────────────────────

# Common X-Plane installation paths
$xplanePaths = @(
    "C:\X-Plane 12",
    "D:\X-Plane 12",
    "E:\X-Plane 12",
    "C:\Program Files\X-Plane 12",
    "C:\Program Files (x86)\X-Plane 12"
)

foreach ($xpPath in $xplanePaths) {
    $xpuipcPath = Join-Path $xpPath "Resources\plugins\XPUIPC"
    
    if (Test-Path $xpuipcPath) {
        Write-Host "[XPUIPC] Found at: $xpuipcPath" -ForegroundColor Green
        
        $offsetsCfg = Join-Path $scriptDir "XPUIPCOffsets.cfg"
        $destCfg = Join-Path $xpuipcPath "XPUIPCOffsets.cfg"
        
        if (Test-Path $offsetsCfg) {
            # Backup existing config
            if (Test-Path $destCfg) {
                $backup = "$destCfg.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
                Copy-Item $destCfg -Destination $backup -Force
                Write-Host "  ✓ Backed up existing config to: $(Split-Path $backup -Leaf)" -ForegroundColor Yellow
            }
            
            Copy-Item $offsetsCfg -Destination $destCfg -Force
            Write-Host "  ✓ Installed XPUIPCOffsets.cfg" -ForegroundColor Green
        }
        
        $installed = $true
        Write-Host ""
        break
    }
}

# ──────────────────────────────────────────────────────────────────────────
# Summary
# ──────────────────────────────────────────────────────────────────────────

if (-not $installed) {
    Write-Host "[WARNING] No FSUIPC7 or XPUIPC installation detected!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual installation required:" -ForegroundColor Yellow
    Write-Host "  • MSFS: Copy files to %APPDATA%\FSUIPC7\" -ForegroundColor White
    Write-Host "  • X-Plane: Copy XPUIPCOffsets.cfg to X-Plane 12\Resources\plugins\XPUIPC\" -ForegroundColor White
    Write-Host ""
    Write-Host "See INSTALL.md for detailed instructions." -ForegroundColor White
} else {
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host "  Installation Complete!" -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Restart your simulator" -ForegroundColor White
    Write-Host "  2. Launch Levant ACARS" -ForegroundColor White
    Write-Host "  3. Start flying!" -ForegroundColor White
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
