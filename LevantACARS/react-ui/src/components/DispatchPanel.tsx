import { useState } from 'react';
import { Plane, RefreshCw, Download, MapPin, Clock, Fuel, Weight, Route as RouteIcon } from 'lucide-react';
import { pushToast } from './ToastOverlay';
import type { AuthState } from '../types';

interface SimBriefFlightPlan {
  origin: { icao: string; name: string };
  destination: { icao: string; name: string };
  callsign: string;
  flightNumber: string;
  aircraft: { icao: string; name: string; registration: string };
  route: string;
  altitude: number;
  distance: number;
  flightTime: number;
  fuel: { plan: number; extra: number; taxi: number };
  weights: { payload: number; zfw: number; tow: number; lw: number };
  alternate: string;
}

interface DispatchPanelProps {
  auth: AuthState;
}

export default function DispatchPanel({ auth }: DispatchPanelProps) {
  const [loading, setLoading] = useState(false);
  const [flightPlan, setFlightPlan] = useState<SimBriefFlightPlan | null>(null);

  const fetchFlightPlan = async () => {
    if (!auth.simbriefId) {
      pushToast('warning', 'Please set your SimBrief username in settings');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://www.simbrief.com/api/xml.fetcher.php?username=${auth.simbriefId}&json=1`);
      const data = await response.json();

      if (!data || !data.origin) {
        pushToast('danger', 'No flight plan found. Create one at SimBrief.com');
        setLoading(false);
        return;
      }

      const plan: SimBriefFlightPlan = {
        origin: {
          icao: data.origin.icao_code,
          name: data.origin.name
        },
        destination: {
          icao: data.destination.icao_code,
          name: data.destination.name
        },
        callsign: data.atc.callsign,
        flightNumber: data.general.flight_number,
        aircraft: {
          icao: data.aircraft.icaocode,
          name: data.aircraft.name,
          registration: data.aircraft.reg
        },
        route: data.general.route,
        altitude: parseInt(data.general.initial_altitude),
        distance: parseInt(data.general.air_distance),
        flightTime: parseInt(data.times.est_time_enroute),
        fuel: {
          plan: parseInt(data.fuel.plan_ramp),
          extra: parseInt(data.fuel.extra),
          taxi: parseInt(data.fuel.taxi)
        },
        weights: {
          payload: parseInt(data.weights.payload),
          zfw: parseInt(data.weights.est_zfw),
          tow: parseInt(data.weights.est_tow),
          lw: parseInt(data.weights.est_ldw)
        },
        alternate: data.alternate?.icao_code || 'N/A'
      };

      setFlightPlan(plan);
      pushToast('success', 'Flight plan loaded successfully');
    } catch (error) {
      console.error('Failed to fetch flight plan:', error);
      pushToast('danger', 'Failed to fetch flight plan from SimBrief');
    } finally {
      setLoading(false);
    }
  };

  const importFlightPlan = () => {
    if (!flightPlan) return;
    
    // Send flight plan data to C# backend via bridge
    if (window.chrome?.webview) {
      window.chrome.webview.postMessage(JSON.stringify({
        action: 'importSimbrief',
        data: flightPlan
      }));
      pushToast('success', 'Flight plan imported to ACARS');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] rounded-xl border border-white/[0.04] overflow-hidden">
      {/* Header */}
      <div className="shrink-0 bg-white/[0.02] border-b border-white/[0.04] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Plane size={16} />
            <h3>SIMBRIEF DISPATCH</h3>
          </div>
          <button
            onClick={fetchFlightPlan}
            disabled={loading || !auth.simbriefId}
            className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded text-cyan-400 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Loading...' : 'Fetch Plan'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!auth.simbriefId ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Plane size={48} className="text-gray-600 mb-4" />
            <p className="text-gray-400 text-sm mb-2">SimBrief username not configured</p>
            <p className="text-gray-600 text-xs">Please set your SimBrief username in settings</p>
          </div>
        ) : !flightPlan ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Plane size={48} className="text-gray-600 mb-4" />
            <p className="text-gray-400 text-sm mb-2">No flight plan loaded</p>
            <p className="text-gray-600 text-xs">Click "Fetch Plan" to load your latest SimBrief flight plan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Route Header */}
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-cyan-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">{flightPlan.origin.icao}</div>
                    <div className="text-xs text-gray-500">{flightPlan.origin.name}</div>
                  </div>
                </div>
                <RouteIcon size={20} className="text-gray-600" />
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{flightPlan.destination.icao}</div>
                    <div className="text-xs text-gray-500">{flightPlan.destination.name}</div>
                  </div>
                  <MapPin size={16} className="text-emerald-400" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/[0.04]">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Callsign</div>
                  <div className="text-sm font-mono text-white">{flightPlan.callsign}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Aircraft</div>
                  <div className="text-sm font-mono text-white">{flightPlan.aircraft.icao}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Registration</div>
                  <div className="text-sm font-mono text-white">{flightPlan.aircraft.registration}</div>
                </div>
              </div>
            </div>

            {/* Flight Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={14} className="text-cyan-400" />
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">Flight Time</div>
                </div>
                <div className="text-lg font-mono text-white">{Math.floor(flightPlan.flightTime / 60)}h {flightPlan.flightTime % 60}m</div>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <RouteIcon size={14} className="text-cyan-400" />
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">Distance</div>
                </div>
                <div className="text-lg font-mono text-white">{flightPlan.distance} NM</div>
              </div>
            </div>

            {/* Fuel */}
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Fuel size={14} className="text-amber-400" />
                <div className="text-xs text-gray-400 uppercase tracking-wider font-bold">Fuel Plan</div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Plan</div>
                  <div className="text-sm font-mono text-white">{flightPlan.fuel.plan} lbs</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Extra</div>
                  <div className="text-sm font-mono text-white">{flightPlan.fuel.extra} lbs</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Taxi</div>
                  <div className="text-sm font-mono text-white">{flightPlan.fuel.taxi} lbs</div>
                </div>
              </div>
            </div>

            {/* Weights */}
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Weight size={14} className="text-purple-400" />
                <div className="text-xs text-gray-400 uppercase tracking-wider font-bold">Weights</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">ZFW</div>
                  <div className="text-sm font-mono text-white">{flightPlan.weights.zfw} lbs</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">TOW</div>
                  <div className="text-sm font-mono text-white">{flightPlan.weights.tow} lbs</div>
                </div>
              </div>
            </div>

            {/* Route */}
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-4">
              <div className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-2">Route</div>
              <div className="text-xs font-mono text-white leading-relaxed break-all">{flightPlan.route}</div>
            </div>

            {/* Import Button */}
            <button
              onClick={importFlightPlan}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm font-bold uppercase tracking-wider transition-colors"
            >
              <Download size={16} />
              Import to ACARS
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
