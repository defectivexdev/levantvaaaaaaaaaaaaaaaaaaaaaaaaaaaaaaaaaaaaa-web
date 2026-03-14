import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Map, Navigation2, CheckCircle2, Clock, Fuel, ChevronRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Waypoint {
  name: string;
  type: string;
  altitude: string;
  eta: string;
  distance: string;
  distanceToGo?: string;
  fuelEst?: string;
  passed: boolean;
  wind?: string;
}

interface FlightPlanProps {
  waypoints: Waypoint[];
}

// Altitude profile data for chart
const altitudeProfile = [
  { name: "KJFK", alt: 0 },
  { name: "MERIT", alt: 15000 },
  { name: "DIETZ", alt: 35000 },
  { name: "STAFA", alt: 35000 },
  { name: "GOMUP", alt: 35000 },
  { name: "SONEX", alt: 37000 },
  { name: "BRAIN", alt: 12000 },
  { name: "EGLL", alt: 0 },
];

const typeColor: Record<string, string> = {
  ARPT: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  FIX: "bg-slate-600/50 text-slate-300 border-slate-600/50",
  VOR: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  NDB: "bg-green-500/20 text-green-300 border-green-500/40",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs">
        <p className="text-white font-mono font-bold">{label}</p>
        <p className="text-blue-400 font-mono">FL{Math.round(payload[0].value / 100)}</p>
      </div>
    );
  }
  return null;
};

export function FlightPlan({ waypoints }: FlightPlanProps) {
  const currentIdx = waypoints.findIndex((w) => !w.passed);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 px-1">
        <Map className="w-5 h-5 text-blue-400" />
        <h2 className="text-white font-semibold">Flight Plan</h2>
        <div className="ml-auto">
          <span className="text-xs text-slate-500 font-mono">ATC Route: KJFK/22L MERIT3 MERIT STAFA N27A SONEX BRAIN1A EGLL/27L</span>
        </div>
      </div>

      {/* Route String */}
      <Card className="bg-slate-900/80 border-slate-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-slate-500 uppercase tracking-widest">Filed Route</span>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {waypoints.map((wp, i) => (
              <span key={wp.name} className="flex items-center gap-1">
                <span className={`font-mono text-xs px-1.5 py-0.5 rounded ${
                  wp.passed ? "text-blue-400" : i === currentIdx ? "text-white bg-blue-600/30 border border-blue-500/50" : "text-slate-500"
                }`}>{wp.name}</span>
                {i < waypoints.length - 1 && <ChevronRight className="w-3 h-3 text-slate-700" />}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Altitude Profile Chart */}
      <Card className="bg-slate-900/80 border-slate-800">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <span className="w-1.5 h-4 bg-blue-500 rounded-full inline-block" />
            Altitude Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={altitudeProfile} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="altGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }}
                  axisLine={{ stroke: "#334155" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `FL${Math.round(v / 100)}`}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="alt"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#altGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Waypoint Table */}
      <Card className="bg-slate-900/80 border-slate-800">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <span className="w-1.5 h-4 bg-green-500 rounded-full inline-block" />
            Waypoints — {waypoints.filter((w) => w.passed).length} of {waypoints.length} passed
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="space-y-1">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-2 px-3 py-1 text-xs text-slate-600 font-mono uppercase tracking-wider border-b border-slate-800 mb-2">
              <span className="col-span-3">Waypoint</span>
              <span className="col-span-1">Type</span>
              <span className="col-span-2">Altitude</span>
              <span className="col-span-2">ETA</span>
              <span className="col-span-2">Distance</span>
              <span className="col-span-2">Status</span>
            </div>

            {waypoints.map((wp, index) => {
              const isActive = index === currentIdx;
              const bgClass = wp.passed
                ? "bg-slate-900/30 opacity-60"
                : isActive
                ? "bg-blue-600/10 border-blue-500/30"
                : "bg-slate-800/30 border-slate-800";
              return (
                <div
                  key={index}
                  className={`grid grid-cols-12 gap-2 px-3 py-2.5 rounded-lg border transition-all ${bgClass} ${isActive ? "ring-1 ring-blue-500/20" : ""}`}
                >
                  <div className="col-span-3 flex items-center gap-2">
                    {isActive ? (
                      <Navigation2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    ) : wp.passed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 flex-shrink-0" />
                    )}
                    <span className={`font-mono font-bold text-sm ${isActive ? "text-blue-300" : wp.passed ? "text-slate-500" : "text-white"}`}>
                      {wp.name}
                    </span>
                  </div>

                  <div className="col-span-1 flex items-center">
                    <span className={`text-xs px-1.5 py-0.5 rounded border font-mono ${typeColor[wp.type] || typeColor.FIX}`}>
                      {wp.type}
                    </span>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <span className={`text-xs font-mono ${wp.passed ? "text-slate-600" : "text-slate-300"}`}>{wp.altitude}</span>
                  </div>

                  <div className="col-span-2 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-600" />
                    <span className={`text-xs font-mono ${isActive ? "text-blue-300" : wp.passed ? "text-slate-600" : "text-slate-300"}`}>
                      {wp.eta}Z
                    </span>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <span className={`text-xs font-mono ${wp.passed ? "text-slate-600" : "text-slate-400"}`}>{wp.distance}</span>
                  </div>

                  <div className="col-span-2 flex items-center">
                    {wp.passed ? (
                      <Badge className="bg-slate-700/50 text-slate-400 border-slate-600 text-xs">PASSED</Badge>
                    ) : isActive ? (
                      <Badge className="bg-blue-600/30 text-blue-300 border-blue-500/50 text-xs">ACTIVE</Badge>
                    ) : (
                      <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">AHEAD</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* SID / STAR Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">SID — Departure</p>
            <p className="text-white font-mono">MERIT3 / RWY 22L</p>
            <p className="text-xs text-slate-400 mt-1">KJFK → MERIT → DCT STAFA</p>
            <div className="mt-3 flex gap-4 text-xs text-slate-500">
              <span>Initial Alt: 5000</span>
              <span>Transition: 18000</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">STAR — Arrival</p>
            <p className="text-white font-mono">BRAIN1A / RWY 27L</p>
            <p className="text-xs text-slate-400 mt-1">SONEX → BRAIN → ILS27L</p>
            <div className="mt-3 flex gap-4 text-xs text-slate-500">
              <span>Init Desc: FL100</span>
              <span>FAF: 3000 ft</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

