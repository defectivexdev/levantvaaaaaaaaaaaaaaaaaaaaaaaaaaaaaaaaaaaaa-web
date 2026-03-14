'use client'

import { useState, useEffect } from 'react';
import { Minus, Square, X, LayoutDashboard, Globe, MessageCircle, MessageSquare, LogOut, Radio, RefreshCw } from 'lucide-react';
import { useTelemetry } from '@/lib/hooks/useTelemetry';
import { SimBridge } from '@/lib/bridge';
import LinkScreen from '@/components/acars/LinkScreen';
import FlightLogs from '@/components/acars/FlightLogs';
import FlightHistoryPanel from '@/components/acars/FlightHistoryPanel';
import FlightPlan from '@/components/acars/FlightPlan';
import LandingSummary from '@/components/acars/LandingSummary';
import LiveMap from '@/components/acars/LiveMap';
import ChatPanel from '@/components/acars/ChatPanel';
import ToastOverlay from '@/components/acars/ToastOverlay';
import { UpdateSplash } from '@/components/acars/UpdateSplash';
import UpdateOverlay from '@/components/acars/UpdateOverlay';
import WeatherTile from '@/components/acars/WeatherTile';
import { BackgroundBeams } from '@/components/acars/ui/background-beams';
import { AnimatedTooltip } from '@/components/acars/ui/animated-tooltip';
import type { TelemetryData, FlightState, ScoreResult, UILogEntry, ConnectionState, AuthState, BidData } from '@/types/acars';
import { fetchPilotStats, type PilotStats } from '@/lib/api';

export type View = 'dashboard' | 'livemap' | 'chat' | 'logs';

