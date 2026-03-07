import { useState, useEffect } from 'react';
import { PlaneTakeoff, PlaneLanding, MapPin, Radio, Map, Navigation, Loader2 } from 'lucide-react';
import { fetchAirportDetails, type AirportDetails } from '../services/airport';

interface Props {
  icao: string;
  type: 'departure' | 'arrival';
}

export default function AirportInfoPanel({ icao, type }: Props) {
  const [data, setData] = useState<AirportDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!icao) return;
    setLoading(true);
    fetchAirportDetails(icao).then(res => {
      setData(res);
      setLoading(false);
    });
  }, [icao]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-[#0a0a0a] rounded-xl border border-white/[0.04]">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mb-2" />
        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Fetching AirportDB...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 bg-[#0a0a0a] rounded-xl border border-white/[0.04] text-center">
        <MapPin className="w-8 h-8 text-gray-700 mx-auto mb-2" />
        <p className="text-xs text-gray-500 font-mono tracking-wider">No detailed data found for {icao}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] rounded-xl border border-white/[0.04] overflow-hidden flex flex-col h-full max-h-[500px]">
      <div className="px-4 py-3 border-b border-white/[0.04] flex items-center justify-between shrink-0 bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg ${type === 'departure' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            {type === 'departure' ? <PlaneTakeoff size={14} /> : <PlaneLanding size={14} />}
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              {data.ident}
              {data.iata_code && <span className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">{data.iata_code}</span>}
            </h3>
            <p className="text-[10px] text-gray-400 truncate max-w-[200px]">{data.name}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-gray-500 uppercase tracking-widest">Elevation</div>
          <div className="text-xs font-mono font-bold text-gray-300">{data.elevation_ft || 0} ft</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* Runways */}
        {data.runways && data.runways.length > 0 && (
          <div>
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Map size={12} /> Runways
            </h4>
            <div className="grid grid-cols-1 gap-1.5">
              {data.runways.map((rwy, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold font-mono text-cyan-400 w-12">{rwy.le_ident}/{rwy.he_ident}</span>
                    <span className="text-[10px] text-gray-400">{rwy.surface || 'Unknown'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-gray-300">{rwy.length_ft || '?'} × {rwy.width_ft || '?'} ft</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Frequencies */}
        {data.freqs && data.freqs.length > 0 && (
          <div>
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Radio size={12} /> Frequencies
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              {data.freqs.map((freq, i) => (
                <div key={i} className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.02]">
                  <div className="text-[9px] text-gray-500 uppercase tracking-widest truncate" title={freq.description}>{freq.description || freq.type}</div>
                  <div className="text-xs font-mono font-bold text-emerald-400">{parseFloat(freq.frequency_mhz).toFixed(3)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navaids */}
        {data.navaids && data.navaids.length > 0 && (
          <div>
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Navigation size={12} /> Navaids
            </h4>
            <div className="grid grid-cols-1 gap-1.5">
              {data.navaids.map((nav, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-gray-300">{nav.type}</span>
                    <span className="text-xs font-bold font-mono text-amber-400">{nav.ident}</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">{nav.frequency_khz} kHz</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
