-- ============================================================================
-- Airbus.lua — Levant VA ACARS
-- Consolidated profile for all Airbus aircraft (A220, A318-A321, A330-A380)
-- Reads fuel/weight L-Vars and writes to Universal Offset Block.
-- ============================================================================

while true do
    -- Try common Airbus L-Var patterns
    local fuel_kg = ipc.readLvar("L:A32NX_FUEL_TOTAL") or 
                    ipc.readLvar("L:A220_FUEL_TOTAL_KG") or
                    ipc.readLvar("L:A330_FUEL_TOTAL_KG") or
                    ipc.readLvar("L:A340_FUEL_TOTAL_KG") or
                    ipc.readLvar("L:A350_FUEL_TOTAL_KG") or
                    ipc.readLvar("L:A380_FUEL_TOTAL_KG") or
                    ipc.readLvar("L:XMLVAR_FUEL_TOTAL_KG") or 0

    local zfw_kg = ipc.readLvar("L:A32NX_ZFW") or
                   ipc.readLvar("L:A220_ZFW_KG") or
                   ipc.readLvar("L:A330_ZFW_KG") or
                   ipc.readLvar("L:A340_ZFW_KG") or
                   ipc.readLvar("L:A350_ZFW_KG") or
                   ipc.readLvar("L:A380_ZFW_KG") or 0

    local payload_kg = ipc.readLvar("L:A32NX_PAYLOAD") or
                       ipc.readLvar("L:A220_PAYLOAD_KG") or
                       ipc.readLvar("L:A330_PAYLOAD_KG") or
                       ipc.readLvar("L:A340_PAYLOAD_KG") or
                       ipc.readLvar("L:A350_PAYLOAD_KG") or
                       ipc.readLvar("L:A380_PAYLOAD_KG") or 0

    ipc.writeFloat(0x66C0, fuel_kg)
    ipc.writeFloat(0x66C4, zfw_kg)
    ipc.writeFloat(0x66C8, payload_kg)

    ipc.sleep(1000)
end
