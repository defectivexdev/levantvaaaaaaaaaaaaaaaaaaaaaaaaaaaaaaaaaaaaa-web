import { Pilot } from '@/types';

interface AircraftMarkerProps {
  pilot: Pilot;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function AircraftMarker({ pilot, isSelected, onClick }: AircraftMarkerProps) {
  const getAltitudeColor = (altitude: number) => {
    if (altitude < 5000) return '#10b981';
    if (altitude < 15000) return '#3b82f6';
    if (altitude < 25000) return '#a855f7';
    return '#f59e0b';
  };

  const color = getAltitudeColor(pilot.altitude);

  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer transition-transform hover:scale-110"
      style={{ transform: `rotate(${pilot.heading}deg)` }}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        className={`drop-shadow-lg ${isSelected ? 'animate-pulse' : ''}`}
      >
        <g transform="translate(16, 16)">
          <path
            d="M 0,-12 L -3,-6 L -8,8 L -4,10 L 0,4 L 4,10 L 8,8 L 3,-6 Z"
            fill={color}
            stroke={isSelected ? '#ffffff' : color}
            strokeWidth={isSelected ? '2' : '1'}
            opacity="0.9"
          />
          {isSelected && (
            <circle
              cx="0"
              cy="0"
              r="14"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              opacity="0.5"
            />
          )}
        </g>
      </svg>

      <div
        className={`absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
          isSelected
            ? 'bg-amber-600 text-white'
            : 'bg-slate-900/90 text-slate-200 border border-slate-700'
        }`}
      >
        {pilot.callsign}
      </div>
    </div>
  );
}
