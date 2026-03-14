import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Cloud, CloudRain, Sun, Wind, Eye, Droplets, Thermometer, Gauge, AlertTriangle } from "lucide-react";
import { Badge } from "./ui/badge";

interface WeatherData {
  location: string;
  locationName: string;
  condition: string;
  temperature: number;
  dewpoint: number;
  visibility: string;
  clouds: string;
  pressure: string;
  humidity: number;
  windSpeed: number;
  windDir: number;
  gusts?: number;
  metar: string;
  taf?: string;
}

interface WeatherInfoProps {
  departure?: WeatherData;
  arrival?: WeatherData;
}

function WindRose({ dir, speed, size = 80 }: { dir: number; speed: number; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.32;
  const arrowLen = r * 0.85;

  const rad = ((dir - 180 - 90) * Math.PI) / 180;
  const ax = cx + arrowLen * Math.cos(rad);
  const ay = cy + arrowLen * Math.sin(rad);

  // Arrow tail
  const tailRad = (rad + Math.PI);
  const tx = cx + (arrowLen * 0.4) * Math.cos(tailRad);
  const ty = cy + (arrowLen * 0.4) * Math.sin(tailRad);

  const cardinals = [
    { label: "N", angle: -90 },
    { label: "E", angle: 0 },
    { label: "S", angle: 90 },
    { label: "W", angle: 180 },
  ];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={r + size * 0.05} fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth="1" />

      {/* Tick marks */}
      {Array.from({ length: 36 }, (_, i) => {
        const tickAngle = (i * 10 - 90) * (Math.PI / 180);
        const len = i % 9 === 0 ? size * 0.05 : size * 0.025;
        const rOuter = r;
        const rInner = r - len;
        return (
          <line
            key={i}
            x1={cx + rOuter * Math.cos(tickAngle)} y1={cy + rOuter * Math.sin(tickAngle)}
            x2={cx + rInner * Math.cos(tickAngle)} y2={cy + rInner * Math.sin(tickAngle)}
            stroke="#334155" strokeWidth="1"
          />
        );
      })}

      {/* Cardinal labels */}
      {cardinals.map(({ label, angle }) => {
        const arad = (angle * Math.PI) / 180;
        const lx = cx + (r - size * 0.14) * Math.cos(arad);
        const ly = cy + (r - size * 0.14) * Math.sin(arad);
        return (
          <text key={label} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
            fill="#475569" fontSize={size * 0.1} fontFamily="monospace">
            {label}
          </text>
        );
      })}

      {/* Wind arrow */}
      <line x1={tx} y1={ty} x2={ax} y2={ay} stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
      {/* Arrowhead */}
      <polygon
        points={`${ax},${ay} ${ax - size*0.05 * Math.cos(rad - 0.5)},${ay - size*0.05 * Math.sin(rad - 0.5)} ${ax - size*0.05 * Math.cos(rad + 0.5)},${ay - size*0.05 * Math.sin(rad + 0.5)}`}
        fill="#3b82f6"
      />

      {/* Center */}
      <circle cx={cx} cy={cy} r={size * 0.06} fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />

      {/* Speed label */}
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
        fill="white" fontSize={size * 0.09} fontFamily="monospace" fontWeight="bold">
        {Math.round(speed)}
      </text>
    </svg>
  );
}

function CloudCoverage({ code }: { code: string }) {
  const parts = code.split(" ");
  const coverageMap: Record<string, { label: string; fill: number; color: string }> = {
    SKC: { label: "Clear", fill: 0, color: "#64748b" },
    FEW: { label: "Few", fill: 20, color: "#3b82f6" },
    SCT: { label: "Scattered", fill: 40, color: "#6b7280" },
    BKN: { label: "Broken", fill: 70, color: "#6b7280" },
    OVC: { label: "Overcast", fill: 100, color: "#374151" },
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {parts.map((part, i) => {
        const key = Object.keys(coverageMap).find((k) => part.startsWith(k));
        if (!key) return <span key={i} className="text-xs font-mono text-slate-300">{part}</span>;
        const info = coverageMap[key];
        const altitude = part.replace(key, "");
        return (
          <div key={i} className="flex items-center gap-1.5 bg-slate-800 rounded px-2 py-1">
            <div className="relative w-4 h-4 rounded-full border border-slate-600">
              <div className="absolute inset-0 rounded-full" style={{
                background: `conic-gradient(${info.color} ${info.fill}%, transparent ${info.fill}%)`,
              }} />
            </div>
            <span className="text-xs font-mono text-slate-300">{info.label}</span>
            {altitude && <span className="text-xs font-mono text-slate-500">{parseInt(altitude) * 100}ft</span>}
          </div>
        );
      })}
    </div>
  );
}

const conditionConfig: Record<string, { icon: React.ReactNode; badge: string }> = {
  Clear: {
    icon: <Sun className="w-5 h-5 text-yellow-400" />,
    badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  },
  "Light Rain": {
    icon: <CloudRain className="w-5 h-5 text-blue-400" />,
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  },
  Rain: {
    icon: <CloudRain className="w-5 h-5 text-blue-500" />,
    badge: "bg-blue-600/20 text-blue-400 border-blue-600/40",
  },
  Cloudy: {
    icon: <Cloud className="w-5 h-5 text-gray-400" />,
    badge: "bg-gray-500/20 text-gray-300 border-gray-500/40",
  },
};

