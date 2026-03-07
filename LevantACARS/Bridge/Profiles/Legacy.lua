-- ============================================================================
-- Legacy.lua — Levant VA ACARS
-- Consolidated profile for legacy aircraft (MD-11, MD-80, DC-10, L-1011, Concorde)
-- Reads fuel/weight L-Vars and writes to Universal Offset Block.
-- ============================================================================

while true do
    local fuel_kg = ipc.readLvar("L:TFDI_FUEL_TOTAL_KG") or
                    ipc.readLvar("L:MD11_FUEL_TOTAL_KG") or
                    ipc.readLvar("L:MD80_FUEL_TOTAL_KG") or
                    ipc.readLvar("L:DC10_FUEL_TOTAL_KG") or
                    ipc.readLvar("L:L1011_FUEL_TOTAL_KG") or
                    ipc.readLvar("L:CONCORDE_FUEL_TOTAL_KG") or
                    ipc.readLvar("L:XMLVAR_FUEL_TOTAL_KG") or 0

    local zfw_kg = ipc.readLvar("L:TFDI_ZFW_KG") or
                   ipc.readLvar("L:MD11_ZFW_KG") or
                   ipc.readLvar("L:MD80_ZFW_KG") or
                   ipc.readLvar("L:DC10_ZFW_KG") or
                   ipc.readLvar("L:L1011_ZFW_KG") or
                   ipc.readLvar("L:CONCORDE_ZFW_KG") or 0

    local payload_kg = ipc.readLvar("L:TFDI_PAYLOAD_KG") or
                       ipc.readLvar("L:MD11_PAYLOAD_KG") or
                       ipc.readLvar("L:MD80_PAYLOAD_KG") or
                       ipc.readLvar("L:DC10_PAYLOAD_KG") or
                       ipc.readLvar("L:L1011_PAYLOAD_KG") or
                       ipc.readLvar("L:CONCORDE_PAYLOAD_KG") or 0

    ipc.writeFloat(0x66C0, fuel_kg)
    ipc.writeFloat(0x66C4, zfw_kg)
    ipc.writeFloat(0x66C8, payload_kg)

    ipc.sleep(1000)
end
