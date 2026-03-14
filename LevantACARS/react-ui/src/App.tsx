import React, { useState, useEffect } from 'react';
import { Minus, Square, X, LayoutDashboard, Globe, MessageCircle, MessageSquare, LogOut, Plane } from 'lucide-react';
import { useTelemetry } from './hooks/useTelemetry';
import { SimBridge } from './bridge';
import LinkScreen from './components/LinkScreen';
import FlightLogs from './components/FlightLogs';
import FlightHistoryPanel from './components/FlightHistoryPanel';
import FlightPlan from './components/FlightPlan';
import LandingSummary from './components/LandingSummary';
import LiveMap from './components/LiveMap';
import ChatPanel from './components/ChatPanel';
import DispatchPanel from './components/DispatchPanel';
import ToastOverlay from './components/ToastOverlay';
import { UpdateSplash } from './components/UpdateSplash';
import UpdateOverlay from './components/UpdateOverlay';
import WeatherTile from './components/WeatherTile';
import CompactFlightCard from './components/CompactFlightCard';
import { AnimatedTooltip } from './components/ui/animated-tooltip';
import type { TelemetryData, FlightState, ScoreResult, UILogEntry, ConnectionState, AuthState } from './types';
import { fetchPilotStats, type PilotStats } from './api';

export type View = 'dashboard' | 'livemap' | 'chat' | 'logs' | 'dispatch';

