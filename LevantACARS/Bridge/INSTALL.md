# Bridge Installation Guide

This folder contains configuration files for FSUIPC (MSFS) and XPUIPC (X-Plane) integration.

## For MSFS Users (FSUIPC7)

1. **Copy Lua files to FSUIPC7:**
   - Navigate to: `%APPDATA%\FSUIPC7\`
   - Copy `ACARS_Master.lua` to this folder
   - Copy the entire `Profiles\` folder to this folder

2. **Enable auto-start:**
   - Open `FSUIPC7.ini` in the FSUIPC7 folder
   - Under the `[Auto]` section, add:
     ```
     1=Lua ACARS_Master
     ```
   - Save and restart MSFS

3. **Verify WASM module:**
   - Ensure `fsuipc-lvar-module` is installed in your MSFS Community folder
   - This is required for L-Var reading

## For X-Plane Users (XPUIPC)

1. **Locate XPUIPC plugin:**
   - Navigate to: `X-Plane 12/Resources/plugins/XPUIPC/`

2. **Install offset configuration:**
   - Open (or create) `XPUIPCOffsets.cfg` in the XPUIPC folder
   - Copy **ALL** contents from `XPUIPCOffsets.cfg` in this Bridge folder
   - Paste into the XPUIPC config file
   - Save and restart X-Plane

## Automated Installation (Windows)

Run the included PowerShell script:
```powershell
.\Install-Bridge.ps1
```

This will automatically detect and install files to the correct locations.

## Troubleshooting

- **MSFS:** Check FSUIPC7.log for Lua script errors
- **X-Plane:** Use DataRefTool plugin to verify datarefs are available
- **Both:** Ensure ACARS app reads offsets 0x66C0, 0x66C4, 0x66C8 correctly

## Support

For issues, contact Levant VA support or check the documentation at levant-va.com
