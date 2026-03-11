import { useState, useEffect } from 'react';
import { Plane, RefreshCw, MapPin, Clock, Fuel, Weight, Route as RouteIcon, AlertCircle } from 'lucide-react';
import { pushToast } from './ToastOverlay';
import type { AuthState, BidData } from '../types';

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
  bid: BidData | null;
}

export default function DispatchPanel({ auth, bid }: DispatchPanelProps) {
  const [loading, setLoading] = useState(false);
  const [flightPlan, setFlightPlan] = useState<SimBriefFlightPlan | null>(null);
  const [lastBidId, setLastBidId] = useState<string | null>(null);

  // Auto-fetch SimBrief when bid becomes active or changes
  useEffect(() => {
    // Create unique identifier for bid using flightNumber + route
    const currentBidId = bid ? `${bid.flightNumber}-${bid.departureIcao}-${bid.arrivalIcao}` : null;
    
    console.log('[DispatchPanel] useEffect triggered:', {
      hasBid: !!bid,
      hasSimBriefId: !!auth.simbriefId,
      currentBidId,
      lastBidId,
      willFetch: bid && auth.simbriefId && currentBidId !== lastBidId
    });
    
    // Only auto-fetch if:
    // 1. We have a bid
    // 2. We have SimBrief ID
    // 3. This is a new/different bid (not already fetched)
    if (bid && auth.simbriefId && currentBidId !== lastBidId) {
      console.log('[DispatchPanel] Auto-fetching SimBrief for bid:', bid.flightNumber);
      setLastBidId(currentBidId);
      // Small delay to ensure state is stable
      setTimeout(() => fetchFlightPlan(), 100);
    }
    
    // Reset when bid is removed
    if (!bid && lastBidId !== null) {
      console.log('[DispatchPanel] Bid removed, resetting state');
      setLastBidId(null);
      setFlightPlan(null);
    }
  }, [bid, auth.simbriefId]);

  const fetchFlightPlan = async () => {
    console.log('[DispatchPanel] fetchFlightPlan called, simbriefId:', auth.simbriefId);
    
    if (!auth.simbriefId || auth.simbriefId.trim() === '') {
      console.error('[DispatchPanel] SimBrief ID is empty or undefined');
      pushToast('danger', 'SimBrief API errors. Please check your SimBrief ID.');
      return;
    }

    setLoading(true);
    console.log('[DispatchPanel] Fetching from SimBrief API with userid:', auth.simbriefId);
    try {
      const response = await fetch(`https://www.simbrief.com/api/xml.fetcher.php?userid=${auth.simbriefId}&json=1`, {
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
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
        flightTime: Math.round(parseInt(data.times.est_time_enroute) / 60), // Convert seconds to minutes
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
      console.log('[DispatchPanel] Flight plan loaded successfully:', plan.callsign);
      pushToast('success', 'Flight plan loaded successfully');
    } catch (error: any) {
      console.error('[DispatchPanel] Failed to fetch flight plan:', error);
      
      // Better error messages based on error type
      if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
        pushToast('danger', 'SimBrief request timed out. Please try again.');
      } else if (error.message?.includes('HTTP error')) {
        pushToast('danger', 'SimBrief API error. Please check your SimBrief ID.');
      } else if (error.message?.includes('NetworkError') || error.message?.includes('Failed to fetch')) {
        pushToast('danger', 'Network error. Please check your internet connection.');
      } else {
        pushToast('danger', 'Failed to fetch flight plan from SimBrief');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] rounded-xl border border-white/[0.04] overflow-hidden">
      {/* Header */}
      <div className="shrink-0 bg-white/[0.02] border-b border-white/[0.04] px-4 py-3">
        <div className="flex items-center justify-between mb-3">
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
        {/* Active Bid Info */}
        {bid && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Active Bid</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-white font-bold">{bid.callsign || bid.flightNumber}</span>
                <span className="text-gray-400">{bid.departureIcao}</span>
                <span className="text-gray-600">→</span>
                <span className="text-gray-400">{bid.arrivalIcao}</span>
                <span className="text-gray-500">{bid.aircraftType}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!auth.simbriefId ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <AlertCircle size={48} className="text-amber-500 mb-4" />
            <p className="text-gray-400 text-sm mb-2">SimBrief ID not configured</p>
            <p className="text-gray-600 text-xs">Please set your SimBrief ID in website settings</p>
          </div>
        ) : !bid ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Plane size={48} className="text-gray-600 mb-4" />
            <p className="text-gray-400 text-sm mb-2">No active bid</p>
            <p className="text-gray-600 text-xs">Book a flight to use SimBrief Dispatch</p>
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
                <div className="text-lg font-mono text-white">{Math.floor(flightPlan.flightTime / 60)}h {Math.round(flightPlan.flightTime % 60)}m</div>
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
                  <div className="text-sm font-mono text-white">{flightPlan.fuel.plan} {auth.weightUnit || 'lbs'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Extra</div>
                  <div className="text-sm font-mono text-white">{flightPlan.fuel.extra} {auth.weightUnit || 'lbs'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Taxi</div>
                  <div className="text-sm font-mono text-white">{flightPlan.fuel.taxi} {auth.weightUnit || 'lbs'}</div>
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
                  <div className="text-sm font-mono text-white">{flightPlan.weights.zfw} {auth.weightUnit || 'lbs'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">TOW</div>
                  <div className="text-sm font-mono text-white">{flightPlan.weights.tow} {auth.weightUnit || 'lbs'}</div>
                </div>
              </div>
            </div>

            {/* Route */}
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-4">
              <div className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-2">Route</div>
              <div className="text-xs font-mono text-white leading-relaxed break-all">{flightPlan.route}</div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