export default function App() {
  const {
    telemetry,
    auth,
    connection,
    flight,
    score,
    bid,
    activityLog,
    exceedanceLog,
    injectBid,
    addLogEntry,
    qnhAltitude,
    setQnhOverride,
    updateStatus,
    touchdownPoint,
    cancelFlight,
    submitFlight,
  } = useTelemetry();

  (window as any).__LVT_WEIGHT_UNIT__ = auth.weightUnit || 'lbs';

  const [activeView, setActiveView] = useState<View>('dashboard');

  if (!auth.isLoggedIn) {
    return <LinkScreen auth={auth} connection={connection} />;
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden font-sans" style={{ background: '#0B1120' }}>
      <ToastOverlay />
      <UpdateSplash />
      <UpdateOverlay updateStatus={updateStatus} />
      
      {/* ── Modern Title Bar ─────── */}
      <div
        className="h-9 flex items-center justify-between px-4 shrink-0 relative z-50 titlebar-drag"
        style={{ background: 'linear-gradient(90deg, #0B1120 0%, #0D1528 100%)', borderBottom: '1px solid rgba(197,160,89,0.15)', WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div className="flex items-center gap-3" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <div className="w-5 h-5 rounded-lg overflow-hidden">
            <img src="img/icon.jpg" alt="Levant" className="w-full h-full object-cover" />
          </div>
          <span className="text-xs font-bold tracking-wider" style={{ color: '#E8ECEF' }}>LEVANT <span style={{ color: '#C5A059' }}>ACARS</span></span>
          <span className="text-[9px] font-mono" style={{ color: '#4A5568' }}>v3.3.3</span>
        </div>
        <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <button onClick={() => SimBridge.minimizeWindow()} className="p-1.5 rounded transition-all bg-transparent border-none cursor-pointer" style={{ color: '#4A5568' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#E8ECEF'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#4A5568'; e.currentTarget.style.background = 'transparent'; }}><Minus className="w-3 h-3" strokeWidth={2} /></button>
          <button onClick={() => SimBridge.maximizeWindow()} className="p-1.5 rounded transition-all bg-transparent border-none cursor-pointer" style={{ color: '#4A5568' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#E8ECEF'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#4A5568'; e.currentTarget.style.background = 'transparent'; }}><Square className="w-2.5 h-2.5" strokeWidth={2} /></button>
          <button onClick={() => SimBridge.closeWindow()} className="p-1.5 rounded transition-all bg-transparent border-none cursor-pointer" style={{ color: '#4A5568' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.background = '#EF4444'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#4A5568'; e.currentTarget.style.background = 'transparent'; }}><X className="w-3 h-3" strokeWidth={2} /></button>
        </div>
      </div>

      {/* ── Modern Main Layout ──────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Modern Sidebar ───────────────────── */}
        <div className="w-16 flex flex-col items-center py-4 gap-2 shrink-0" style={{ background: 'linear-gradient(180deg, #0D1528 0%, #0B1120 100%)', borderRight: '1px solid rgba(197,160,89,0.1)' }}>
          <div className="w-10 h-10 rounded-xl overflow-hidden mb-2" style={{ border: '2px solid #C5A059' }}>
            <img src="img/icon.jpg" alt="Levant" className="w-full h-full object-cover" />
          </div>
          
          <div className="h-px w-8" style={{ background: 'linear-gradient(90deg, transparent, rgba(197,160,89,0.3), transparent)' }} />
          
          <SideNavItem active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <SideNavItem active={activeView === 'livemap'} onClick={() => setActiveView('livemap')} icon={<Globe size={18} />} label="Live Map" />
          <SideNavItem active={activeView === 'dispatch'} onClick={() => setActiveView('dispatch')} icon={<Plane size={18} />} label="Dispatch" />
          <SideNavItem active={activeView === 'chat'} onClick={() => setActiveView('chat')} icon={<MessageCircle size={18} />} label="Pilot Chat" />
          <SideNavItem active={activeView === 'logs'} onClick={() => setActiveView('logs')} icon={<MessageSquare size={18} />} label="Flight Logs" />
          
          <div className="flex-1" />
          
          <div className="h-px w-8" style={{ background: 'linear-gradient(90deg, transparent, rgba(197,160,89,0.3), transparent)' }} />
          
          <button onClick={() => SimBridge.logout()} className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-transparent border-none cursor-pointer group" style={{ color: '#6B7280' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#EF4444'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B7280'; }}>
            <LogOut size={18} />
          </button>
        </div>

        {/* ── Modern Content Area ─────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Modern Header */}
          <header className="h-14 flex justify-between items-center px-6 shrink-0" style={{ background: 'linear-gradient(90deg, rgba(13,21,40,0.5) 0%, rgba(11,17,32,0.3) 100%)', borderBottom: '1px solid rgba(197,160,89,0.08)' }}>
            {/* Left: View Title */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(197,160,89,0.2) 0%, rgba(197,160,89,0.05) 100%)', border: '1px solid rgba(197,160,89,0.3)' }}>
                {activeView === 'dashboard' && <LayoutDashboard size={16} style={{ color: '#C5A059' }} />}
                {activeView === 'livemap' && <Globe size={16} style={{ color: '#C5A059' }} />}
                {activeView === 'dispatch' && <Plane size={16} style={{ color: '#C5A059' }} />}
                {activeView === 'chat' && <MessageCircle size={16} style={{ color: '#C5A059' }} />}
                {activeView === 'logs' && <MessageSquare size={16} style={{ color: '#C5A059' }} />}
              </div>
              <div>
                <h2 className="text-sm font-bold" style={{ color: '#E8ECEF' }}>
                  {activeView === 'dashboard' && 'Flight Logbook'}
                  {activeView === 'livemap' && 'Live Map'}
                  {activeView === 'dispatch' && 'SimBrief Dispatch'}
                  {activeView === 'chat' && 'Pilot Chat'}
                  {activeView === 'logs' && 'Flight Logs'}
                </h2>
                <p className="text-[9px] font-mono tracking-wider uppercase" style={{ color: '#6B7280' }}>Levant Virtual Airlines</p>
              </div>
            </div>
            
            {/* Right: Pilot Info */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'linear-gradient(90deg, rgba(197,160,89,0.12) 0%, rgba(197,160,89,0.05) 100%)', border: '1px solid rgba(197,160,89,0.2)' }}>
                <span className="text-xs font-mono font-bold tracking-wider" style={{ color: '#C5A059' }}>{auth.pilotId}</span>
                <div className="h-3 w-px" style={{ background: 'rgba(197,160,89,0.3)' }} />
                <span className="text-xs font-mono" style={{ color: '#9CA3AF' }}>{auth.pilotRank}</span>
              </div>
              
              <AnimatedTooltip items={[{ id: 1, name: auth.pilotName || 'Pilot', designation: `${auth.pilotRank || 'Cadet'} | ${auth.pilotId || '—'}`, image: `https://res.cloudinary.com/dryamvxbg/image/upload/c_fill,w_200,h_200,f_auto,q_auto/avatars/pilot_${auth.pilotId}` }]} />
            </div>
          </header>

          {/* View */}
          <main className="flex-1 overflow-y-auto p-5" style={{ background: '#0B1120' }}>
            {activeView === 'dashboard' && (
              <DashboardView telemetry={telemetry} flight={flight} score={score} activityLog={activityLog} exceedanceLog={exceedanceLog} connection={connection} auth={auth} bid={bid} injectBid={injectBid} addLogEntry={addLogEntry} setQnhOverride={setQnhOverride} cancelFlight={cancelFlight} submitFlight={submitFlight} />
            )}
            {activeView === 'livemap' && <LiveMap telemetry={telemetry} touchdownPoint={touchdownPoint} />}
            {activeView === 'dispatch' && <DispatchPanel auth={auth} bid={bid} />}
            {activeView === 'chat' && <ChatPanel pilotId={auth.pilotId} pilotName={auth.pilotName} />}
            {activeView === 'logs' && <FlightHistoryPanel pilotId={auth.pilotId} />}
          </main>
        </div>
      </div>

      {/* ── Live Telemetry Footer Bar ─────────────────────── */}
      <TelemetryFooter telemetry={telemetry} flight={flight} connection={connection} qnhAltitude={qnhAltitude} />
    </div>
  );
}

// ── Live Telemetry Footer ─────────────────────────────────────────

function TelemetryFooter({ telemetry, flight, connection, qnhAltitude }: { telemetry: TelemetryData; flight: FlightState; connection: ConnectionState; qnhAltitude: number }) {
  const alt = qnhAltitude ?? Math.round(telemetry.altitude);

  return (
    <div className="shrink-0 h-12 flex items-center justify-between px-6 gap-6 mx-3 mb-3 rounded-xl border border-white/10 backdrop-blur-sm" style={{ background: 'linear-gradient(90deg, rgba(10, 25, 47, 0.95) 0%, rgba(13, 31, 56, 0.9) 100%)' }}>
      {/* Connection status */}
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full shadow-lg ${connection.simConnected ? 'bg-emerald-400 shadow-emerald-400/50 animate-pulse' : 'bg-rose-500 shadow-rose-500/50 animate-pulse'}`} />
        <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">{connection.simConnected ? 'FSUIPC' : 'NO SIM'}</span>
      </div>

      {/* Telemetry readouts */}
      <div className="flex items-center gap-6 flex-1 justify-center">
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-bold tracking-wider text-gray-500 uppercase mb-0.5">IAS</span>
          <span className="text-sm font-mono font-bold text-cyan-400">{telemetry.ias}<span className="text-[9px] text-gray-600 ml-0.5">KT</span></span>
        </div>
        <div className="h-6 w-px bg-white/10" />
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-bold tracking-wider text-gray-500 uppercase mb-0.5">ALT</span>
          <span className="text-sm font-mono font-bold text-cyan-400">{alt.toLocaleString()}<span className="text-[9px] text-gray-600 ml-0.5">FT</span></span>
        </div>
        <div className="h-6 w-px bg-white/10" />
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-bold tracking-wider text-gray-500 uppercase mb-0.5">VS</span>
          <span className={`text-sm font-mono font-bold ${telemetry.verticalSpeed < -500 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {telemetry.verticalSpeed > 0 ? '+' : ''}{Math.round(telemetry.verticalSpeed)}<span className="text-[9px] text-gray-600 ml-0.5">FPM</span>
          </span>
        </div>
        <div className="h-6 w-px bg-white/10" />
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-bold tracking-wider text-gray-500 uppercase mb-0.5">HDG</span>
          <span className="text-sm font-mono font-bold text-white">{String(Math.round(telemetry.heading)).padStart(3, '0')}°</span>
        </div>
        <div className="h-6 w-px bg-white/10" />
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-bold tracking-wider text-gray-500 uppercase mb-0.5">GS</span>
          <span className="text-sm font-mono font-bold text-white">{telemetry.groundSpeed}<span className="text-[9px] text-gray-600 ml-0.5">KT</span></span>
        </div>
        <div className="h-6 w-px bg-white/10" />
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-bold tracking-wider text-gray-500 uppercase mb-0.5">G</span>
          <span className={`text-sm font-mono font-bold ${telemetry.gForce > 1.5 ? 'text-red-400' : telemetry.gForce > 1.2 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {telemetry.gForce.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Flight time only */}
      <div className="flex items-center gap-3">
        {flight.isActive && flight.flightTime && (
          <span className="text-xs font-mono font-bold text-accent-gold tracking-wider">{flight.flightTime}</span>
        )}
      </div>
    </div>
  );
}

// ── Sidebar Nav Item ─────────────────────────────────────────────────

function SideNavItem({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-transparent border-none cursor-pointer group relative"
      style={{
        color: active ? '#C5A059' : '#6B7280',
        background: active ? 'linear-gradient(135deg, rgba(197,160,89,0.15) 0%, rgba(197,160,89,0.05) 100%)' : 'transparent',
        border: active ? '1px solid rgba(197,160,89,0.3)' : '1px solid transparent'
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
          e.currentTarget.style.color = '#E8ECEF';
          e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#6B7280';
          e.currentTarget.style.border = '1px solid transparent';
        }
      }}
    >
      {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full" style={{ background: '#C5A059', boxShadow: '0 0 10px rgba(197,160,89,0.5)' }} />}
      <span className={`relative z-10 transition-all duration-200 ${
        active ? 'drop-shadow-[0_0_8px_rgba(197,160,89,0.5)]' : 'group-hover:scale-110'
      }`}>{icon}</span>
    </button>
  );
}

// ── Dashboard View ───────────────────────────────────────────────

function DashboardView({
  telemetry, flight, score, activityLog, exceedanceLog, connection, auth, bid, injectBid, addLogEntry, setQnhOverride, cancelFlight, submitFlight,
}: {
  telemetry: TelemetryData;
  flight: FlightState;
  score: ScoreResult | null;
  activityLog: UILogEntry[];
  exceedanceLog: UILogEntry[];
  connection: ConnectionState;
  auth: AuthState;
  bid: import('./types').BidData | null;
  injectBid: (b: import('./types').BidData | null) => void;
  addLogEntry: (message: string) => void;
  setQnhOverride: (qnh: number) => void;
  cancelFlight: () => void;
  submitFlight: () => void;
}) {
  // Resolve arrival ICAO from active flight or loaded bid
  const arrivalIcao = flight.arrivalIcao || bid?.arrivalIcao || '';
  const [stats, setStats] = useState<PilotStats | null>(null);

  useEffect(() => {
    if (!auth.pilotId) return;
    fetchPilotStats(auth.pilotId).then(setStats);
    
    // Pilot stats rarely change during a flight, no need to poll every 60s
    // We will fetch on mount or when pilotId changes.
  }, [auth.pilotId]);

  const departureIcao = flight.departureIcao || bid?.departureIcao || '';

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto">
      {/* FSUIPC Connection Warning */}
      {!connection.simConnected && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 shrink-0">
          <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-xs font-bold text-rose-400 uppercase tracking-[0.15em]">FSUIPC &mdash; Not Detected</span>
        </div>
      )}

      {/* Compact Flight Card - Synced with Real Telemetry */}
      {bid && <CompactFlightCard bid={bid} telemetry={telemetry} />}

      {/* Hero Flight Card */}
      <FlightPlan flight={flight} telemetry={telemetry} bid={bid} pilotId={auth.pilotId} injectBid={injectBid} addLogEntry={addLogEntry} cancelFlight={cancelFlight} submitFlight={submitFlight} />

      {/* Pilot Stats Row (below flight card) */}
      {stats && (
        <div className="grid grid-cols-3 gap-2 shrink-0">
          <StatCard label="Total Hours" value={stats.pilot.totalHours.toFixed(1)} color="text-accent-gold" />
          <StatCard label="Total Flights" value={String(stats.pilot.totalFlights)} color="text-accent-emerald" />
          <StatCard label="Rank" value={stats.pilot.rank} color="text-purple-400" small />
        </div>
      )}

      {/* Departure & Arrival METAR */}
      <div className="grid grid-cols-2 gap-3 shrink-0">
        <WeatherTile icao={departureIcao} label="Departure METAR" />
        <WeatherTile icao={arrivalIcao} label="Arrival METAR" onQnhUpdate={setQnhOverride} />
      </div>

      {/* Landing Summary (after flight) */}
      {score && <LandingSummary score={score} flight={flight} />}

      {/* Activity Log */}
      <div className="rounded-xl bg-panel/40 backdrop-blur-md border border-white/5 overflow-hidden shrink-0" style={{ height: '200px' }}>
        <FlightLogs activityLog={activityLog} exceedanceLog={exceedanceLog} />
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────

const StatCard = React.memo(function StatCard({ label, value, color, small }: { label: string; value: string; color: string; small?: boolean }) {
  return (
    <div className="rounded-xl p-3 border border-[var(--acars-border)] bg-[var(--acars-screen)] crt-glow card-hover-glow flex flex-col items-center justify-center gap-1">
      <span className={`${small ? 'text-sm' : 'text-lg'} font-bold font-mono ${color}`} style={{ textShadow: '0 0 8px currentColor' }}>{value}</span>
      <span className="text-[9px] font-mono text-[#555] uppercase tracking-[0.2em]">{label}</span>
    </div>
  );
});
