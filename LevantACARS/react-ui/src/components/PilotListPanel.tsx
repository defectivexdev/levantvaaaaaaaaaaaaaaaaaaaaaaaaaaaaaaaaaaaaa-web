import { Plane, MapPin, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import Badge from './ui/badge';
import { Pilot } from '@/types';

interface PilotListPanelProps {
  pilots: Pilot[];
  onPilotSelect?: (pilot: Pilot) => void;
  selectedPilotId?: string;
}

export default function PilotListPanel({ pilots, onPilotSelect, selectedPilotId }: PilotListPanelProps) {
  const getStatusVariant = (status: Pilot['status']) => {
    switch (status) {
      case 'boarding':
      case 'taxiing':
        return 'warning';
      case 'departing':
      case 'enroute':
        return 'success';
      case 'descending':
      case 'landing':
        return 'info';
      case 'arrived':
        return 'default';
      default:
        return 'default';
    }
  };

  const getAltitudeColor = (altitude: number) => {
    if (altitude < 5000) return 'text-emerald-400';
    if (altitude < 15000) return 'text-blue-400';
    if (altitude < 25000) return 'text-purple-400';
    return 'text-amber-400';
  };

  return (
    <Card variant="glass" className="h-full flex flex-col overflow-hidden animate-slide-up">
      <CardHeader className="pb-4 border-b border-slate-800/50">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-600 via-amber-500 to-amber-600 shadow-lg shadow-amber-500/40 animate-pulse-slow">
            <Plane className="w-5 h-5 text-white animate-float" />
          </div>
          <span className="text-xl bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent font-bold">
            Live Pilots
          </span>
          <Badge variant="glow" pulse className="ml-auto shadow-lg shadow-emerald-500/30">
            {pilots.length} Active
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto space-y-3 scrollbar-hide px-2 py-4">
        {pilots.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 animate-scale-in">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 mb-4 border border-slate-700/30">
              <Plane className="w-12 h-12 text-slate-500 animate-float" />
            </div>
            <p className="text-sm text-slate-400 font-semibold">No active pilots</p>
          </div>
        ) : (
          pilots.map((pilot) => (
            <button
              key={pilot.id}
              onClick={() => onPilotSelect?.(pilot)}
              className={`group relative w-full text-left p-4 rounded-xl transition-all duration-300 overflow-hidden animate-scale-in ${
                selectedPilotId === pilot.id
                  ? 'bg-gradient-to-br from-amber-600/20 via-amber-500/10 to-transparent border-2 border-amber-500/50 shadow-lg shadow-amber-500/30 scale-[1.02]'
                  : 'bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50 hover:border-slate-600/50 hover:shadow-lg hover:scale-[1.01] backdrop-blur-sm'
              }`}
            >
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-bold text-white text-base truncate group-hover:text-amber-300 transition-colors duration-300">
                        {pilot.callsign}
                      </span>
                      <Badge variant={getStatusVariant(pilot.status)} className="text-[10px] shadow-sm">
                        {pilot.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 truncate font-medium group-hover:text-slate-300 transition-colors">{pilot.aircraft}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                  <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-slate-300 transition-colors">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="font-mono font-semibold">{pilot.departure} → {pilot.arrival}</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-end">
                    <TrendingUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-300 transition-colors" />
                    <span className={`font-mono font-bold transition-all duration-300 ${getAltitudeColor(pilot.altitude)}`}>
                      {pilot.altitude.toLocaleString()}ft
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-emerald-400/70 font-medium">GS:</span>
                    <span className="text-emerald-300 font-mono font-bold">{pilot.groundSpeed}kt</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20">
                    <span className="text-blue-400/70 font-medium">HDG:</span>
                    <span className="text-blue-300 font-mono font-bold">{pilot.heading}°</span>
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </CardContent>
    </Card>
  );
}
