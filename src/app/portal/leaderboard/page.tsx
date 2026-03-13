'use client';

import { useState, useEffect, Suspense } from 'react';
import { Trophy, Loader2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import TierBadge from '@/components/pilot/TierBadge';
import Image from 'next/image';

interface LeaderboardPilot {
    rank: number;
    pilotId: string;
    name: string;
    hours: number;
    flights: number;
    credits?: number;
    avatarUrl?: string;
    isLanding?: boolean;
    isCredits?: boolean;
}

const FILTERS = [
    { key: 'all-time', label: 'All-Time', icon: Trophy },
    { key: 'credits', label: 'Top Credits', icon: Zap },
] as const;

function LeaderboardContent() {
    const searchParams = useSearchParams();
    const tabParam = searchParams?.get('tab');
    const [filter, setFilter] = useState<'all-time' | 'credits'>(
        tabParam === 'credits' ? 'credits' : 'all-time'
    );
    const [leaderboard, setLeaderboard] = useState<LeaderboardPilot[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchLeaderboard = () => {
            setLoading(true);
            fetch(`/api/leaderboard?type=${filter}`)
                .then(res => res.json())
                .then(data => setLeaderboard(data.pilots || []))
                .catch(() => {})
                .finally(() => setLoading(false));
        };
        
        fetchLeaderboard();
        const interval = setInterval(fetchLeaderboard, 30000);
        return () => clearInterval(interval);
    }, [filter]);

    const top3 = leaderboard.slice(0, 3);
    const rest = leaderboard.slice(3);

    const formatHours = (decimalHours: number) => {
        const hours = Math.floor(decimalHours);
        const minutes = Math.round((decimalHours - hours) * 60);
        return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    };

    const getTierByHours = (hours: number): 'bronze' | 'silver' | 'gold' | 'diamond' => {
        if (hours < 150) return 'bronze';
        if (hours < 1000) return 'silver';
        if (hours < 5000) return 'gold';
        return 'diamond';
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-accent-gold" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Pilot Leaderboard</h1>
                        <p className="text-gray-500 text-xs">Top performers</p>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div key="lb" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                    <div className="flex gap-2">
                        {FILTERS.map(f => (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                                    filter === f.key 
                                        ? 'bg-accent-gold/10 border-accent-gold/30 text-accent-gold' 
                                        : 'bg-transparent border-white/5 text-gray-500 hover:text-white hover:border-white/10'
                                }`}
                            >
                                <f.icon className="w-3.5 h-3.5" />
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <Loader2 className="w-8 h-8 animate-spin text-accent-gold mb-4" />
                            <p className="text-gray-500 text-xs font-mono uppercase tracking-widest">Loading rankings...</p>
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div className="text-center py-24 bg-panel backdrop-blur-sm border border-white/5 rounded-2xl">
                            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                            <p className="text-gray-500">No pilots on the leaderboard yet.</p>
                        </div>
                    ) : (
                        <>
                            {top3.length >= 3 && (
                                <div className="grid grid-cols-3 gap-4 items-end">
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                        className="bg-panel backdrop-blur-sm border border-gray-500/20 rounded-2xl p-5 text-center relative overflow-hidden group hover:border-gray-400/30 transition-all"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-500/5 to-transparent" />
                                        <div className="relative">
                                            <div className="text-3xl mb-3">🥈</div>
                                            <div className="w-14 h-14 rounded-full mx-auto mb-3 bg-panel backdrop-blur-sm border-2 border-gray-500/30 overflow-hidden">
                                                {top3[1].avatarUrl ? (
                                                    <img src={top3[1].avatarUrl} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                ) : null}
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-sm bg-panel backdrop-blur-sm">
                                                    {top3[1].name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                            </div>
                                            <p className="text-white font-bold text-sm truncate">{top3[1].name}</p>
                                            <p className="text-gray-500 font-mono text-[10px] mt-0.5">{top3[1].pilotId}</p>
                                            <div className="mt-3 pt-3 border-t border-white/5">
                                                <p className="text-gray-300 font-bold font-mono text-lg">
                                                    {top3[1].isCredits ? `${(top3[1].credits || 0).toLocaleString()} CR` : top3[1].isLanding ? `${top3[1].hours.toFixed(0)} fpm` : formatHours(top3[1].hours)}
                                                </p>
                                                <p className="text-gray-600 text-[9px] uppercase tracking-widest">{top3[1].flights} flights</p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
                                        className="bg-panel backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-6 text-center relative overflow-hidden group hover:border-yellow-400/40 transition-all shadow-[0_0_40px_rgba(234,179,8,0.05)]"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/5 to-transparent" />
                                        <div className="relative">
                                            <div className="text-4xl mb-3">🥇</div>
                                            <div className="w-16 h-16 rounded-full mx-auto mb-3 bg-panel backdrop-blur-sm border-2 border-yellow-500/40 overflow-hidden ring-4 ring-yellow-500/10">
                                                {top3[0].avatarUrl ? (
                                                    <img src={top3[0].avatarUrl} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                ) : null}
                                                <div className="w-full h-full flex items-center justify-center text-accent-gold font-bold bg-panel backdrop-blur-sm">
                                                    {top3[0].name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                            </div>
                                            <p className="text-white font-bold truncate">{top3[0].name}</p>
                                            <p className="text-accent-gold font-mono text-[10px] mt-0.5">{top3[0].pilotId}</p>
                                            <div className="mt-3 pt-3 border-t border-white/5">
                                                <p className="text-accent-gold font-bold font-mono text-2xl">
                                                    {top3[0].isCredits ? `${(top3[0].credits || 0).toLocaleString()} CR` : top3[0].isLanding ? `${top3[0].hours.toFixed(0)} fpm` : formatHours(top3[0].hours)}
                                                </p>
                                                <p className="text-gray-600 text-[9px] uppercase tracking-widest">{top3[0].flights} flights</p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                        className="bg-panel backdrop-blur-sm border border-orange-500/20 rounded-2xl p-5 text-center relative overflow-hidden group hover:border-orange-400/30 transition-all"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-orange-500/5 to-transparent" />
                                        <div className="relative">
                                            <div className="text-3xl mb-3">🥉</div>
                                            <div className="w-14 h-14 rounded-full mx-auto mb-3 bg-panel backdrop-blur-sm border-2 border-orange-500/30 overflow-hidden">
                                                {top3[2].avatarUrl ? (
                                                    <img src={top3[2].avatarUrl} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                ) : null}
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-sm bg-panel backdrop-blur-sm">
                                                    {top3[2].name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                            </div>
                                            <p className="text-white font-bold text-sm truncate">{top3[2].name}</p>
                                            <p className="text-gray-500 font-mono text-[10px] mt-0.5">{top3[2].pilotId}</p>
                                            <div className="mt-3 pt-3 border-t border-white/5">
                                                <p className="text-orange-300 font-bold font-mono text-lg">
                                                    {top3[2].isCredits ? `${(top3[2].credits || 0).toLocaleString()} CR` : top3[2].isLanding ? `${top3[2].hours.toFixed(0)} fpm` : formatHours(top3[2].hours)}
                                                </p>
                                                <p className="text-gray-600 text-[9px] uppercase tracking-widest">{top3[2].flights} flights</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            )}

                            {rest.length > 0 && (
                                <div className="bg-panel backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden">
                                    {rest.map((pilot, i) => (
                                        <motion.div
                                            key={pilot.pilotId}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.05 * i }}
                                            className="flex items-center gap-4 px-6 py-4 border-b border-white/[0.03] last:border-b-0 hover:bg-white/[0.02] transition-colors"
                                        >
                                            <span className="text-gray-600 font-mono font-bold text-sm w-8 text-center">#{i + 4}</span>
                                            <div className="w-10 h-10 rounded-full bg-panel backdrop-blur-sm border border-white/5 overflow-hidden shrink-0">
                                                {pilot.avatarUrl ? (
                                                    <img src={pilot.avatarUrl} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                ) : null}
                                                <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-xs bg-panel backdrop-blur-sm">
                                                    {pilot.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-white font-semibold text-sm truncate">{pilot.name}</p>
                                                    <TierBadge tier={getTierByHours(pilot.hours)} size="sm" />
                                                </div>
                                                <p className="text-gray-500 font-mono text-[10px]">{pilot.pilotId}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                {pilot.isCredits ? (
                                                    <p className="text-emerald-400 font-bold font-mono">{(pilot.credits || 0).toLocaleString()} <span className="text-[10px] text-gray-500">CR</span></p>
                                                ) : pilot.isLanding ? (
                                                    <p className="text-emerald-400 font-bold font-mono">{pilot.hours.toFixed(0)} <span className="text-[10px] text-gray-500">fpm</span></p>
                                                ) : (
                                                    <p className="text-white font-bold font-mono">{formatHours(pilot.hours)}</p>
                                                )}
                                                <p className="text-gray-600 text-[10px] font-mono">{pilot.flights} flights</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

export default function LeaderboardPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-accent-gold" />
            </div>
        }>
            <LeaderboardContent />
        </Suspense>
    );
}
