import { memo } from 'react';
import type { BidData, TelemetryData } from '../types';

interface Props {
  bid: BidData | null;
  telemetry: TelemetryData;
}

function CompactFlightCard({ bid, telemetry }: Props) {
  if (!bid) return null;

  return (
    <div className="glass-card rounded-xl border border-white/5 p-3 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-col">
          <span className="text-lg font-display font-bold text-white tracking-tight">{bid.callsign}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold tracking-[0.15em] border bg-amber-500/10 border-amber-500/20 text-amber-400">
          <div className="h-1 w-1 rounded-full bg-amber-400 animate-pulse" />
          {telemetry.phase}
        </div>
      </div>

      {/* Route */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-mono font-bold text-accent-gold">{bid.departureIcao}</span>
        <span className="text-xs text-gray-600">→</span>
        <span className="text-sm font-mono font-bold text-white">{bid.arrivalIcao}</span>
      </div>

      {/* Aircraft */}
      <div className="text-xs text-gray-500 mb-3">{bid.aircraftType}</div>

      {/* Telemetry Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center py-1.5 px-2 rounded-lg bg-dark-950/50 border border-white/[0.04]">
          <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Flight</span>
          <span className="text-xs font-mono font-bold text-accent-gold">{bid.flightNumber || '—'}</span>
        </div>
        <div className="flex flex-col items-center py-1.5 px-2 rounded-lg bg-dark-950/50 border border-white/[0.04]">
          <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Speed</span>
          <span className="text-xs font-mono font-bold text-white">{telemetry.groundSpeed} kts</span>
        </div>
        <div className="flex flex-col items-center py-1.5 px-2 rounded-lg bg-dark-950/50 border border-white/[0.04]">
          <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Heading</span>
          <span className="text-xs font-mono font-bold text-white">{String(Math.round(telemetry.heading)).padStart(3, '0')}°</span>
        </div>
      </div>
    </div>
  );
}

export default memo(CompactFlightCard);
