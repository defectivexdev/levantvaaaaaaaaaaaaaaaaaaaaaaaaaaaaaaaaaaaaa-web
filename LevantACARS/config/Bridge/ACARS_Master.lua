-- ============================================================================
-- ACARS_Master.lua — Levant VA ACARS
-- Master Dispatcher: detects which aircraft you are flying and runs the
-- correct Lua profile. All profiles write to the same Universal Offset Block
-- (0x66C0–0x66D4) so the React app always reads the same addresses.
--
-- INSTALLATION:
--   1. Copy this file + the Profiles/ folder into your FSUIPC7 lua folder:
--        C:\Users\<you>\AppData\Roaming\FSUIPC7\
--   2. Open FSUIPC7.ini and add under [Auto]:
--        1=Lua ACARS_Master
--   3. Ensure the FSUIPC7 WASM module is installed in MSFS Community folder
--      (fsuipc-lvar-module) — required for L-Var reading.
--   4. Restart MSFS.
--
-- UNIVERSAL OFFSET MAP (all profiles write here):
--   0x66C0  Float   Total Fuel (KG)
--   0x66C4  Float   Zero Fuel Weight (KG)
--   0x66C8  Float   Payload (KG)
--   0x66CC  Float   Landing Rate (ft/min)
--   0x66D0  UInt16  Parking Brake (0/1)
--   0x66D4  UInt16  Doors (0=closed, 1=open)
-- ============================================================================

local current_script = ""

function switch_profile(new_script)
    if current_script ~= new_script then
        if current_script ~= "" then
            ipc.macro("LuaKill " .. current_script)
            ipc.log("ACARS: Killing old profile: " .. current_script)
        end
        ipc.macro("Lua " .. new_script)
        current_script = new_script
        ipc.log("ACARS: Started new profile: " .. new_script)
    end
end

while true do
    local title = ipc.readSTR(0x3D00, 256):lower()

    -- Airbus Family (A220, A318-A321, A330-A380)
    if string.find(title, "a220") or string.find(title, "cs100") or string.find(title, "cs300") or
       string.find(title, "a318") or string.find(title, "a319") or string.find(title, "a320") or 
       string.find(title, "a321") or string.find(title, "a32n") or string.find(title, "a32") or
       string.find(title, "a330") or string.find(title, "a339") or string.find(title, "a340") or
       string.find(title, "a350") or string.find(title, "a359") or string.find(title, "a35k") or
       string.find(title, "a380") or string.find(title, "a388") then
        switch_profile("Profiles/Airbus")
    
    -- Boeing Family (737, 747, 757, 767, 777, 787)
    elseif string.find(title, "737") or string.find(title, "b737") or string.find(title, "b738") or string.find(title, "b38m") or
           string.find(title, "747") or string.find(title, "b747") or string.find(title, "b748") or
           string.find(title, "757") or string.find(title, "b752") or string.find(title, "b753") or
           string.find(title, "767") or string.find(title, "b762") or string.find(title, "b763") or
           string.find(title, "777") or string.find(title, "b772") or string.find(title, "b77w") or
           string.find(title, "787") or string.find(title, "b788") or string.find(title, "b789") or string.find(title, "b78x") then
        switch_profile("Profiles/Boeing")
    
    -- Regional Aircraft (CRJ, E-Jets, ATR)
    elseif string.find(title, "crj") or string.find(title, "crj7") or string.find(title, "crj9") or
           string.find(title, "e170") or string.find(title, "e175") or string.find(title, "e190") or string.find(title, "e195") or
           string.find(title, "atr") or string.find(title, "at72") or string.find(title, "at42") then
        switch_profile("Profiles/Regional")
    
    -- Legacy Aircraft (MD-11, MD-80, DC-10, L-1011, Concorde)
    elseif string.find(title, "md[-]?11") or string.find(title, "tfdi") or
           string.find(title, "md[-]?80") or string.find(title, "md[-]?81") or string.find(title, "md[-]?82") or 
           string.find(title, "md[-]?83") or string.find(title, "md[-]?87") or string.find(title, "md[-]?88") or
           string.find(title, "dc[-]?10") or string.find(title, "l[-]?1011") or string.find(title, "tristar") or
           string.find(title, "concorde") then
        switch_profile("Profiles/Legacy")
    
    -- Default fallback
    else
        switch_profile("Profiles/Default")
    end

    ipc.sleep(5000) -- Check for aircraft changes every 5 seconds
end
