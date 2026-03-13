'use client';

import { useState, useEffect } from 'react';
import { Calendar, Users, MapPin, Clock, Plane, Trophy, Loader2, UserPlus, UserMinus, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface GroupFlight {
    _id: string;
    title: string;
    description: string;
    eventType: string;
    status: string;
    startTime: string;
    departureIcao: string;
    departureAirport?: string;
    arrivalIcao: string;
    arrivalAirport?: string;
    route?: string;
    aircraft?: string;
    estimatedFlightTime?: string;
    reminderMinutes?: number;
    maxParticipants?: number;
    participants: any[];
    scoringEnabled: boolean;
}

export default function GroupFlightsPage() {
    const { user } = useAuth();
    const [flights, setFlights] = useState<GroupFlight[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'upcoming' | 'active' | 'completed'>('upcoming');
    const [joiningId, setJoiningId] = useState<string | null>(null);

    useEffect(() => {
        fetchFlights();
        
        // Poll for status updates every 30 seconds
        const interval = setInterval(() => {
            fetchFlights();
        }, 30000);
        
        return () => clearInterval(interval);
    }, [filter]);

    const fetchFlights = async () => {
        try {
            const res = await fetch(`/api/portal/multiplayer-events?filter=${filter}`);
            const data = await res.json();
            if (data.success) setFlights(data.events);
        } catch (error) {
            console.error('Fetch flights error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (eventId: string) => {
        setJoiningId(eventId);
        try {
            const res = await fetch('/api/portal/multiplayer-events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId }),
            });
            const data = await res.json();
            if (data.success) {
                fetchFlights();
            } else {
                alert(data.error || 'Failed to join');
            }
        } catch (error) {
            console.error('Join error:', error);
            alert('Failed to join group flight');
        } finally {
            setJoiningId(null);
        }
    };

    const handleLeave = async (eventId: string) => {
        if (!confirm('Leave this group flight?')) return;
        
        try {
            const res = await fetch(`/api/portal/multiplayer-events?eventId=${eventId}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.success) {
                fetchFlights();
            } else {
                alert(data.error || 'Failed to leave');
            }
        } catch (error) {
            console.error('Leave error:', error);
            alert('Failed to leave group flight');
        }
    };

    const isJoined = (flight: GroupFlight) => {
        return flight.participants.some((p: any) => p.pilotId === user?.pilotId);
    };

    const getTimeRemaining = (startTime: string) => {
        const now = new Date();
        const start = new Date(startTime);
        const diff = start.getTime() - now.getTime();
        
        if (diff < 0) return 'Started';
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `in ${days} day${days > 1 ? 's' : ''}`;
        }
        
        return `in ${hours}h ${minutes}m`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-accent-gold" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Group Flights</h1>
                <p className="text-gray-400">Join coordinated flights with other Levant VA pilots</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-white/10">
                {(['upcoming', 'active', 'completed'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                            filter === tab
                                ? 'border-accent-gold text-accent-gold'
                                : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Flights Grid */}
            <div className="grid gap-4">
                {flights.length === 0 ? (
                    <div className="text-center py-12 bg-[#111] border border-white/10 rounded-xl">
                        <Users size={48} className="mx-auto text-gray-600 mb-3" />
                        <p className="text-gray-500">No {filter} group flights</p>
                    </div>
                ) : (
                    flights.map((flight) => {
                        const joined = isJoined(flight);
                        const canJoin = !joined && flight.status === 'scheduled';

                        return (
                            <div key={flight._id} className="bg-[#111] border border-white/10 rounded-xl p-6 hover:border-accent-gold/30 transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-white">{flight.title}</h3>
                                            {joined && (
                                                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded border border-green-500/30">
                                                    <CheckCircle size={12} className="inline mr-1" />
                                                    JOINED
                                                </span>
                                            )}
                                            {flight.scoringEnabled && (
                                                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-bold rounded border border-purple-500/30">
                                                    <Trophy size={12} className="inline mr-1" />
                                                    COMPETITIVE
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-400 text-sm mb-4">{flight.description}</p>

                                        {/* Flight Details Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <MapPin size={16} className="text-accent-gold" />
                                                <div>
                                                    <p className="text-gray-500 text-xs">Route</p>
                                                    <p className="text-white font-mono">{flight.departureIcao} → {flight.arrivalIcao}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar size={16} className="text-blue-400" />
                                                <div>
                                                    <p className="text-gray-500 text-xs">Date (Local)</p>
                                                    <p className="text-white">{new Date(flight.startTime).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock size={16} className="text-emerald-400" />
                                                <div>
                                                    <p className="text-gray-500 text-xs">Time (Local)</p>
                                                    <p className="text-white">{new Date(flight.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                    <p className="text-gray-500 text-[10px]">{new Date(flight.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}Z</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm">
                                                <Users size={16} className="text-purple-400" />
                                                <div>
                                                    <p className="text-gray-500 text-xs">Pilots</p>
                                                    <p className="text-white">{flight.participants.length}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Additional Info */}
                                        <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                                            {flight.estimatedFlightTime && (
                                                <span>⏱️ Air Time: {flight.estimatedFlightTime}</span>
                                            )}
                                            {flight.departureAirport && (
                                                <span>📍 {flight.departureAirport}</span>
                                            )}
                                        </div>

                                        {/* Route */}
                                        {flight.route && (
                                            <div className="mt-3 p-3 bg-black/30 rounded-lg border border-white/5">
                                                <p className="text-xs text-gray-500 mb-1">Route</p>
                                                <p className="text-xs text-gray-300 font-mono break-all">{flight.route}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Button */}
                                    <div className="ml-4 flex flex-col items-end gap-2">
                                        <div className="text-right mb-2">
                                            <p className="text-xs text-gray-500">Starts</p>
                                            <p className="text-sm font-bold text-accent-gold">{getTimeRemaining(flight.startTime)}</p>
                                        </div>

                                        {flight.status === 'scheduled' && (
                                            joined ? (
                                                <button
                                                    onClick={() => handleLeave(flight._id)}
                                                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/30 text-sm font-medium flex items-center gap-2"
                                                >
                                                    <UserMinus size={16} />
                                                    Leave
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleJoin(flight._id)}
                                                    disabled={joiningId === flight._id}
                                                    className="px-4 py-2 bg-accent-gold text-black rounded-lg hover:bg-accent-gold/90 transition-colors text-sm font-medium flex items-center gap-2"
                                                >
                                                    {joiningId === flight._id ? (
                                                        <Loader2 size={16} className="animate-spin" />
                                                    ) : (
                                                        <UserPlus size={16} />
                                                    )}
                                                    Join Flight
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>

                                {/* Participants */}
                                {flight.participants.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <p className="text-xs text-gray-500 mb-2">Registered Pilots ({flight.participants.length})</p>
                                        <div className="flex flex-wrap gap-2">
                                            {flight.participants.slice(0, 10).map((p: any, i: number) => (
                                                <span key={i} className="px-2 py-1 bg-white/5 text-gray-300 text-xs rounded border border-white/10">
                                                    {p.pilotName}
                                                </span>
                                            ))}
                                            {flight.participants.length > 10 && (
                                                <span className="px-2 py-1 bg-white/5 text-gray-500 text-xs rounded border border-white/10">
                                                    +{flight.participants.length - 10} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