export default function AcarsApp() {
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
    discordVerified,
    setQnhOverride,
    updateStatus,
    touchdownPoint,
    cancelFlight,
    submitFlight,
  } = useTelemetry();

  if (typeof window !== 'undefined') {
    (window as any).__LVT_WEIGHT_UNIT__ = auth.weightUnit || 'lbs';
  }

  const [activeView, setActiveView] = useState<View>('dashboard');

  if (!auth.isLoggedIn) {
    return <LinkScreen auth={auth} connection={connection} />;
  }

  return (
    <BackgroundBeams className="h-screen w-screen bg-[#111827] flex flex-col overflow-hidden font-sans text-white">
      <ToastOverlay />
      <UpdateSplash />
      <UpdateOverlay updateStatus={updateStatus} />
      {/* ── Enhanced Title Bar with Gradient ─────── */}
      <div
        className="h-[40px] flex items-center justify-between px-5 shrink-0 relative z-50 border-b border-[rgba(197,160,89,0.4)] titlebar-drag group"
        style={{ 
          background: 'linear-gradient(135deg, rgba(10, 25, 47, 0.95) 0%, rgba(15, 35, 65, 0.95) 100%)', 
          backdropFilter: 'blur(16px)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          WebkitAppRegion: 'drag' 
        } as React.CSSProperties}
      >
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-accent-gold/5 via-transparent to-accent-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="flex items-center gap-3 relative z-10" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <div className="relative">
            <div className="absolute inset-0 bg-accent-gold/20 rounded-full blur-md animate-pulse" />
            <div className="pilot-badge-container !w-7 !h-7 relative ring-2 ring-accent-gold/30 ring-offset-2 ring-offset-[#0A192F]">
              <img src="img/icon.jpg" alt="Levant" className="pilot-badge-img" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-[0.25em] text-white drop-shadow-[0_0_8px_rgba(197,160,89,0.5)]">
              LEVANT<span className="text-accent-gold ml-1.5 animate-pulse">ACARS</span>
            </span>
            <span className="text-[9px] text-accent-gold/60 font-mono tracking-wider">Flight Management System</span>
          </div>
          <div className="px-2 py-0.5 rounded-md bg-accent-gold/10 border border-accent-gold/30">
            <span className="text-[10px] text-accent-gold font-mono font-bold">v1.0.10</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 relative z-10" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <button 
            onClick={() => SimBridge.minimizeWindow()} 
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 hover:scale-110 transition-all duration-200 bg-transparent border-none cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
          <button 
            onClick={() => SimBridge.maximizeWindow()} 
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 hover:scale-110 transition-all duration-200 bg-transparent border-none cursor-pointer"
          >
            <Square className="w-3 h-3" strokeWidth={2.5} />
          </button>
          <button 
            onClick={() => SimBridge.closeWindow()} 
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-red-500/90 hover:scale-110 transition-all duration-200 bg-transparent border-none cursor-pointer group/close"
          >
            <X className="w-3.5 h-3.5 group-hover/close:rotate-90 transition-transform duration-200" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ── Main Layout ──────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden p-3 pb-0 gap-3">
        {/* ── Enhanced Sidebar with Glassmorphism ───────────────────── */}
        <div 
          className="w-[190px] flex flex-col rounded-2xl relative shrink-0 transition-all duration-300 hover:shadow-2xl hover:shadow-accent-gold/10 group/sidebar overflow-hidden"
          style={{ 
            background: 'linear-gradient(135deg, rgba(10, 25, 47, 0.98) 0%, rgba(15, 30, 55, 0.98) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(197, 160, 89, 0.15)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
          }}
        >
          {/* Animated gradient border */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-500" 
               style={{ background: 'linear-gradient(135deg, rgba(197, 160, 89, 0.1) 0%, transparent 50%, rgba(197, 160, 89, 0.1) 100%)' }} />
          
          {/* Top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent-gold/40 to-transparent" />
          
          <nav className="flex-1 flex flex-col gap-1 w-full px-3 py-4 relative z-10">
            <SideNavItem active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} icon={<LayoutDashboard size={17} />} label="Dashboard" />
            <SideNavItem active={activeView === 'livemap'} onClick={() => setActiveView('livemap')} icon={<Globe size={17} />} label="Live Map" />
            <SideNavItem active={activeView === 'chat'} onClick={() => setActiveView('chat')} icon={<MessageCircle size={17} />} label="Pilot Chat" />
            
            {/* Elegant divider */}
            <div className="relative my-2">
              <div className="h-[1px] bg-gradient-to-r from-transparent via-accent-gold/30 to-transparent" />
              <div className="absolute inset-0 h-[1px] bg-gradient-to-r from-transparent via-accent-gold/10 to-transparent blur-sm" />
            </div>
            
            <SideNavItem active={activeView === 'logs'} onClick={() => setActiveView('logs')} icon={<MessageSquare size={17} />} label="Flight Logs" />
          </nav>
          
          {/* Action buttons with modern styling */}
          <div className="border-t border-accent-gold/10 flex flex-col gap-1 px-3 py-3 relative z-10 bg-black/10">
            <button 
              onClick={() => SimBridge.checkForUpdate()} 
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-cyan-400/80 hover:text-cyan-300 hover:bg-cyan-500/10 hover:scale-[1.02] transition-all duration-200 bg-transparent border border-transparent hover:border-cyan-500/20 cursor-pointer text-[11px] font-medium tracking-wide group/btn"
            >
              <RefreshCw size={13} className="group-hover/btn:rotate-180 transition-transform duration-500" />
              <span>Check Update</span>
            </button>
            <button 
              onClick={() => SimBridge.logout()} 
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-rose-400/70 hover:text-rose-300 hover:bg-rose-500/10 hover:scale-[1.02] transition-all duration-200 bg-transparent border border-transparent hover:border-rose-500/20 cursor-pointer text-[11px] font-medium tracking-wide group/btn"
            >
              <LogOut size={13} className="group-hover/btn:translate-x-0.5 transition-transform duration-200" />
              <span>Sign Out</span>
            </button>
          </div>
          
          {/* Footer with gradient */}
          <div className="px-3 pb-3 relative z-10">
            <div className="text-[9px] font-mono text-accent-gold/40 tracking-wider select-none text-center py-2 rounded-lg bg-accent-gold/5 border border-accent-gold/10">
              Levant VA · v1.0.10
            </div>
          </div>
        </div>

        {/* ── Enhanced Content Area ─────────────────────────────── */}
        <div 
          className="flex-1 flex flex-col min-w-0 rounded-2xl relative overflow-hidden shadow-2xl"
          style={{ 
            background: 'linear-gradient(135deg, rgba(13, 31, 56, 0.95) 0%, rgba(10, 25, 47, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(197, 160, 89, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
          }}
        >
          {/* Enhanced Header */}
          <header className="h-14 flex justify-between items-center px-6 border-b border-accent-gold/10 shrink-0 relative overflow-hidden group/header">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-accent-gold/5 via-transparent to-accent-gold/5 opacity-0 group-hover/header:opacity-100 transition-opacity duration-500" />
            
            <h2 className="text-sm font-bold tracking-tight flex items-center gap-3.5 relative z-10">
              <div className="p-2 rounded-xl bg-gradient-to-br from-accent-gold/20 to-accent-gold/5 border border-accent-gold/30 shadow-lg shadow-accent-gold/10 group-hover/header:scale-110 transition-transform duration-300">
                {activeView === 'dashboard' && <LayoutDashboard size={16} className="text-accent-gold drop-shadow-[0_0_8px_rgba(197,160,89,0.6)]" />}
                {activeView === 'livemap' && <Globe size={16} className="text-accent-gold drop-shadow-[0_0_8px_rgba(197,160,89,0.6)]" />}
                {activeView === 'chat' && <MessageCircle size={16} className="text-accent-gold drop-shadow-[0_0_8px_rgba(197,160,89,0.6)]" />}
                {activeView === 'logs' && <MessageSquare size={16} className="text-accent-gold drop-shadow-[0_0_8px_rgba(197,160,89,0.6)]" />}
              </div>
              <div className="flex flex-col">
                <span className="uppercase tracking-[0.2em] text-[13px] text-white font-bold">
                  {activeView === 'dashboard' && 'Flight Logbook'}
                  {activeView === 'livemap' && 'Live Map'}
                  {activeView === 'chat' && 'Pilot Chat'}
                  {activeView === 'logs' && 'Flight Logs'}
                </span>
                <span className="text-[10px] text-accent-gold/60 tracking-wider">
                  {activeView === 'dashboard' && 'Monitor your flight operations'}
                  {activeView === 'livemap' && 'Real-time aircraft tracking'}
                  {activeView === 'chat' && 'Connect with other pilots'}
                  {activeView === 'logs' && 'View flight history'}
                </span>
              </div>
            </h2>
            <div className="flex items-center gap-4 relative z-10">
              {/* Enhanced connection status badge */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-[0.15em] border shadow-lg transition-all duration-300 ${
                connection.simConnected && connection.apiConnected && discordVerified
                  ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border-emerald-500/40 text-emerald-300 shadow-emerald-500/20'
                  : connection.simConnected
                    ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 border-amber-500/40 text-amber-300 shadow-amber-500/20'
                    : 'bg-gradient-to-r from-rose-500/20 to-rose-600/20 border-rose-500/40 text-rose-300 shadow-rose-500/20'
              }`}>
                <Radio size={12} className="animate-pulse" />
                <div className={`h-2 w-2 rounded-full ${connection.simConnected ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-rose-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]'}`} />
                <span className="drop-shadow-[0_0_4px_currentColor]">
                  {connection.simConnected && connection.apiConnected ? 'ONLINE' : connection.simConnected ? 'SIM ONLY' : 'OFFLINE'}
                </span>
              </div>
              
              {/* Enhanced pilot info card */}
              <div className="text-right bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl px-4 py-2 border border-white/10 backdrop-blur-sm hover:border-accent-gold/30 transition-all duration-300 group/pilot">
                <p className="text-sm font-bold leading-none text-white group-hover/pilot:text-accent-gold transition-colors">{auth.pilotName}</p>
                <div className="flex items-center gap-2 mt-1.5 justify-end">
                  <span className="text-xs text-accent-gold font-mono bg-gradient-to-r from-accent-gold/10 to-accent-gold/5 px-2 py-1 rounded-lg border border-accent-gold/20 font-bold tracking-widest uppercase shadow-inner">
                    {auth.pilotId}
                  </span>
                  <span className="text-xs text-gray-300 font-mono tracking-widest uppercase bg-white/5 px-2 py-1 rounded-lg">
                    {auth.pilotRank}
                  </span>
                </div>
              </div>
              
              {/* Enhanced avatar with glow */}
              <div className="relative group/avatar">
                <div className="absolute inset-0 bg-accent-gold/30 rounded-full blur-xl group-hover/avatar:blur-2xl transition-all duration-300" />
                <AnimatedTooltip items={[{ id: 1, name: auth.pilotName || 'Pilot', designation: `${auth.pilotRank || 'Cadet'} | ${auth.pilotId || '—'}`, image: auth.pilotAvatar || 'img/icon.jpg' }]} />
              </div>
            </div>
          </header>

          {/* View */}
          <main className="flex-1 overflow-y-auto p-4">
            {activeView === 'dashboard' && (
              <DashboardView telemetry={telemetry} flight={flight} score={score} activityLog={activityLog} exceedanceLog={exceedanceLog} connection={connection} auth={auth} bid={bid} injectBid={injectBid} addLogEntry={addLogEntry} setQnhOverride={setQnhOverride} cancelFlight={cancelFlight} submitFlight={submitFlight} />
            )}
            {activeView === 'livemap' && <LiveMap telemetry={telemetry} touchdownPoint={touchdownPoint} />}
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
  const phaseColor = flight.currentPhase === 'Cruise' ? 'pill-info'
    : flight.currentPhase === 'Climbing' || flight.currentPhase === 'Takeoff' ? 'pill-active'
    : flight.currentPhase === 'Descending' || flight.currentPhase === 'Approach' ? 'pill-warning'
    : flight.currentPhase === 'Landed' ? 'pill-active'
    : 'pill-neutral';

  return (
    <div 
      className="shrink-0 h-14 flex items-center justify-between px-6 gap-8 mx-3 mb-3 rounded-2xl relative overflow-hidden group/footer"
      style={{
        background: 'linear-gradient(135deg, rgba(10, 25, 47, 0.98) 0%, rgba(15, 30, 55, 0.98) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(197, 160, 89, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 0 40px rgba(197, 160, 89, 0.1)'
      }}
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent-gold/5 via-transparent to-accent-gold/5 opacity-0 group-hover/footer:opacity-100 transition-opacity duration-500" />
      
      {/* Connection status with enhanced styling */}
      <div className="flex items-center gap-3 relative z-10">
        <div className={`h-2 w-2 rounded-full ${connection.simConnected ? 'bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.8)]' : 'bg-red-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.8)]'}`} />
        <span className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: connection.simConnected ? '#2DCE89' : '#ef4444' }}>
          {connection.simConnected ? 'FSUIPC' : 'NO SIM'}
        </span>
      </div>

      {/* Enhanced Telemetry readouts */}
      <div className="flex items-center gap-6 flex-1 justify-center relative z-10">
        <div className="flex flex-col items-center gap-1 group/item">
          <span className="text-[10px] font-bold tracking-[0.2em] text-cyan-400/60 uppercase">IAS</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.6)] group-hover/item:scale-110 transition-transform">
              {telemetry.ias}
            </span>
            <span className="text-[9px] text-cyan-400/40 font-mono">KT</span>
          </div>
        </div>
        
        <div className="h-10 w-[1px] bg-gradient-to-b from-transparent via-accent-gold/30 to-transparent" />
        
        <div className="flex flex-col items-center gap-1 group/item">
          <span className="text-[10px] font-bold tracking-[0.2em] text-cyan-400/60 uppercase">ALT</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.6)] group-hover/item:scale-110 transition-transform">
              {alt.toLocaleString()}
            </span>
            <span className="text-[9px] text-cyan-400/40 font-mono">FT</span>
          </div>
        </div>
        
        <div className="h-10 w-[1px] bg-gradient-to-b from-transparent via-accent-gold/30 to-transparent" />
        
        <div className="flex flex-col items-center gap-1 group/item">
          <span className="text-[10px] font-bold tracking-[0.2em] text-emerald-400/60 uppercase">VS</span>
          <div className="flex items-baseline gap-1">
            <span 
              className="text-2xl font-bold font-mono drop-shadow-[0_0_12px_currentColor] group-hover/item:scale-110 transition-transform"
              style={{ color: telemetry.verticalSpeed < -500 ? '#FFB000' : '#2DCE89' }}
            >
              {telemetry.verticalSpeed > 0 ? '+' : ''}{Math.round(telemetry.verticalSpeed)}
            </span>
            <span className="text-[9px] font-mono" style={{ color: telemetry.verticalSpeed < -500 ? '#FFB000' : '#2DCE89', opacity: 0.4 }}>FPM</span>
          </div>
        </div>
        
        <div className="h-10 w-[1px] bg-gradient-to-b from-transparent via-accent-gold/30 to-transparent" />
        
        <div className="flex flex-col items-center gap-1 group/item">
          <span className="text-[10px] font-bold tracking-[0.2em] text-purple-400/60 uppercase">HDG</span>
          <span className="text-2xl font-bold font-mono text-purple-400 drop-shadow-[0_0_12px_rgba(192,132,252,0.6)] group-hover/item:scale-110 transition-transform">
            {String(Math.round(telemetry.heading)).padStart(3, '0')}°
          </span>
        </div>
        
        <div className="h-10 w-[1px] bg-gradient-to-b from-transparent via-accent-gold/30 to-transparent" />
        
        <div className="flex flex-col items-center gap-1 group/item">
          <span className="text-[10px] font-bold tracking-[0.2em] text-amber-400/60 uppercase">GS</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)] group-hover/item:scale-110 transition-transform">
              {telemetry.groundSpeed}
            </span>
            <span className="text-[9px] text-amber-400/40 font-mono">KT</span>
          </div>
        </div>
        
        <div className="h-10 w-[1px] bg-gradient-to-b from-transparent via-accent-gold/30 to-transparent" />
        
        <div className="flex flex-col items-center gap-1 group/item">
          <span className="text-[10px] font-bold tracking-[0.2em] text-rose-400/60 uppercase">G-FORCE</span>
          <span 
            className="text-2xl font-bold font-mono drop-shadow-[0_0_12px_currentColor] group-hover/item:scale-110 transition-transform"
            style={{ color: telemetry.gForce > 1.5 ? '#ef4444' : telemetry.gForce > 1.2 ? '#FFB000' : '#2DCE89' }}
          >
            {telemetry.gForce.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Enhanced Phase pill */}
      <div className="flex items-center gap-3 relative z-10">
        {flight.isActive && flight.currentPhase && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border shadow-lg transition-all duration-300 ${
            phaseColor === 'pill-info' ? 'bg-blue-500/20 border-blue-500/40 text-blue-300 shadow-blue-500/20' :
            phaseColor === 'pill-active' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-emerald-500/20' :
            phaseColor === 'pill-warning' ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-amber-500/20' :
            'bg-gray-500/20 border-gray-500/40 text-gray-300 shadow-gray-500/20'
          }`}>
            <span className="h-2 w-2 rounded-full bg-current animate-pulse shadow-[0_0_8px_currentColor]" />
            <span className="text-xs font-bold tracking-wider uppercase">{flight.currentPhase}</span>
          </div>
        )}
        {flight.isActive && flight.flightTime && (
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-accent-gold/60 uppercase tracking-wider">Flight Time</span>
            <span className="text-lg font-bold font-mono text-accent-gold drop-shadow-[0_0_8px_rgba(197,160,89,0.6)]">
              {flight.flightTime}
            </span>
          </div>
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
      className={`w-full h-10 rounded-xl flex items-center gap-3 px-3.5 transition-all duration-300 relative bg-transparent border cursor-pointer text-xs font-semibold tracking-wider group/nav ${
        active
          ? 'text-accent-gold border-accent-gold/30 bg-gradient-to-r from-accent-gold/10 to-accent-gold/5 shadow-lg shadow-accent-gold/10'
          : 'text-gray-400 border-transparent hover:text-white hover:border-accent-gold/20 hover:bg-gradient-to-r hover:from-accent-gold/5 hover:to-transparent'
      }`}
    >
      {/* Active indicator bar */}
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-gradient-to-b from-accent-gold via-accent-gold to-accent-gold/50 rounded-r-full shadow-[0_0_12px_rgba(197,160,89,0.6)]" />
      )}
      
      {/* Icon with glow effect */}
      <span className={`relative z-10 transition-all duration-300 ${
        active 
          ? 'drop-shadow-[0_0_8px_rgba(197,160,89,0.6)] scale-110' 
          : 'group-hover/nav:scale-110 group-hover/nav:drop-shadow-[0_0_6px_rgba(197,160,89,0.3)]'
      }`}>
        {icon}
      </span>
      
      {/* Label */}
      <span className="relative z-10 uppercase">{label}</span>
      
      {/* Hover glow effect */}
      {!active && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent-gold/0 via-accent-gold/5 to-accent-gold/0 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300" />
      )}
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
  bid: BidData | null;
  injectBid: (b: BidData | null) => void;
  addLogEntry: (message: string) => void;
  setQnhOverride: (qnh: number) => void;
  cancelFlight: () => void;
  submitFlight: () => void;
}) {
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
    <div className="flex flex-col gap-3 h-full">
      {/* FSUIPC Connection Warning */}
      {!connection.simConnected && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
          <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-xs font-bold text-rose-400 uppercase tracking-[0.15em]">FSUIPC &mdash; Not Detected</span>
        </div>
      )}

      {/* Hero Flight Card */}
      <FlightPlan flight={flight} telemetry={telemetry} bid={bid} pilotId={auth.pilotId} injectBid={injectBid} addLogEntry={addLogEntry} cancelFlight={cancelFlight} submitFlight={submitFlight} />

      {/* Pilot Stats Row (below flight card) */}
      {stats && (
        <div className="grid grid-cols-4 gap-2">
          <StatCard label="Total Hours" value={stats.pilot.totalHours.toFixed(1)} color="text-accent-gold" />
          <StatCard label="Total Flights" value={String(stats.pilot.totalFlights)} color="text-accent-emerald" />
          <StatCard label="XP" value={stats.pilot.xp.toLocaleString()} color="text-accent-cyan" />
          <StatCard label="Rank" value={stats.pilot.rank} color="text-purple-400" small />
        </div>
      )}

      {/* Departure & Arrival METAR */}
      <div className="grid grid-cols-2 gap-3">
        <WeatherTile icao={departureIcao} label="Departure METAR" />
        <WeatherTile icao={arrivalIcao} label="Arrival METAR" onQnhUpdate={setQnhOverride} />
      </div>

      {/* Landing Summary (after flight) */}
      {score && <LandingSummary score={score} flight={flight} />}

      {/* Recent Flights */}
      {stats && stats.recentFlights.length > 0 && (
        <div className="glass-card rounded-xl border border-white/5 p-4">
          <div className="text-xs font-bold text-accent-gold/60 uppercase tracking-[0.2em] mb-3">Recent Flights</div>
          <div className="space-y-1">
            {stats.recentFlights.slice(0, 5).map((f, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-dark-950/40 border border-white/[0.03]">
                <span className="text-xs font-bold text-white w-16 truncate">{f.callsign}</span>
                <span className="text-xs font-mono text-accent-gold/70">{f.departureIcao}</span>
                <span className="text-xs text-gray-700">→</span>
                <span className="text-xs font-mono text-white/50">{f.arrivalIcao}</span>
                <span className="text-xs text-gray-600 ml-auto">{f.aircraftType}</span>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${f.landingGrade === 'Butter' ? 'bg-accent-gold/10 text-accent-gold' : f.landingGrade === 'Smooth' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-gray-400'}`}>
                  {f.landingGrade || '—'}
                </span>
                <span className="text-xs font-mono text-gray-500 w-8 text-right">{f.score}%</span>
                <span className={`text-xs font-bold uppercase tracking-wider px-1 py-0.5 rounded ${f.status === 'Approved' ? 'text-emerald-400' : f.status === 'Rejected' ? 'text-rose-400' : 'text-amber-400'}`}>
                  {f.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Log — flex-1 takes all remaining vertical space */}
      <div className="flex-1 min-h-[160px] rounded-xl bg-dark-900/40 backdrop-blur-md border border-white/[0.04] overflow-hidden">
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
