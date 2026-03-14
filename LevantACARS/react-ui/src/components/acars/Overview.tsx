import { Card, CardContent } from "../ui/card";
import { Plane, Clock, MapPin, Gauge, Fuel, Navigation, Wind, Thermometer, ArrowUp, Users, Weight } from "lucide-react";
import { Progress } from "../ui/progress";

interface OverviewProps {
  flightNumber: string;
  aircraft: string;
  departure: string;
  departureName: string;
  arrival: string;
  arrivalName: string;
  pilot: string;
  coPilot: string;
  eta: string;
  ete: string;
  altitude: number;
  speed: number;
  fuel: number;
  fuelKg: number;
  distance: string;
  distanceToGo: string;
  flightTime: string;
  heading: number;
  verticalSpeed: number;
  temperature: number;
  windSpeed: number;
  windDirection: number;
  mach: number;
  grossWeight: number;
  passengers: number;
  phase: string;
  progress: number;
}

interface Waypoint {
  name: string;
  t: number; // bezier parameter
  passed: boolean;
}

// Bezier point calculation
const bezierPoint = (t: number, p0: number[], p1: number[], p2: number[]): [number, number] => {
  const x = (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0];
  const y = (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1];
  return [x, y];
};

const P0 = [48, 148];
const P1 = [300, 18];
const P2 = [552, 102];

const routeWaypoints: Waypoint[] = [
  { name: "KJFK", t: 0, passed: true },
  { name: "MERIT", t: 0.12, passed: true },
  { name: "DIETZ", t: 0.22, passed: true },
  { name: "STAFA", t: 0.38, passed: false },
  { name: "GOMUP", t: 0.56, passed: false },
  { name: "SONEX", t: 0.72, passed: false },
  { name: "BRAIN", t: 0.9, passed: false },
  { name: "EGLL", t: 1, passed: false },
];

// Build bezier path string
const buildBezierPath = () =>
  `M ${P0[0]} ${P0[1]} Q ${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]}`;

const phaseColors: Record<string, string> = {
  CRUISE: "text-green-400 border-green-500/40 bg-green-500/10",
  CLIMB: "text-blue-400 border-blue-500/40 bg-blue-500/10",
  DESCENT: "text-purple-400 border-purple-500/40 bg-purple-500/10",
  APPROACH: "text-amber-400 border-amber-500/40 bg-amber-500/10",
};

