import { useState, useEffect } from 'react';
import { Minus, Square, X, LayoutDashboard, Globe, MessageCircle, MessageSquare, LogOut, AlignLeft, Plane } from 'lucide-react';
import { useTelemetry } from './hooks/useTelemetry';
import { SimBridge } from './bridge';
import LinkScreen from './components/LinkScreen';
import FlightLogs from './components/FlightLogs';
import FlightHistoryPanel from './components/FlightHistoryPanel';
import FlightPlan from './components/FlightPlan';
import LandingSummary from './components/LandingSummary';
import LiveMap from './components/LiveMap';
import ChatPanel from './components/ChatPanel';
import HoppiePanel from './components/HoppiePanel';
import DispatchPanel from './components/DispatchPanel';
import ToastOverlay from './components/ToastOverlay';
import { UpdateSplash } from './components/UpdateSplash';
import UpdateOverlay from './components/UpdateOverlay';
import WeatherTile from './components/WeatherTile';
import CompactFlightCard from './components/CompactFlightCard';
import { BackgroundBeams } from './components/ui/background-beams';
import { AnimatedTooltip } from './components/ui/animated-tooltip';
import type { TelemetryData, FlightState, ScoreResult, UILogEntry, ConnectionState, AuthState } from './types';
import { fetchPilotStats, type PilotStats } from './api';

