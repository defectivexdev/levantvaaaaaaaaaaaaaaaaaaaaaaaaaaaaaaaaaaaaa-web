-- ============================================================================
-- Default.lua — Levant VA ACARS
-- Generic fallback profile for aircraft without specific L-Var mappings.
-- Uses standard FSUIPC offsets and writes to Universal Offset Block.
-- ============================================================================

while true do
    local fuel_lbs = ipc.readUW(0x0AF4)
    local fuel_kg = fuel_lbs * 0.453592

    ipc.writeFloat(0x66C0, fuel_kg)
    ipc.writeFloat(0x66C4, 0)
    ipc.writeFloat(0x66C8, 0)

    ipc.sleep(1000)
end
