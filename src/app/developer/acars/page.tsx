import React from 'react';
import { Plane, Activity, Users, Database, Shield, Zap, Terminal, Code, Cpu } from 'lucide-react';
import connectDB from '@/lib/database';
import Pilot from '@/models/Pilot';
import Flight from '@/models/Flight';
import ActiveFlight from '@/models/ActiveFlight';

export const dynamic = 'force-dynamic';

export default async function AcarsApiDocsPage() {
    await connectDB();

    const [activeFlights, totalFlights, totalPilots] = await Promise.all([
        ActiveFlight.countDocuments(),
        Flight.countDocuments(),
        Pilot.countDocuments(),
    ]);

    const endpoints = [
        {
            method: 'POST',
            path: '/api/acars/auth',
            desc: 'Authenticate pilot and get session token',
            params: '{ pilotId, password }',
            color: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
        },
        {
            method: 'POST',
            path: '/api/acars/bid',
            desc: 'Fetch active bid, book, or cancel flight plan',
            params: '{ pilotId } | { action: "book", ... } | { action: "cancel-bid", pilotId }',
            color: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
        },
        {
            method: 'POST',
            path: '/api/acars/start',
            desc: 'Notify flight departure and create tracking record',
            params: '{ pilotId, callsign, departureIcao, arrivalIcao, aircraftType }',
            color: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
        },
        {
            method: 'POST',
            path: '/api/acars/position',
            desc: 'Send live position update (every ~5s)',
            params: '{ pilotId, callsign, latitude, longitude, altitude, heading, groundSpeed, status, phase }',
            color: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
        },
        {
            method: 'POST',
            path: '/api/acars/pirep',
            desc: 'Submit completed flight report',
            params: '{ pilotId, callsign, departureIcao, arrivalIcao, flightTimeMinutes, landingRate, fuelUsed, distanceNm, score, timestamp, signature }',
            color: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
        },
        {
            method: 'POST',
            path: '/api/acars/end',
            desc: 'Notify flight ended or cancelled',
            params: '{ pilotId, callsign }',
            color: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
        },
        {
            method: 'POST',
            path: '/api/acars/aircraft-health',
            desc: 'Pre-flight aircraft health check',
            params: '{ registration }',
            color: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
        },
        {
            method: 'GET',
            path: '/api/acars?action=traffic',
            desc: 'All active flights for live map',
            params: '',
            color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
        },
        {
            method: 'GET',
            path: '/api/acars?action=pilot-stats&pilotId=LVT001',
            desc: 'Pilot statistics and recent flights',
            params: '',
            color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
        },
        {
            method: 'GET',
            path: '/api/acars/ping',
            desc: 'Heartbeat / keep-alive',
            params: '',
            color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
        },
        {
            method: 'GET',
            path: '/api/acars/live-map',
            desc: 'Active flights for live map (with stale cleanup)',
            params: '',
            color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
        }
    ];

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-300 font-sans selection:bg-accent-gold/30">
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-gold/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/5 blur-[100px] rounded-full" />
                <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[50%] h-[20%] bg-purple-500/5 blur-[150px] rounded-full" />
            </div>

            <main className="relative z-10 max-w-5xl mx-auto px-6 py-16 md:py-24">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-16 border-b border-white/5 pb-12">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-gold to-yellow-600 flex items-center justify-center shadow-lg shadow-accent-gold/20 shrink-0">
                            <Plane className="w-8 h-8 text-[#0a0c10] fill-current" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                                ACARS API
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest uppercase flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Online
                                </span>
                            </h1>
                            <p className="text-slate-400 mt-2 text-sm md:text-base">
                                Aircraft Communications & Reporting System &middot; v1.3.0
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 px-4 py-2 rounded-xl backdrop-blur-md">
                        <Cpu className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-300">System Operational</span>
                    </div>
                </div>

                {/* Live Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Activity className="w-12 h-12 text-accent-gold" />
                        </div>
                        <div className="text-4xl font-black text-accent-gold font-mono tracking-tight mb-2">
                            {activeFlights}
                        </div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5" />
                            Active Flights
                        </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Users className="w-12 h-12 text-blue-400" />
                        </div>
                        <div className="text-4xl font-black text-white font-mono tracking-tight mb-2">
                            {totalPilots}
                        </div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Users className="w-3.5 h-3.5" />
                            Registered Pilots
                        </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Database className="w-12 h-12 text-purple-400" />
                        </div>
                        <div className="text-4xl font-black text-white font-mono tracking-tight mb-2">
                            {totalFlights}
                        </div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Database className="w-3.5 h-3.5" />
                            Total PIREPs
                        </div>
                    </div>
                </div>

                {/* Endpoints Documentation */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-8">
                        <Terminal className="w-5 h-5 text-accent-gold" />
                        <h2 className="text-xl font-bold text-white tracking-wide">API Endpoints Reference</h2>
                    </div>

                    <div className="bg-white/[0.01] border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
                        {endpoints.map((ep, i) => (
                            <div 
                                key={i} 
                                className="group flex flex-col md:flex-row md:items-start gap-4 p-5 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                            >
                                <div className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border shrink-0 md:mt-1 ${ep.color}`}>
                                    {ep.method}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1.5">
                                        <code className="text-[13px] font-bold text-white tracking-tight bg-black/20 px-2 py-0.5 rounded">
                                            {ep.path}
                                        </code>
                                    </div>
                                    <p className="text-[13px] text-slate-400 mb-3">
                                        {ep.desc}
                                    </p>
                                    {ep.params && (
                                        <div className="bg-black/40 border border-white/5 rounded-lg p-3 overflow-x-auto">
                                            <code className="text-[11px] text-slate-300 font-mono flex items-center gap-2">
                                                <Code className="w-3.5 h-3.5 text-slate-500" />
                                                {ep.params}
                                            </code>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-20 pt-8 border-t border-white/5 text-center flex flex-col items-center justify-center gap-4">
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                        <Shield className="w-4 h-4" />
                        Secured API Gateway
                    </div>
                    <p className="text-xs text-slate-600">
                        &copy; {new Date().getFullYear()} Levant Virtual Airlines. All rights reserved.
                    </p>
                </div>

            </main>
        </div>
    );
}
