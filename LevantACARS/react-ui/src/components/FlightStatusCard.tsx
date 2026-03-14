import { Plane, MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import Badge from './ui/badge';
import { Pilot } from '@/types';

interface FlightStatusCardProps {
  pilot: Pilot;
}

export default function FlightStatusCard({ pilot }: FlightStatusCardProps) {
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

  return (
    <Card variant="gradient" className="overflow-hidden relative animate-slide-up group">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-600/5 via-transparent to-purple-600/5 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-600 via-amber-500 to-amber-600 shadow-lg shadow-amber-500/40 group-hover:shadow-amber-500/60 transition-all duration-300 group-hover:scale-110">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent font-bold tracking-tight">
                {pilot.callsign}
              </span>
            </CardTitle>
            <p className="text-sm text-slate-300 font-semibold ml-14 group-hover:text-slate-200 transition-colors">{pilot.aircraft}</p>
          </div>
          <Badge variant={getStatusVariant(pilot.status)} className="text-sm px-4 py-1.5 shadow-lg">
            {pilot.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 relative">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2 p-4 rounded-xl bg-emerald-600/10 border border-emerald-500/20 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold uppercase tracking-wider">
              <MapPin className="w-4 h-4" />
              <span>Departure</span>
            </div>
            <p className="text-2xl font-bold text-white font-mono tracking-wider">{pilot.departure}</p>
          </div>
          
          <div className="space-y-2 p-4 rounded-xl bg-blue-600/10 border border-blue-500/20 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold uppercase tracking-wider">
              <MapPin className="w-4 h-4" />
              <span>Arrival</span>
            </div>
            <p className="text-2xl font-bold text-white font-mono tracking-wider">{pilot.arrival}</p>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-amber-600/10 to-amber-600/5 border border-amber-500/20">
            <div className="text-xs text-amber-400 mb-2 font-semibold uppercase tracking-wider">Altitude</div>
            <div className="text-xl font-bold text-amber-300 font-mono">
              {pilot.altitude.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-medium">FT MSL</div>
          </div>

          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-emerald-600/10 to-emerald-600/5 border border-emerald-500/20">
            <div className="text-xs text-emerald-400 mb-2 font-semibold uppercase tracking-wider">Ground Speed</div>
            <div className="text-xl font-bold text-emerald-300 font-mono">
              {pilot.groundSpeed}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-medium">KNOTS</div>
          </div>

          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-600/10 to-blue-600/5 border border-blue-500/20">
            <div className="text-xs text-blue-400 mb-2 font-semibold uppercase tracking-wider">Heading</div>
            <div className="text-xl font-bold text-blue-300 font-mono">
              {String(pilot.heading).padStart(3, '0')}°
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-medium">MAGNETIC</div>
          </div>
        </div>

        {pilot.route && (
          <>
            <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
            <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 backdrop-blur-sm">
              <div className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wider">Flight Route</div>
              <p className="text-sm text-slate-200 font-mono leading-relaxed">
                {pilot.route}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