export type View = 'dashboard' | 'livemap' | 'chat' | 'logs' | 'hoppie' | 'dispatch';

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
    hoppieMessages,
    hoppieLogs,
    injectBid,
    addLogEntry,
    qnhAltitude,
    discordVerified,
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
    <BackgroundBeams className="h-screen w-screen bg-[#111827] flex flex-col overflow-hidden font-sans text-white">
      <ToastOverlay />
      <UpdateSplash />
      <UpdateOverlay updateStatus={updateStatus} />
      {/* ── Title Bar (Glassmorphism + Gold border) ─────── */}
      <div
        className="h-[35px] flex items-center justify-between px-4 shrink-0 relative z-50 border-b border-[rgba(197,160,89,0.3)] titlebar-drag"
        style={{ background: 'rgba(10, 25, 47, 0.9)', backdropFilter: 'blur(10px)', WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div className="flex items-center gap-3" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <div className="pilot-badge-container !w-6 !h-6">
            <img src="img/icon.jpg" alt="Levant" className="pilot-badge-img" />
          </div>
          <span className="text-xs font-bold tracking-[0.2em] text-[#CCD6F6]">LEVANT<span className="text-accent-gold ml-1">ACARS</span></span>
          <span className="text-[10px] text-[#333d55] font-mono">v3.0</span>
        </div>
        <div className="flex items-center gap-0.5" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <button onClick={() => SimBridge.minimizeWindow()} className="p-1.5 rounded text-[#555] hover:text-white hover:bg-white/10 transition-all bg-transparent border-none cursor-pointer"><Minus className="w-3 h-3" strokeWidth={2} /></button>
          <button onClick={() => SimBridge.maximizeWindow()} className="p-1.5 rounded text-[#555] hover:text-white hover:bg-white/10 transition-all bg-transparent border-none cursor-pointer"><Square className="w-2.5 h-2.5" strokeWidth={2} /></button>
          <button onClick={() => SimBridge.closeWindow()} className="p-1.5 rounded text-[#555] hover:text-white hover:bg-red-500/80 transition-all bg-transparent border-none cursor-pointer"><X className="w-3 h-3" strokeWidth={2} /></button>
        </div>
      </div>

      {/* ── Main Layout ──────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden p-3 pb-0 gap-3">
        {/* ── Sidebar - Enhanced Beautiful Design ───────────────────── */}
        <div className="w-[190px] flex flex-col rounded-2xl relative shrink-0 transition-all border border-accent-gold/10 shadow-2xl shadow-black/50" style={{ background: 'linear-gradient(180deg, rgba(10, 25, 47, 0.98) 0%, rgba(13, 31, 56, 0.95) 50%, rgba(8, 20, 40, 0.98) 100%)' }}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-gold/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-gold/20 to-transparent" />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-gold/5 via-transparent to-transparent pointer-events-none" />
          <nav className="flex-1 flex flex-col gap-1 w-full px-3 py-4">
            <SideNavItem active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} icon={<LayoutDashboard size={16} />} label="Dashboard" />
            <SideNavItem active={activeView === 'livemap'} onClick={() => setActiveView('livemap')} icon={<Globe size={16} />} label="Live Map" />
            <SideNavItem active={activeView === 'dispatch'} onClick={() => setActiveView('dispatch')} icon={<Plane size={16} />} label="Dispatch" />
            <SideNavItem active={activeView === 'hoppie'} onClick={() => setActiveView('hoppie')} icon={<AlignLeft size={16} />} label="ATC / CPDLC" />
            <SideNavItem active={activeView === 'chat'} onClick={() => setActiveView('chat')} icon={<MessageCircle size={16} />} label="Pilot Chat" />
            <div className="h-px bg-gradient-to-r from-transparent via-accent-gold/20 to-transparent my-2" />
            <SideNavItem active={activeView === 'logs'} onClick={() => setActiveView('logs')} icon={<MessageSquare size={16} />} label="Flight Logs" />
          </nav>
          <div className="border-t border-white/[0.05] flex flex-col gap-1 px-3 py-3 bg-white/[0.01]">
            <button onClick={() => SimBridge.logout()} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all bg-transparent border-none cursor-pointer text-xs font-medium tracking-wider border border-transparent hover:border-rose-500/20">
              <LogOut size={14} />
              <span className="uppercase">Sign Out</span>
            </button>
          </div>
          <div className="px-3 pb-3 text-[9px] font-mono text-gray-600 tracking-wider select-none flex items-center justify-between">
            <span>Levant VA</span>
            <span className="text-accent-gold/50">v3.1.3</span>
          </div>
        </div>

        {/* ── Content Area - Enhanced Beautiful Design ─────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 bg-dark-900 rounded-2xl relative overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/50" style={{ background: 'linear-gradient(135deg, rgba(13, 31, 56, 0.98) 0%, rgba(10, 25, 47, 0.95) 100%)' }}>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-gold/5 via-transparent to-cyan-500/5 pointer-events-none" />
          {/* Header - Enhanced Beautiful Design */}
          <header className="h-16 flex justify-between items-center px-6 border-b border-white/[0.08] shrink-0 bg-gradient-to-r from-white/[0.02] via-accent-gold/[0.01] to-transparent backdrop-blur-sm relative z-10">
            {/* Left: View Title */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-accent-gold/25 via-accent-gold/15 to-accent-gold/5 border border-accent-gold/40 shadow-xl shadow-accent-gold/20">
                {activeView === 'dashboard' && <LayoutDashboard size={16} className="text-accent-gold" />}
                {activeView === 'livemap' && <Globe size={16} className="text-accent-gold" />}
                {activeView === 'dispatch' && <Plane size={16} className="text-accent-gold" />}
                {activeView === 'chat' && <MessageCircle size={16} className="text-accent-gold" />}
                {activeView === 'logs' && <MessageSquare size={16} className="text-accent-gold" />}
                {activeView === 'hoppie' && <AlignLeft size={16} className="text-accent-gold" />}
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-tight text-white">
                  {activeView === 'dashboard' && 'Flight Logbook'}
                  {activeView === 'livemap' && 'Live Map'}
                  {activeView === 'dispatch' && 'SimBrief Dispatch'}
                  {activeView === 'chat' && 'Pilot Chat'}
                  {activeView === 'logs' && 'Flight Logs'}
                  {activeView === 'hoppie' && 'ATC / CPDLC'}
                </h2>
                <p className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Levant Virtual Airlines</p>
              </div>
            </div>
            
            {/* Right: Status & Pilot Info */}
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-md shadow-lg ${
                connection.simConnected && connection.apiConnected && discordVerified
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-emerald-500/20'
                  : connection.simConnected
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-amber-500/20'
                    : 'bg-rose-500/15 border-rose-500/40 text-rose-400 shadow-rose-500/20'
              }`}>
                <div className={`h-2 w-2 rounded-full ${
                  connection.simConnected ? 'bg-emerald-400 animate-pulse shadow-xl shadow-emerald-400/60' : 'bg-rose-400 animate-pulse shadow-xl shadow-rose-400/60'
                }`} />
                <span className="text-[10px] font-bold tracking-[0.15em]">
                  {connection.simConnected && connection.apiConnected ? 'ONLINE' : connection.simConnected ? 'SIM ONLY' : 'OFFLINE'}
                </span>
              </div>
              
              {/* Pilot Info */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-accent-gold/10 to-accent-gold/5 border border-accent-gold/20 shadow-lg shadow-accent-gold/10">
                <span className="text-xs text-accent-gold font-mono font-bold tracking-wider drop-shadow-[0_0_8px_rgba(197,160,89,0.4)]">{auth.pilotId}</span>
                <div className="h-3 w-px bg-accent-gold/30" />
                <span className="text-xs text-gray-300 font-mono tracking-wider">{auth.pilotRank}</span>
              </div>
              
              {/* Avatar */}
              <AnimatedTooltip items={[{ id: 1, name: auth.pilotName || 'Pilot', designation: `${auth.pilotRank || 'Cadet'} | ${auth.pilotId || '—'}`, image: auth.pilotAvatar || 'img/icon.jpg' }]} />
            </div>
          </header>

          {/* View */}
          <main className="flex-1 overflow-y-auto p-4">
            {activeView === 'dashboard' && (
              <DashboardView telemetry={telemetry} flight={flight} score={score} activityLog={activityLog} exceedanceLog={exceedanceLog} connection={connection} auth={auth} bid={bid} injectBid={injectBid} addLogEntry={addLogEntry} setQnhOverride={setQnhOverride} cancelFlight={cancelFlight} submitFlight={submitFlight} />
            )}
            {activeView === 'livemap' && <LiveMap telemetry={telemetry} touchdownPoint={touchdownPoint} />}
            {activeView === 'hoppie' && <HoppiePanel messages={hoppieMessages} logs={hoppieLogs} callsign={bid?.callsign || ''} />}
            {activeView === 'dispatch' && <DispatchPanel auth={auth} bid={bid} />}
            {activeView === 'chat' && <ChatPanel pilotId={auth.pilotId} pilotName={auth.pilotName} />}
            {activeView === 'logs' && <FlightHistoryPanel pilotId={auth.pilotId} />}
          </main>
        </div>
      </div>

      {/* ── Live Telemetry Footer Bar ─────────────────────── */}
      <TelemetryFooter telemetry={telemetry} flight={flight} connection={connection} qnhAltitude={qnhAltitude} />
    </BackgroundBeams>
  );
}

// ── Live Telemetry Footer ─────────────────────────────────────────

function TelemetryFooter({ telemetry, flight, connection, qnhAltitude }: { telemetry: TelemetryData; flight: FlightState; connection: ConnectionState; qnhAltitude: number }) {
  const alt = qnhAltitude ?? Math.round(telemetry.altitude);

  return (
    <div className="shrink-0 h-12 flex items-center justify-between px-6 gap-6 mx-3 mb-3 rounded-xl border border-white/[0.08] backdrop-blur-sm" style={{ background: 'linear-gradient(90deg, rgba(10, 25, 47, 0.95) 0%, rgba(13, 31, 56, 0.9) 100%)' }}>
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

      {/* Phase pill */}
      <div className="flex items-center gap-3">
        {flight.isActive && flight.currentPhase && (
          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold tracking-wider uppercase ${
            flight.currentPhase === 'Cruise' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
            : flight.currentPhase === 'Climbing' || flight.currentPhase === 'Takeoff' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : flight.currentPhase === 'Descending' || flight.currentPhase === 'Approach' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            : flight.currentPhase === 'Landed' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-gray-500/10 border-gray-500/30 text-gray-400'
          }`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
            {flight.currentPhase}
          </span>
        )}
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
      className={`w-full h-10 rounded-lg flex items-center gap-3 px-3 transition-all duration-200 relative bg-transparent border-none cursor-pointer text-xs font-semibold tracking-wider group ${
        active
          ? 'text-accent-gold bg-gradient-to-r from-accent-gold/10 to-accent-gold/5 border border-accent-gold/20'
          : 'text-gray-400 hover:text-white hover:bg-white/[0.03] border border-transparent hover:border-white/[0.05]'
      }`}
    >
      {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-accent-gold rounded-r-full shadow-lg shadow-accent-gold/50" />}
      <span className={`relative z-10 transition-all duration-200 ${
        active ? 'drop-shadow-[0_0_8px_rgba(197,160,89,0.5)]' : 'group-hover:scale-110'
      }`}>{icon}</span>
      <span className="relative z-10 uppercase">{label}</span>
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
    const iv = setInterval(() => fetchPilotStats(auth.pilotId).then(setStats), 60000);
    return () => clearInterval(iv);
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
      <div className="rounded-xl bg-dark-900/40 backdrop-blur-md border border-white/[0.04] overflow-hidden shrink-0" style={{ height: '200px' }}>
        <FlightLogs activityLog={activityLog} exceedanceLog={exceedanceLog} />
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────

function StatCard({ label, value, color, small }: { label: string; value: string; color: string; small?: boolean }) {
  return (
    <div className="rounded-xl p-3 border border-[var(--acars-border)] bg-[var(--acars-screen)] crt-glow card-hover-glow flex flex-col items-center justify-center gap-1">
      <span className={`${small ? 'text-sm' : 'text-lg'} font-bold font-mono ${color}`} style={{ textShadow: '0 0 8px currentColor' }}>{value}</span>
      <span className="text-[9px] font-mono text-[#555] uppercase tracking-[0.2em]">{label}</span>
    </div>
  );
}
