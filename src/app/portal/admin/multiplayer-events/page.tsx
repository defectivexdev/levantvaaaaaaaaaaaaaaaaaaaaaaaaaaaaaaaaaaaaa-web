'use client';

import { useState, useEffect } from 'react';
import { Calendar, Users, Trophy, Plus, Edit, Trash2, Plane, MapPin, Clock, Target, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface MultiplayerEvent {
    _id: string;
    title: string;
    description: string;
    eventType: 'group_flight' | 'formation' | 'race';
    status: 'scheduled' | 'active' | 'completed' | 'cancelled';
    startTime: string;
    departureIcao: string;
    departureAirport?: string;
    arrivalIcao: string;
    arrivalAirport?: string;
    route?: string;
    aircraft?: string;
    estimatedFlightTime?: string;
    localTime?: boolean;
    reminderMinutes?: number;
    participants: any[];
    scoringEnabled: boolean;
    isPublic: boolean;
}

export default function AdminMultiplayerEventsPage() {
    const [events, setEvents] = useState<MultiplayerEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [editingEvent, setEditingEvent] = useState<MultiplayerEvent | null>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'active' | 'completed'>('all');

    // Form state
    const [formData, setFormData] = useState({
        eventType: 'group_flight',
        startTime: '',
        departureIcao: '',
        departureAirport: '',
        arrivalIcao: '',
        arrivalAirport: '',
        route: '',
        aircraft: '',
        estimatedFlightTime: '',
        localTime: true,
        reminderMinutes: '15',
        scoringEnabled: false,
        isPublic: true,
    });

    const [fetchingAirport, setFetchingAirport] = useState<'departure' | 'arrival' | null>(null);
    const [showAnnouncement, setShowAnnouncement] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, [statusFilter]);

    const fetchEvents = async () => {
        try {
            const url = statusFilter === 'all' 
                ? '/api/admin/multiplayer-events'
                : `/api/admin/multiplayer-events?status=${statusFilter}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.success) setEvents(data.events);
        } catch (error) {
            console.error('Fetch events error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            // Auto-generate title from route
            const title = `${formData.departureIcao} → ${formData.arrivalIcao} Group Flight`;
            const description = `Group flight from ${formData.departureAirport || formData.departureIcao} to ${formData.arrivalAirport || formData.arrivalIcao}`;
            
            // Convert datetime-local format (YYYY-MM-DDTHH:mm) to ISO string with Z timezone
            // This treats the input as literal UTC time without any conversion
            const utcTime = formData.startTime.includes('T') 
                ? formData.startTime + ':00.000Z' 
                : formData.startTime;
            
            const payload = {
                ...formData,
                title,
                description,
                startTime: utcTime,
                reminderMinutes: formData.reminderMinutes ? parseInt(formData.reminderMinutes) : 15,
            };

            const res = await fetch('/api/admin/multiplayer-events', {
                method: editingEvent ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingEvent ? { eventId: editingEvent._id, ...payload } : payload),
            });

            const data = await res.json();
            if (data.success) {
                fetchEvents();
                resetForm();
            }
        } catch (error) {
            console.error('Submit error:', error);
        }
    };

    const handleDelete = async (eventId: string) => {
        if (!confirm('Delete this event?')) return;

        try {
            const res = await fetch(`/api/admin/multiplayer-events?eventId=${eventId}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.success) fetchEvents();
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const handleStatusChange = async (eventId: string, newStatus: 'active' | 'completed' | 'cancelled') => {
        const confirmMessages = {
            active: 'Start this group flight? It will move to the Active tab.',
            completed: 'Mark this group flight as completed? It will move to the Completed tab.',
            cancelled: 'Cancel this group flight?'
        };

        if (!confirm(confirmMessages[newStatus])) return;

        try {
            const res = await fetch('/api/admin/multiplayer-events/status', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId, status: newStatus }),
            });
            const data = await res.json();
            if (data.success) {
                fetchEvents();
            } else {
                alert(data.error || 'Failed to update status');
            }
        } catch (error) {
            console.error('Status update error:', error);
            alert('Failed to update status');
        }
    };

    const fetchAirportName = async (icao: string, type: 'departure' | 'arrival') => {
        if (icao.length !== 4) return;
        
        setFetchingAirport(type);
        try {
            const res = await fetch(`https://airportdb.io/api/v1/airport/${icao}?apiToken=9cade662e6ead0aeb8104ee946ffc365e061a7f3e30db6f0c45322944bdbea25111c511f3894d6c7e4b76b370da8a105`);
            const data = await res.json();
            if (data && data.name) {
                const airportName = data.name;
                if (type === 'departure') {
                    setFormData(prev => ({ ...prev, departureAirport: airportName }));
                } else {
                    setFormData(prev => ({ ...prev, arrivalAirport: airportName }));
                }
            }
        } catch (error) {
            console.error('Fetch airport error:', error);
        } finally {
            setFetchingAirport(null);
        }
    };

    const resetForm = () => {
        setFormData({
            eventType: 'group_flight',
            startTime: '',
            departureIcao: '',
            departureAirport: '',
            arrivalIcao: '',
            arrivalAirport: '',
            route: '',
            aircraft: '',
            estimatedFlightTime: '',
            localTime: true,
            reminderMinutes: '15',
            scoringEnabled: false,
            isPublic: true,
        });
        setShowCreate(false);
        setEditingEvent(null);
    };

    const startEdit = (event: MultiplayerEvent) => {
        setFormData({
            eventType: event.eventType,
            startTime: new Date(event.startTime).toISOString().slice(0, 16),
            departureIcao: event.departureIcao,
            departureAirport: event.departureAirport || '',
            arrivalIcao: event.arrivalIcao,
            arrivalAirport: event.arrivalAirport || '',
            route: event.route || '',
            aircraft: event.aircraft || '',
            estimatedFlightTime: event.estimatedFlightTime || '',
            localTime: event.localTime ?? true,
            reminderMinutes: event.reminderMinutes?.toString() || '15',
            scoringEnabled: event.scoringEnabled,
            isPublic: event.isPublic,
        });
        setEditingEvent(event);
        setShowCreate(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-accent-gold" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Group Flights</h1>
                    <p className="text-sm text-gray-400 mt-1">Create and manage coordinated VA group flights</p>
                </div>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="flex items-center gap-2 px-4 py-2 bg-accent-gold text-black rounded-lg hover:bg-accent-gold/90 transition-colors font-medium"
                >
                    <Plus size={18} />
                    Create Group Flight
                </button>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex gap-2 border-b border-white/10">
                {(['all', 'scheduled', 'active', 'completed'] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                            statusFilter === status
                                ? 'border-accent-gold text-accent-gold'
                                : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {/* Create/Edit Form */}
            {showCreate && (
                <form onSubmit={handleSubmit} className="bg-[#111] border border-white/10 rounded-xl p-6 space-y-4">
                    <h2 className="text-xl font-bold text-white mb-4">{editingEvent ? 'Edit Group Flight' : 'Create Group Flight'}</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Start Time (UTC/Zulu)</label>
                            <input
                                type="datetime-local"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                className="w-full bg-panel/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Enter time in UTC/Zulu timezone</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Departure ICAO</label>
                            <input
                                type="text"
                                value={formData.departureIcao}
                                onChange={(e) => {
                                    const icao = e.target.value.toUpperCase();
                                    setFormData({ ...formData, departureIcao: icao });
                                    if (icao.length === 4) fetchAirportName(icao, 'departure');
                                }}
                                className="w-full bg-panel/50 border border-white/10 rounded-lg px-4 py-2 text-white uppercase"
                                maxLength={4}
                                required
                            />
                            {formData.departureAirport && (
                                <p className="text-xs text-accent-gold mt-1">{formData.departureAirport}</p>
                            )}
                            {fetchingAirport === 'departure' && (
                                <p className="text-xs text-gray-500 mt-1">Fetching airport...</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Arrival ICAO</label>
                            <input
                                type="text"
                                value={formData.arrivalIcao}
                                onChange={(e) => {
                                    const icao = e.target.value.toUpperCase();
                                    setFormData({ ...formData, arrivalIcao: icao });
                                    if (icao.length === 4) fetchAirportName(icao, 'arrival');
                                }}
                                className="w-full bg-panel/50 border border-white/10 rounded-lg px-4 py-2 text-white uppercase"
                                maxLength={4}
                                required
                            />
                            {formData.arrivalAirport && (
                                <p className="text-xs text-accent-gold mt-1">{formData.arrivalAirport}</p>
                            )}
                            {fetchingAirport === 'arrival' && (
                                <p className="text-xs text-gray-500 mt-1">Fetching airport...</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Route (Optional)</label>
                            <input
                                type="text"
                                value={formData.route}
                                onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                                className="w-full bg-panel/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Aircraft (Optional)</label>
                            <input
                                type="text"
                                value={formData.aircraft}
                                onChange={(e) => setFormData({ ...formData, aircraft: e.target.value })}
                                className="w-full bg-panel/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                                placeholder="e.g., A320, B737"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Estimated Flight Time</label>
                            <input
                                type="text"
                                value={formData.estimatedFlightTime}
                                onChange={(e) => setFormData({ ...formData, estimatedFlightTime: e.target.value })}
                                className="w-full bg-panel/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                                placeholder="e.g., 3:00 H"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Reminder (Minutes Before)</label>
                            <input
                                type="number"
                                value={formData.reminderMinutes}
                                onChange={(e) => setFormData({ ...formData, reminderMinutes: e.target.value })}
                                className="w-full bg-panel/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                                placeholder="15"
                            />
                        </div>

                        <div className="col-span-2 flex gap-4">
                            <label className="flex items-center gap-2 text-sm text-gray-400">
                                <input
                                    type="checkbox"
                                    checked={formData.localTime}
                                    onChange={(e) => setFormData({ ...formData, localTime: e.target.checked })}
                                    className="rounded"
                                />
                                Show Local Time
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-400">
                                <input
                                    type="checkbox"
                                    checked={formData.scoringEnabled}
                                    onChange={(e) => setFormData({ ...formData, scoringEnabled: e.target.checked })}
                                    className="rounded"
                                />
                                Enable Scoring/Leaderboard
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-400">
                                <input
                                    type="checkbox"
                                    checked={formData.isPublic}
                                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                                    className="rounded"
                                />
                                Public Event
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-accent-gold text-black rounded-lg hover:bg-accent-gold/90 transition-colors font-medium"
                        >
                            {editingEvent ? 'Update Group Flight' : 'Create Group Flight'}
                        </button>
                    </div>
                </form>
            )}

            {/* Events List */}
            <div className="grid gap-4">
                {events.map((event) => (
                    <div key={event._id} className="bg-[#111] border border-white/10 rounded-xl p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-bold text-white">{event.title}</h3>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        event.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                                        event.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                        event.status === 'completed' ? 'bg-gray-500/20 text-gray-400' :
                                        'bg-red-500/20 text-red-400'
                                    }`}>
                                        {event.status.toUpperCase()}
                                    </span>
                                    <span className="px-2 py-1 rounded text-xs font-bold bg-purple-500/20 text-purple-400">
                                        {event.eventType.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 mb-4">{event.description}</p>
                                
                                <div className="grid grid-cols-4 gap-4 text-sm">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <MapPin size={14} />
                                        <span>{event.departureIcao} → {event.arrivalIcao}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Clock size={14} />
                                        <span>{new Date(event.startTime).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Users size={14} />
                                        <span>{event.participants.length} Pilots</span>
                                    </div>
                                    {event.scoringEnabled && (
                                        <div className="flex items-center gap-2 text-accent-gold">
                                            <Trophy size={14} />
                                            <span>Competitive</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {event.status === 'scheduled' && (
                                    <button
                                        onClick={() => handleStatusChange(event._id, 'active')}
                                        className="px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-xs font-bold flex items-center gap-1"
                                        title="Start this group flight"
                                    >
                                        <CheckCircle size={14} />
                                        Start
                                    </button>
                                )}
                                {event.status === 'active' && (
                                    <button
                                        onClick={() => handleStatusChange(event._id, 'completed')}
                                        className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-xs font-bold flex items-center gap-1"
                                        title="Mark as completed"
                                    >
                                        <CheckCircle size={14} />
                                        Complete
                                    </button>
                                )}
                                <button
                                    onClick={() => startEdit(event)}
                                    className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                                >
                                    <Edit size={16} />
                                </button>
                                {event.status === 'scheduled' && (
                                    <button
                                        onClick={() => handleStatusChange(event._id, 'cancelled')}
                                        className="p-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors"
                                        title="Cancel event"
                                    >
                                        <XCircle size={16} />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(event._id)}
                                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {events.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No events created yet. Click "Create Event" to get started!
                    </div>
                )}
            </div>
        </div>
    );
}
