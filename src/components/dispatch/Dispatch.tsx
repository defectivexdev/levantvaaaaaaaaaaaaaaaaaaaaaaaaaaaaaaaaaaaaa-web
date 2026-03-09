import React, { useState } from 'react';
import { RefreshCw, Plane, Clock, Gauge, Wind, Fuel, Weight, Users, Package, MapPin } from 'lucide-react';

interface FlightData {
  origin: {
    icao: string;
    name: string;
    runway: string;
  };
  destination: {
    icao: string;
    name: string;
    runway: string;
  };
  ete: string;
  cruise: {
    altitude: number;
    avgWind: string;
    costIndex: number;
  };
  fuel: {
    block: number;
    trip: number;
    landing: number;
  };
  weights: {
    zfw: number;
    tow: number;
    ldw: number;
  };
  payload: {
    passengers: number;
    cargo: number;
  };
  alternate: {
    icao: string;
    name: string;
  };
  route: string;
  flightNumber: string;
}

const Dispatch: React.FC = () => {
  const [flightData] = useState<FlightData>({
    origin: {
      icao: 'DAAG',
      name: 'HOUARI BOUMEDIENE',
      runway: 'RWY 27'
    },
    destination: {
      icao: 'WMKK',
      name: 'KUALA LUMPUR INTL, SEPANG',
      runway: 'RWY 32R'
    },
    ete: '11h 35m',
    cruise: {
      altitude: 35000,
      avgWind: '275/045kt',
      costIndex: 200
    },
    fuel: {
      block: 160639,
      trip: 139963,
      landing: 19878
    },
    weights: {
      zfw: 333617,
      tow: 493258,
      ldw: 353495
    },
    payload: {
      passengers: 467,
      cargo: 11547
    },
    alternate: {
      icao: 'WMKP',
      name: 'PENANG INTL'
    },
    route: 'BJA1B BJA UA411 NODLA UM728 SERDI UR970 NESTE DCT LESNU DCT OCI DCT LATAN UL869 KOK UMASH TBL OMUDU PESRA GRESA SKZ NAJIS ERMAL UAA 124 UL933 DOSLI MYJN REJUS PTAR SIBPU TJ ULEKI KGSU AATO LOXED NUBUN FAWTU PZJU JENVE LIVU GOXU TI RNG L759 PAI BOTA VTL VKEJ RIMBA KADU KAGAK KAVANG',
    flightNumber: 'DAAG0RB'
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'fuel' | 'weights' | 'weather'>('overview');

  const handleRefresh = () => {
    console.log('Refreshing flight data...');
  };

  const handleImportFlightPlan = () => {
    console.log('Importing flight plan...');
  };

  return (
    <div className="w-full">
      <div className="max-w-5xl mx-auto">
        {/* Modal Card */}
        <div className="bg-[#141418] border border-amber-500/30 rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1a1a20] to-[#141418] px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded flex items-center justify-center">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Import from SimBrief</h2>
                <p className="text-xs text-gray-400">Fetch your latest flight plan from SimBrief</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded text-sm text-gray-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Origin/Destination Section */}
          <div className="px-6 py-5 border-b border-gray-800">
            <div className="grid grid-cols-2 gap-6">
              {/* Origin */}
              <div>
                <div className="text-3xl font-bold text-white mb-1">{flightData.origin.icao}</div>
                <div className="text-xs text-gray-400 uppercase mb-2">{flightData.origin.name}</div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-3.5 h-3.5" />
                  {flightData.origin.runway}
                </div>
              </div>

              {/* Flight Info Center */}
              <div className="flex flex-col items-center justify-center">
                <div className="text-cyan-400 text-sm mb-1">{flightData.flightNumber}</div>
                <Plane className="w-6 h-6 text-gray-600 rotate-90 mb-1" />
                <div className="text-xs text-gray-500">0.47% ▼</div>
              </div>

              {/* Destination */}
              <div className="col-span-2 -mt-4">
                <div className="text-3xl font-bold text-white mb-1">{flightData.destination.icao}</div>
                <div className="text-xs text-gray-400 uppercase mb-2">{flightData.destination.name}</div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-3.5 h-3.5" />
                  {flightData.destination.runway}
                </div>
              </div>
            </div>

            {/* Flight Stats */}
            <div className="grid grid-cols-4 gap-4 mt-6">
              <div className="bg-[#1a1a20] rounded-lg p-3 border border-gray-800">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>ETE</span>
                </div>
                <div className="text-white font-semibold">{flightData.ete}</div>
              </div>

              <div className="bg-[#1a1a20] rounded-lg p-3 border border-gray-800">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <Gauge className="w-3.5 h-3.5" />
                  <span>CRUISE</span>
                </div>
                <div className="text-white font-semibold">{flightData.cruise.altitude}</div>
              </div>

              <div className="bg-[#1a1a20] rounded-lg p-3 border border-gray-800">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <Wind className="w-3.5 h-3.5" />
                  <span>AVG WIND</span>
                </div>
                <div className="text-white font-semibold text-sm">{flightData.cruise.avgWind}</div>
              </div>

              <div className="bg-[#1a1a20] rounded-lg p-3 border border-gray-800">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <Gauge className="w-3.5 h-3.5" />
                  <span>CI</span>
                </div>
                <div className="text-white font-semibold">{flightData.cruise.costIndex}</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 border-b border-gray-800">
            <div className="flex gap-6">
              {(['overview', 'fuel', 'weights', 'weather'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors capitalize ${
                    activeTab === tab
                      ? 'border-cyan-500 text-cyan-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {tab === 'overview' && <span className="flex items-center gap-2"><Plane className="w-4 h-4" /> Overview</span>}
                  {tab === 'fuel' && <span className="flex items-center gap-2"><Fuel className="w-4 h-4" /> Fuel</span>}
                  {tab === 'weights' && <span className="flex items-center gap-2"><Weight className="w-4 h-4" /> Weights</span>}
                  {tab === 'weather' && <span className="flex items-center gap-2"><Wind className="w-4 h-4" /> Weather</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="px-6 py-5">
            {activeTab === 'overview' && (
              <div className="space-y-5">
                {/* Route */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Route</h3>
                    <button className="text-xs text-cyan-400 hover:text-cyan-300">Copy</button>
                  </div>
                  <div className="bg-[#0a0a0c] border border-gray-800 rounded p-3 max-h-24 overflow-y-auto">
                    <p className="text-xs font-mono text-gray-300 leading-relaxed">
                      {flightData.route}
                    </p>
                  </div>
                </div>

                {/* Fuel & Weights Grid */}
                <div className="grid grid-cols-2 gap-5">
                  {/* Fuel Summary */}
                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <Fuel className="w-4 h-4" />
                      Fuel Summary
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-2 border-b border-gray-800">
                        <span className="text-sm text-gray-400">Block Fuel</span>
                        <span className="text-sm font-semibold text-white">{flightData.fuel.block.toLocaleString()} kg</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-800">
                        <span className="text-sm text-gray-400">Trip Fuel</span>
                        <span className="text-sm font-semibold text-white">{flightData.fuel.trip.toLocaleString()} kg</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-400">Landing Fuel</span>
                        <span className="text-sm font-semibold text-white">{flightData.fuel.landing.toLocaleString()} kg</span>
                      </div>
                    </div>
                  </div>

                  {/* Weights Summary */}
                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <Weight className="w-4 h-4" />
                      Weights Summary
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-2 border-b border-gray-800">
                        <span className="text-sm text-gray-400">ZFW</span>
                        <span className="text-sm font-semibold text-white">{flightData.weights.zfw.toLocaleString()} kg</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-800">
                        <span className="text-sm text-gray-400">TOW</span>
                        <span className="text-sm font-semibold text-white">{flightData.weights.tow.toLocaleString()} kg</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-400">LDW</span>
                        <span className="text-sm font-semibold text-white">{flightData.weights.ldw.toLocaleString()} kg</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payload & Alternate */}
                <div className="grid grid-cols-2 gap-5">
                  {/* Payload */}
                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Payload
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-2 border-b border-gray-800">
                        <span className="text-sm text-gray-400">Passengers</span>
                        <span className="text-sm font-semibold text-white">{flightData.payload.passengers}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-400">Cargo</span>
                        <span className="text-sm font-semibold text-white">{flightData.payload.cargo.toLocaleString()} kg</span>
                      </div>
                    </div>
                  </div>

                  {/* Alternate */}
                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Alternate
                    </h3>
                    <div className="bg-[#1a1a20] border border-gray-800 rounded-lg p-3">
                      <div className="text-lg font-bold text-white mb-1">{flightData.alternate.icao}</div>
                      <div className="text-xs text-gray-400">{flightData.alternate.name}</div>
                      <div className="text-xs text-gray-500 mt-1">RWY 04</div>
                    </div>
                  </div>
                </div>

                {/* View Full OFP Link */}
                <div className="pt-2">
                  <button className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    View Full OFP (PDF)
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'fuel' && (
              <div className="py-8 text-center text-gray-500">
                <Fuel className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Fuel details view</p>
              </div>
            )}

            {activeTab === 'weights' && (
              <div className="py-8 text-center text-gray-500">
                <Weight className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Weights details view</p>
              </div>
            )}

            {activeTab === 'weather' && (
              <div className="py-8 text-center text-gray-500">
                <Wind className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Weather information view</p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-[#0f0f12] border-t border-gray-800 flex justify-between items-center">
            <button className="px-4 py-2 text-sm text-gray-400 hover:text-gray-300 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleImportFlightPlan}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-sm font-semibold rounded-lg shadow-lg shadow-cyan-500/20 transition-all duration-200 flex items-center gap-2"
            >
              <Plane className="w-4 h-4" />
              Import Flight Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dispatch;