export function Overview({
  flightNumber, aircraft, departure, departureName, arrival, arrivalName,
  pilot, coPilot, eta, ete, altitude, speed, fuel, fuelKg, distance, distanceToGo,
  flightTime, heading, verticalSpeed, temperature, windSpeed, windDirection,
  mach, grossWeight, passengers, phase, progress,
}: OverviewProps) {

  const aircraftPos = bezierPoint(progress / 100, P0, P1, P2);
  const phaseStyle = phaseColors[phase] || phaseColors.CRUISE;

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-blue-950/80 border border-blue-900/50 rounded-xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-3">
              <Plane className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-white font-mono">{flightNumber}</h1>
                <span className={`px-2 py-0.5 rounded border text-xs font-bold font-mono tracking-wider ${phaseStyle}`}>{phase}</span>
                <span className="px-2 py-0.5 rounded border border-green-500/40 bg-green-500/10 text-green-400 text-xs font-bold font-mono">ACTIVE</span>
              </div>
              <p className="text-slate-400 text-sm">{aircraft}</p>
            </div>
          </div>
          <div className="flex gap-6 text-right">
            <div>
              <p className="text-xs text-slate-500">PIC</p>
              <p className="text-sm text-white">{pilot}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">FO</p>
              <p className="text-sm text-white">{coPilot}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">ETA</p>
              <p className="text-sm text-white font-mono">{eta}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">ETE</p>
              <p className="text-sm text-white font-mono">{ete}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Route Map */}
      <Card className="bg-slate-900/80 border-slate-800">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-white">Route Visualization</span>
            </div>
            <span className="text-xs text-slate-500 font-mono">{distance} total • {distanceToGo} to go</span>
          </div>

          <div className="relative bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
            {/* Subtle grid */}
            <svg viewBox="0 0 600 180" className="w-full" style={{ height: "180px" }}>
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                </pattern>
                <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset={`${progress}%`} stopColor="#3b82f6" />
                  <stop offset={`${progress}%`} stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
                <filter id="routeGlow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="planeGlow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <rect width="600" height="180" fill="url(#grid)" />

              {/* Ocean tone */}
              <rect width="600" height="180" fill="#0c1a2e" opacity="0.6" />

              {/* Subtle landmass hints */}
              <ellipse cx="80" cy="140" rx="60" ry="35" fill="#1a2a1a" opacity="0.4" />
              <ellipse cx="520" cy="125" rx="70" ry="40" fill="#1a2a1a" opacity="0.4" />

              {/* Route shadow */}
              <path
                d={buildBezierPath()}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="12"
                opacity="0.08"
              />

              {/* Route background (dashed, future) */}
              <path
                d={buildBezierPath()}
                fill="none"
                stroke="#334155"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />

              {/* Route flown (solid, past) */}
              <path
                d={`M ${P0[0]} ${P0[1]} Q ${P1[0]} ${P1[1]} ${aircraftPos[0]} ${aircraftPos[1]}`}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                filter="url(#routeGlow)"
              />

              {/* Waypoints */}
              {routeWaypoints.map((wp) => {
                const [wx, wy] = bezierPoint(wp.t, P0, P1, P2);
                const isPassed = wp.t < progress / 100;
                const isAirport = wp.name === "KJFK" || wp.name === "EGLL";
                return (
                  <g key={wp.name}>
                    <circle
                      cx={wx} cy={wy}
                      r={isAirport ? 6 : 3}
                      fill={isPassed ? "#3b82f6" : "#1e293b"}
                      stroke={isPassed ? "#60a5fa" : "#475569"}
                      strokeWidth="1.5"
                    />
                    <text
                      x={wx} y={wy - (isAirport ? 10 : 8)}
                      textAnchor="middle"
                      fill={isPassed ? "#93c5fd" : "#475569"}
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight={isAirport ? "bold" : "normal"}
                    >
                      {wp.name}
                    </text>
                  </g>
                );
              })}

              {/* Aircraft */}
              <g transform={`translate(${aircraftPos[0]}, ${aircraftPos[1]})`} filter="url(#planeGlow)">
                <circle cx="0" cy="0" r="12" fill="#1d4ed8" opacity="0.3" />
                <circle cx="0" cy="0" r="7" fill="#2563eb" opacity="0.5" />
                {/* Plane icon as polygon */}
                <g transform="rotate(30)">
                  <polygon points="0,-8 3,4 0,2 -3,4" fill="#ffffff" />
                  <rect x="-6" y="-1" width="12" height="2.5" rx="1" fill="#ffffff" />
                  <rect x="-3" y="2" width="6" height="1.5" rx="0.5" fill="#ffffff" />
                </g>
              </g>

              {/* Departure label */}
              <text x="30" y="170" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                {departure}
              </text>
              {/* Arrival label */}
              <text x="570" y="115" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="end">
                {arrival}
              </text>
            </svg>

            {/* Progress bar */}
            <div className="px-4 py-2 bg-slate-900/80 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-mono">{departure} {departureName}</span>
                <span className="text-blue-400 font-mono font-bold">{progress}% Complete</span>
                <span className="font-mono">{arrival} {arrivalName}</span>
              </div>
              <div className="relative h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Altitude", value: `${Math.round(altitude / 100) * 100}`, unit: "ft MSL", icon: Navigation, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
          { label: "Ground Speed", value: `${Math.round(speed)}`, unit: "knots", icon: Gauge, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
          { label: "Mach", value: `M ${mach.toFixed(2)}`, unit: `${Math.round(speed * 1.68781)} km/h TAS`, icon: Gauge, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20", isString: true },
          { label: "Heading", value: `${Math.round(heading).toString().padStart(3, "0")}°`, unit: "magnetic", icon: Navigation, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", isString: true },
          { label: "Vertical Speed", value: `${verticalSpeed >= 0 ? "+" : ""}${Math.round(verticalSpeed)}`, unit: "ft/min", icon: ArrowUp, color: verticalSpeed >= 0 ? "text-green-400" : "text-red-400", bg: "bg-slate-800 border-slate-700" },
          { label: "OAT", value: `${Math.round(temperature)}°`, unit: "Celsius SAT", icon: Thermometer, color: "text-red-300", bg: "bg-slate-800 border-slate-700", isString: true },
          { label: "Wind", value: `${Math.round(windDirection).toString().padStart(3,"0")}° / ${Math.round(windSpeed)}`, unit: "kt headwind", icon: Wind, color: "text-teal-400", bg: "bg-slate-800 border-slate-700", isString: true },
          { label: "Fuel", value: `${Math.round(fuelKg).toLocaleString()}`, unit: "kg remaining", icon: Fuel, color: fuel < 20 ? "text-red-400" : "text-orange-400", bg: fuel < 20 ? "bg-red-500/10 border-red-500/20" : "bg-orange-500/10 border-orange-500/20" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className={`border ${stat.bg} bg-transparent`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-500">{stat.label}</p>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <p className={`text-xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-slate-600 mt-0.5">{stat.unit}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bottom Info Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Fuel State */}
        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Fuel className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-semibold text-white">Fuel State</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Remaining</span>
                <span className="font-mono text-white">{Math.round(fuel)}% • {Math.round(fuelKg).toLocaleString()} kg</span>
              </div>
              <Progress value={fuel} className="h-2" />
              <div className="flex justify-between text-xs text-slate-600">
                <span>Reserves: MIN</span>
                <span>Alternate: +2,400 kg</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payload */}
        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-white">Payload</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Passengers</span>
                <span className="font-mono text-white">{passengers} PAX</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Gross Weight</span>
                <span className="font-mono text-white">{Math.round(grossWeight).toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Class</span>
                <span className="font-mono text-white">Y: 256 / J: 28 / F: 3</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ETA Breakdown */}
        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-teal-400" />
              <span className="text-sm font-semibold text-white">Time</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Block Time</span>
                <span className="font-mono text-white">{flightTime}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">ETE</span>
                <span className="font-mono text-white">{ete}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">ETA (UTC)</span>
                <span className="font-mono text-teal-400">{eta}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

