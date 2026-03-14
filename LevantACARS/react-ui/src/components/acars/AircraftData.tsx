import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Activity, Thermometer, Fuel, Weight } from "lucide-react";
import { FlightGauge } from "./FlightGauge";
import { AttitudeIndicator } from "./AttitudeIndicator";

interface AircraftDataProps {
  altitude: number;
  speed: number;
  heading: number;
  verticalSpeed: number;
  fuel: number;
  fuelKg: number;
  temperature: number;
  windSpeed: number;
  windDirection: number;
  mach: number;
  n1: number;
  n2: number;
  egt: number;
  fuelFlowPerEngine: number;
  grossWeight: number;
  pitch?: number;
  roll?: number;
}

function EngineBar({ label, value, max, color = "#3b82f6", unit = "%" }: {
  label: string; value: number; max: number; color?: string; unit?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-mono text-white">{Math.round(value)}{unit}</span>
      </div>
      <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function DataCell({ label, value, unit, color = "text-white" }: {
  label: string; value: string; unit: string; color?: string;
}) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-lg font-bold font-mono ${color}`}>{value}</p>
      <p className="text-xs text-slate-600 mt-0.5">{unit}</p>
    </div>
  );
}

export function AircraftData({
  altitude, speed, heading, verticalSpeed, fuel, fuelKg,
  temperature, windSpeed, windDirection, mach, n1, n2, egt,
  fuelFlowPerEngine, grossWeight, pitch = 2, roll = 0,
}: AircraftDataProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 px-1">
        <Activity className="w-5 h-5 text-blue-400" />
        <h2 className="text-white font-semibold">Aircraft Instruments & Parameters</h2>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-green-400 font-mono">LIVE DATA</span>
        </div>
      </div>

      {/* Primary Flight Display Row */}
      <Card className="bg-slate-900/80 border-slate-800">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <span className="w-1.5 h-4 bg-blue-500 rounded-full inline-block" />
            Primary Flight Display
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="flex flex-wrap justify-around gap-4">
            <div className="flex flex-col items-center gap-1">
              <FlightGauge
                value={altitude}
                min={0}
                max={45000}
                label="ALTITUDE"
                unit="ft MSL"
                color="#3b82f6"
                size={140}
              />
            </div>
            <div className="flex flex-col items-center gap-1">
              <FlightGauge
                value={speed}
                min={0}
                max={600}
                label="GROUND SPEED"
                unit="knots"
                color="#22c55e"
                size={140}
                warningThreshold={520}
                criticalThreshold={560}
              />
            </div>
            <div className="flex flex-col items-center gap-1">
              <AttitudeIndicator pitch={pitch} roll={roll} size={140} />
            </div>
            <div className="flex flex-col items-center gap-1">
              <FlightGauge
                value={heading}
                min={0}
                max={360}
                label="HEADING"
                unit="° MAG"
                color="#a855f7"
                size={140}
                formatValue={(v) => Math.round(v).toString().padStart(3, "0")}
              />
            </div>
            <div className="flex flex-col items-center gap-1">
              <FlightGauge
                value={Math.abs(verticalSpeed)}
                min={0}
                max={3000}
                label="VERT SPEED"
                unit={`ft/min ${verticalSpeed >= 0 ? "↑" : "↓"}`}
                color={verticalSpeed > 200 ? "#22c55e" : verticalSpeed < -200 ? "#ef4444" : "#64748b"}
                size={140}
                formatValue={(_) => `${verticalSpeed >= 0 ? "+" : ""}${Math.round(verticalSpeed)}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Engine Data Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Engine Parameters */}
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <span className="w-1.5 h-4 bg-orange-500 rounded-full inline-block" />
              Engine Data — GEnx-1B76
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="flex justify-around gap-4 mb-5">
              <div className="flex flex-col items-center">
                <span className="text-xs text-slate-500 mb-1">ENG 1</span>
                <FlightGauge
                  value={n1}
                  min={0}
                  max={110}
                  label="N1"
                  unit="%"
                  color="#f59e0b"
                  size={105}
                  warningThreshold={95}
                  criticalThreshold={102}
                />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-slate-500 mb-1">ENG 2</span>
                <FlightGauge
                  value={n1 + 0.4}
                  min={0}
                  max={110}
                  label="N1"
                  unit="%"
                  color="#f59e0b"
                  size={105}
                  warningThreshold={95}
                  criticalThreshold={102}
                />
              </div>
            </div>

            <div className="space-y-3">
              <EngineBar label="ENG 1 — N2" value={n2} max={110} color="#8b5cf6" />
              <EngineBar label="ENG 2 — N2" value={n2 + 0.2} max={110} color="#8b5cf6" />
              <EngineBar label="ENG 1 — EGT" value={egt} max={950} color="#ef4444" unit="°C" />
              <EngineBar label="ENG 2 — EGT" value={egt + 8} max={950} color="#ef4444" unit="°C" />
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="bg-slate-950 rounded-lg p-2 border border-slate-800 text-center">
                <p className="text-xs text-slate-500">ENG 1 FF</p>
                <p className="text-sm font-mono text-white">{Math.round(fuelFlowPerEngine).toLocaleString()}</p>
                <p className="text-xs text-slate-600">kg/hr</p>
              </div>
              <div className="bg-slate-950 rounded-lg p-2 border border-slate-800 text-center">
                <p className="text-xs text-slate-500">ENG 2 FF</p>
                <p className="text-sm font-mono text-white">{Math.round(fuelFlowPerEngine + 15).toLocaleString()}</p>
                <p className="text-xs text-slate-600">kg/hr</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aircraft State */}
        <Card className="bg-slate-900/80 border-slate-800">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <span className="w-1.5 h-4 bg-teal-500 rounded-full inline-block" />
              Aircraft State
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <DataCell
                label="Mach Number"
                value={`M ${mach.toFixed(2)}`}
                unit="cruise speed"
                color="text-cyan-400"
              />
              <DataCell
                label="True Airspeed"
                value={`${Math.round(speed * 1.025)}`}
                unit="knots TAS"
                color="text-cyan-300"
              />
              <DataCell
                label="Outside Air Temp"
                value={`${Math.round(temperature)}°C`}
                unit="SAT at altitude"
                color="text-red-300"
              />
              <DataCell
                label="ISA Deviation"
                value={`${Math.round(temperature + 56.5) >= 0 ? "+" : ""}${Math.round(temperature + 56.5)}°C`}
                unit="vs. standard"
                color="text-yellow-300"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Fuel className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-slate-400">Fuel State</span>
              </div>
              <EngineBar label="Fuel Remaining" value={fuel} max={100} color={fuel < 20 ? "#ef4444" : "#f97316"} />
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950 rounded-lg p-2 border border-slate-800 text-center">
                  <p className="text-xs text-slate-500">CTR TANK</p>
                  <p className="text-sm font-mono text-white">{Math.round(fuelKg * 0.55).toLocaleString()}</p>
                  <p className="text-xs text-slate-600">kg</p>
                </div>
                <div className="bg-slate-950 rounded-lg p-2 border border-slate-800 text-center">
                  <p className="text-xs text-slate-500">WING TANKS</p>
                  <p className="text-sm font-mono text-white">{Math.round(fuelKg * 0.45).toLocaleString()}</p>
                  <p className="text-xs text-slate-600">kg</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2 mb-1">
                <Weight className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-slate-400">Mass & Inertia</span>
              </div>
              <div className="flex justify-between text-xs bg-slate-950 rounded-lg p-2 border border-slate-800">
                <span className="text-slate-400">Gross Weight</span>
                <span className="font-mono text-white">{Math.round(grossWeight).toLocaleString()} kg</span>
              </div>

              <div className="flex items-center gap-2 mt-2 mb-1">
                <Thermometer className="w-4 h-4 text-teal-400" />
                <span className="text-xs text-slate-400">Wind</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950 rounded-lg p-2 border border-slate-800 text-center">
                  <p className="text-xs text-slate-500">DIRECTION</p>
                  <p className="text-sm font-mono text-white">{Math.round(windDirection).toString().padStart(3, "0")}°</p>
                </div>
                <div className="bg-slate-950 rounded-lg p-2 border border-slate-800 text-center">
                  <p className="text-xs text-slate-500">SPEED</p>
                  <p className="text-sm font-mono text-white">{Math.round(windSpeed)} kt</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

