import { Gauge, Compass, TrendingUp, Wind } from 'lucide-react';

interface TelemetryDisplayProps {
  altitude: number;
  groundSpeed: number;
  heading: number;
  verticalSpeed?: number;
  indicatedAirspeed?: number;
}

export default function TelemetryDisplay({
  altitude,
  groundSpeed,
  heading,
  verticalSpeed = 0,
  indicatedAirspeed,
}: TelemetryDisplayProps) {
  const getAltitudeColor = (alt: number) => {
    if (alt < 5000) return 'text-emerald-400';
    if (alt < 15000) return 'text-blue-400';
    if (alt < 25000) return 'text-purple-400';
    return 'text-amber-400';
  };

  const getVSColor = (vs: number) => {
    if (vs > 500) return 'text-emerald-400';
    if (vs < -500) return 'text-red-400';
    return 'text-slate-400';
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-600/5 via-transparent to-blue-600/5 pointer-events-none" />
      <div className="relative grid grid-cols-4 gap-6">
        <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-amber-600/10 to-transparent border border-amber-500/20 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Altitude
            </span>
          </div>
          <div className={`text-3xl font-bold font-mono ${getAltitudeColor(altitude)}`}>
            {altitude.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500 mt-2 font-semibold">FT MSL</span>
        </div>

        <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-cyan-600/10 to-transparent border border-cyan-500/20 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <Wind className="w-5 h-5 text-cyan-500" />
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              {indicatedAirspeed ? 'IAS' : 'GS'}
            </span>
          </div>
          <div className="text-3xl font-bold font-mono text-cyan-300">
            {indicatedAirspeed || groundSpeed}
          </div>
          <span className="text-[10px] text-slate-500 mt-2 font-semibold">KNOTS</span>
        </div>

        <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <Compass className="w-5 h-5 text-blue-500" />
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              Heading
            </span>
          </div>
          <div className="text-3xl font-bold font-mono text-blue-300">
            {String(heading).padStart(3, '0')}°
          </div>
          <span className="text-[10px] text-slate-500 mt-2 font-semibold">MAGNETIC</span>
        </div>

        <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-emerald-600/10 to-transparent border border-emerald-500/20 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              V/S
            </span>
          </div>
          <div className={`text-3xl font-bold font-mono ${getVSColor(verticalSpeed)}`}>
            {verticalSpeed > 0 ? '+' : ''}{Math.round(verticalSpeed)}
          </div>
          <span className="text-[10px] text-slate-500 mt-2 font-semibold">FPM</span>
        </div>
      </div>
    </div>
  );
}