function WeatherCard({ data, label, isArrival = false }: { data: WeatherData; label: string; isArrival?: boolean }) {
  const condStyle = conditionConfig[data.condition] || conditionConfig.Cloudy;
  const isLowVis = parseInt(data.visibility) < 3000 || data.visibility.includes("SM") && parseInt(data.visibility) < 5;
  const isHighWind = data.windSpeed > 25;
  const hasGusts = data.gusts && data.gusts > data.windSpeed + 10;

  return (
    <Card className={`bg-slate-900/60 ${isArrival ? "border-green-900/30" : "border-blue-900/30"}`}>
      <CardContent className="p-5">
        {/* Airport Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${isArrival ? "bg-green-600/20 text-green-400" : "bg-blue-600/20 text-blue-400"}`}>
                {label}
              </span>
              {(isLowVis || isHighWind) && (
                <div className="flex items-center gap-1 text-yellow-400">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="text-xs">Advisory</span>
                </div>
              )}
            </div>
            <p className="text-2xl font-bold text-white font-mono">{data.location}</p>
            <p className="text-sm text-slate-400">{data.locationName}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {condStyle.icon}
            <Badge className={`text-xs border ${condStyle.badge}`}>{data.condition}</Badge>
          </div>
        </div>

        {/* Main Weather Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Wind rose + data */}
          <div className="flex items-center gap-3">
            <WindRose dir={data.windDir} speed={data.windSpeed} size={80} />
            <div className="space-y-1">
              <div className="text-xs text-slate-500">Wind</div>
              <div className="font-mono text-white text-sm">
                {Math.round(data.windDir).toString().padStart(3, "0")}° / {Math.round(data.windSpeed)} kt
              </div>
              {hasGusts && (
                <div className="text-xs text-yellow-400 font-mono">G{Math.round(data.gusts!)}KT</div>
              )}
            </div>
          </div>

          {/* Conditions column */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Thermometer className="w-3 h-3 text-red-400" />
              <span className="text-xs text-slate-500">Temp / Dewpoint</span>
            </div>
            <p className="text-sm font-mono text-white">{Math.round(data.temperature)}°C / {Math.round(data.dewpoint)}°C</p>

            <div className="flex items-center gap-2">
              <Eye className="w-3 h-3 text-teal-400" />
              <span className="text-xs text-slate-500">Visibility</span>
            </div>
            <p className={`text-sm font-mono ${isLowVis ? "text-yellow-400" : "text-white"}`}>{data.visibility}</p>

            <div className="flex items-center gap-2">
              <Gauge className="w-3 h-3 text-purple-400" />
              <span className="text-xs text-slate-500">QNH</span>
            </div>
            <p className="text-sm font-mono text-white">{data.pressure}</p>
          </div>
        </div>

        {/* Cloud Coverage */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Cloud className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-500">Cloud Coverage</span>
          </div>
          <CloudCoverage code={data.clouds} />
        </div>

        {/* Humidity */}
        <div className="flex items-center gap-3 mb-4">
          <Droplets className="w-3 h-3 text-blue-400" />
          <span className="text-xs text-slate-500">Humidity</span>
          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${data.humidity}%` }} />
          </div>
          <span className="text-xs font-mono text-white">{Math.round(data.humidity)}%</span>
        </div>

        {/* METAR */}
        <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 mb-3">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">METAR</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>
          <p className="text-xs text-green-400 font-mono leading-relaxed break-all">{data.metar}</p>
        </div>

        {/* TAF */}
        {data.taf && (
          <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">TAF</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>
            <p className="text-xs text-cyan-400 font-mono leading-relaxed break-all">{data.taf}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function WeatherInfo({ departure, arrival }: WeatherInfoProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 px-1">
        <Cloud className="w-5 h-5 text-blue-400" />
        <h2 className="text-white font-semibold">Weather Information</h2>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-green-400 font-mono">ATIS AUTO</span>
        </div>
      </div>

      {/* Sigmets / NOTAMs */}
      <Card className="bg-amber-950/20 border-amber-800/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-400 mb-1">SIGMET ADVISORY</p>
              <p className="text-xs text-amber-300/80 font-mono">
                WSNT31 KKCI 141245 — CONVECTIVE SIGMET 54E VALID 1245-1445Z — FROM 40NW ALB TO 30NE ACK — EMBD TS. TOPS TO FL450. MOVING NE 20KT.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weather Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <WeatherCard data={departure} label="DEP" isArrival={false} />
        <WeatherCard data={arrival} label="ARR" isArrival={true} />
      </div>

      {/* En-route Alternates */}
      <Card className="bg-slate-900/80 border-slate-800">
        <CardContent className="p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">En-route Alternates</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { icao: "CYYT", name: "St. John's Intl", wx: "OVC020 04/02 Q0998", dist: "450 NM" },
              { icao: "BIKF", name: "Keflavik Intl", wx: "FEW015 SCT025 08/05 Q1012", dist: "780 NM" },
              { icao: "EINN", name: "Shannon Intl", wx: "BKN018 10/08 Q1005", dist: "1340 NM" },
            ].map((alt) => (
              <div key={alt.icao} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-mono font-bold text-white text-sm">{alt.icao}</span>
                  <span className="text-xs text-slate-500 font-mono">{alt.dist}</span>
                </div>
                <p className="text-xs text-slate-400 mb-1">{alt.name}</p>
                <p className="text-xs text-green-400 font-mono">{alt.wx}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
