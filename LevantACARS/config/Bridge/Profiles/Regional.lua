-- ============================================================================
-- Regional.lua — Levant VA ACARS
-- Consolidated profile for regional aircraft (CRJ, E-Jets, ATR)
-- Reads fuel/weight L-Vars and writes to Universal Offset Block.
-- ============================================================================

while true do
    local fuel_kg = ipc.readLvar("L:CRJ_FUEL_TOTAL_KG") or
                    ipc.readLvar("L:EJET_FUEL_TOTAL_KG") or
                    ipc.readLvar("L:ATR_FUEL_TOTAL_KG") or
                    ipc.readLvar("L:XMLVAR_FUEL_TOTAL_KG") or 0

    local zfw_kg = ipc.readLvar("L:CRJ_ZFW_KG") or
                   ipc.readLvar("L:EJET_ZFW_KG") or
                   ipc.readLvar("L:ATR_ZFW_KG") or 0

    local payload_kg = ipc.readLvar("L:CRJ_PAYLOAD_KG") or
                       ipc.readLvar("L:EJET_PAYLOAD_KG") or
                       ipc.readLvar("L:ATR_PAYLOAD_KG") or 0

    ipc.writeFloat(0x66C0, fuel_kg)
    ipc.writeFloat(0x66C4, zfw_kg)
    ipc.writeFloat(0x66C8, payload_kg)

    ipc.sleep(1000)
end
