-- ============================================================================
-- Boeing.lua — Levant VA ACARS
-- Consolidated profile for all Boeing aircraft (737, 747, 757, 767, 777, 787)
-- Reads fuel/weight L-Vars and writes to Universal Offset Block.
-- ============================================================================

while true do
    -- Try common Boeing L-Var patterns (PMDG, default, etc.)
    local fuel_kg = ipc.readLvar("L:PMDG_FUEL_TOTAL_KG") or
                    ipc.readLvar("L:B738_FUEL_QTY_TOTAL_KG") or
                    ipc.readLvar("L:B747_FUEL_TOTAL_KG") or
                    ipc.readLvar("L:B777_FUEL_TOTAL_KG") or
                    ipc.readLvar("L:B787_FUEL_TOTAL_KG") or
                    ipc.readLvar("L:XMLVAR_FUEL_TOTAL_KG") or 0

    local zfw_kg = ipc.readLvar("L:PMDG_ZFW_KG") or
                   ipc.readLvar("L:B738_ZFW_KG") or
                   ipc.readLvar("L:B747_ZFW_KG") or
                   ipc.readLvar("L:B777_ZFW_KG") or
                   ipc.readLvar("L:B787_ZFW_KG") or 0

    local payload_kg = ipc.readLvar("L:PMDG_PAYLOAD_KG") or
                       ipc.readLvar("L:B738_PAYLOAD_KG") or
                       ipc.readLvar("L:B747_PAYLOAD_KG") or
                       ipc.readLvar("L:B777_PAYLOAD_KG") or
                       ipc.readLvar("L:B787_PAYLOAD_KG") or 0

    ipc.writeFloat(0x66C0, fuel_kg)
    ipc.writeFloat(0x66C4, zfw_kg)
    ipc.writeFloat(0x66C8, payload_kg)

    ipc.sleep(1000)
end
