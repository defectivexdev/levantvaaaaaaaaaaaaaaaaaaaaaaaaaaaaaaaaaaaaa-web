'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, CheckCircle, XCircle, AlertCircle, Info, MessageSquare, Trash2, ExternalLink, Image, AlertTriangle, FileText, Plane, Clock, TrendingUp } from 'lucide-react';

interface PIREP {
    _id: string;
    pilot_name: string;
    flight_number: string;
    callsign: string;
    departure_icao: string;
    arrival_icao: string;
    aircraft_type: string;
    flight_time: number;
    landing_rate: number;
    score: number;
    approved_status: number; // 0=Pending, 1=Approved, 2=Rejected
    submitted_at: string;
    comments?: string;
    admin_comments?: string;
    is_manual?: boolean;
    tracker_link?: string;
    proof_image?: string;
}

function isA380(aircraft: string): boolean {
    const normalized = (aircraft || '').replace(/[\s\-_]/g, '').toUpperCase();
    return normalized.includes('A380') || normalized.includes('A388') || normalized.includes('380');
}

export default function AdminPirepsPage() {
    const [allPireps, setAllPireps] = useState<PIREP[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPirep, setSelectedPirep] = useState<PIREP | null>(null);
    const [adminComment, setAdminComment] = useState('');
    const [processing, setProcessing] = useState(false);
    const [lightboxImg, setLightboxImg] = useState<string | null>(null);

    useEffect(() => {
        fetchPireps();
    }, []);

    const fetchPireps = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/pireps?status=all`);
            const data = await res.json();
            if (data.pireps) {
                setAllPireps(data.pireps);
            }
        } catch (error) {
            console.error('Error fetching PIREPs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (id: string, status: number) => {
        setProcessing(true);
        try {
            const res = await fetch(`/api/admin/pireps/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    approved_status: status,
                    admin_comments: adminComment
                })
            });

            if (res.ok) {
                setSelectedPirep(null);
                setAdminComment('');
                fetchPireps();
            }
        } catch (error) {
            console.error('Error reviewing PIREP:', error);
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to DELETE this PIREP? This will also reverse the Pilot\'s credits and statistics.')) return;
        
        setProcessing(true);
        try {
            const res = await fetch(`/api/admin/pireps/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setSelectedPirep(null);
                fetchPireps();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete PIREP');
            }
        } catch (error) {
            console.error('Error deleting PIREP:', error);
        } finally {
            setProcessing(false);
        }
    };

    const getStatusBadge = (status: number) => {
        switch (status) {
            case 0: return <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold rounded-lg shadow-sm"><span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />PENDING</span>;
            case 1: return <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-lg shadow-sm"><span className="w-2 h-2 rounded-full bg-emerald-400" />APPROVED</span>;
            case 2: return <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold rounded-lg shadow-sm"><span className="w-2 h-2 rounded-full bg-red-400" />REJECTED</span>;
            default: return null;
        }
    };

    const filteredPireps = useMemo(() => {
        let filtered = allPireps;
        
        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(p => {
                if (statusFilter === 'pending') return p.approved_status === 0;
                if (statusFilter === 'approved') return p.approved_status === 1;
                if (statusFilter === 'rejected') return p.approved_status === 2;
                return true;
            });
        }
        
        // Filter by search
        if (searchTerm) {
            filtered = filtered.filter(p => {
                const matchesSearch = p.callsign.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.pilot_name.toLowerCase().includes(searchTerm.toLowerCase());
                return matchesSearch;
            });
        }
        
        return filtered;
    }, [allPireps, statusFilter, searchTerm]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">PIREP Management</h1>
                    <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                        <FileText size={14} className="text-accent-gold" />
                        Review and manage flight reports
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex gap-2 bg-gradient-to-r from-[#0a0a0a] to-[#0d0d0d] p-1.5 rounded-2xl border border-white/[0.08] overflow-x-auto flex-shrink-0 shadow-lg shadow-black/20">
                    {['pending', 'approved', 'rejected', 'all'].map(s => {
                        const count = s === 'all' ? allPireps.length : allPireps.filter(p => {
                            if (s === 'pending') return p.approved_status === 0;
                            if (s === 'approved') return p.approved_status === 1;
                            if (s === 'rejected') return p.approved_status === 2;
                            return true;
                        }).length;
                        return (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                                    statusFilter === s
                                        ? 'bg-gradient-to-r from-accent-gold/20 to-accent-gold/10 text-accent-gold border border-accent-gold/30 shadow-lg shadow-accent-gold/10'
                                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]'
                                }`}
                            >
                                {s}
                                {!loading && (
                                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-black ${
                                        statusFilter === s 
                                            ? 'bg-accent-gold/20 text-accent-gold' 
                                            : 'bg-white/[0.05] text-gray-600'
                                    }`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input
                        type="text"
                        placeholder="Search by Pilot or Callsign..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.currentTarget.value)}
                        className="w-full bg-gradient-to-r from-[#0a0a0a] to-[#0d0d0d] border border-white/[0.08] rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent-gold/40 focus:ring-2 focus:ring-accent-gold/10 transition-all shadow-lg shadow-black/20"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-gradient-to-br from-[#0a0a0a] to-[#0d0d0d] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl shadow-black/30">
                <table className="w-full text-left">
                    <thead className="bg-gradient-to-r from-[#0c0c0c] to-[#0a0a0a] border-b border-white/[0.06]">
                        <tr className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            <th className="px-6 py-4">Pilot</th>
                            <th className="px-6 py-4">Flight</th>
                            <th className="px-6 py-4">Time</th>
                            <th className="px-6 py-4">Rate</th>
                            <th className="px-6 py-4">Score</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-16 text-center text-gray-500 animate-pulse">
                                    <FileText className="w-10 h-10 mx-auto mb-3 text-gray-700" />
                                    <p className="text-sm font-medium">Loading flight reports...</p>
                                </td>
                            </tr>
                        ) : filteredPireps.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-20 text-center">
                                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-700" />
                                    <p className="text-sm font-medium text-gray-500">No flight reports found.</p>
                                </td>
                            </tr>
                        ) : filteredPireps.map(p => (
                            <tr key={p._id} className="hover:bg-gradient-to-r hover:from-accent-gold/5 hover:to-transparent transition-all group border-l-2 border-transparent hover:border-accent-gold/30">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#161616] to-[#0a0a0a] border border-white/[0.08] flex items-center justify-center text-xs font-bold text-gray-400 flex-shrink-0 group-hover:border-accent-gold/40 group-hover:shadow-lg group-hover:shadow-accent-gold/10 transition-all">
                                            <Plane size={16} className="text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-sm group-hover:text-accent-gold transition-colors">{p.pilot_name}</p>
                                            <div className="flex items-center gap-2">
                                                <p className={`text-xs font-mono ${isA380(p.aircraft_type) ? 'text-red-400 font-bold' : 'text-gray-500'}`}>
                                                    {isA380(p.aircraft_type) && '⚠ '}{p.aircraft_type}
                                                </p>
                                                {p.is_manual && (
                                                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[9px] font-bold rounded-md border border-red-500/30 uppercase tracking-wider">Manual</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-accent-gold font-mono font-bold text-sm">{p.callsign}</p>
                                    <p className="text-[10px] text-gray-500 uppercase font-mono mt-0.5">{p.departure_icao} <span className="text-accent-gold/50">→</span> {p.arrival_icao}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5 text-sm font-mono text-cyan-400">
                                        <Clock size={14} className="text-cyan-500" />
                                        {Math.floor(p.flight_time).toString().padStart(2, '0')}:{Math.floor((p.flight_time % 1) * 60).toString().padStart(2, '0')}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`font-mono text-sm font-bold ${p.landing_rate < -500 ? 'text-red-400' : 'text-emerald-400'}`}>
                                        {p.landing_rate}
                                    </span>
                                    <span className="text-[10px] text-gray-600 ml-1">fpm</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5">
                                        <TrendingUp size={14} className={p.score < 80 ? 'text-red-500' : 'text-emerald-500'} />
                                        <span className={`font-bold text-sm ${p.score < 80 ? 'text-red-400' : 'text-emerald-400'}`}>
                                            {p.score}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-xs text-gray-500 font-mono">{new Date(p.submitted_at).toLocaleDateString()}</p>
                                    <p className="text-[10px] text-gray-600 font-mono">{new Date(p.submitted_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => setSelectedPirep(p)}
                                        className="text-xs bg-gradient-to-r from-accent-gold/10 to-accent-gold/5 hover:from-accent-gold hover:to-accent-gold/90 text-accent-gold hover:text-black border border-accent-gold/30 hover:border-accent-gold px-4 py-2 rounded-xl transition-all font-bold shadow-lg shadow-accent-gold/10 hover:shadow-accent-gold/30"
                                    >
                                        REVIEW
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {selectedPirep && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedPirep(null)} />
                    <div className="relative w-full max-w-3xl bg-gradient-to-br from-[#0a0a0a] to-[#0d0d0d] border border-accent-gold/[0.15] rounded-2xl p-8 shadow-2xl shadow-accent-gold/10 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-6 pb-6 border-b border-white/[0.08]">
                            <div>
                                <h3 className="text-3xl font-black text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">{selectedPirep.callsign}</h3>
                                <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
                                    <Plane size={14} className="text-accent-gold" />
                                    {selectedPirep.pilot_name} • {selectedPirep.aircraft_type}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                {getStatusBadge(selectedPirep.approved_status)}
                                <button
                                    onClick={() => setSelectedPirep(null)}
                                    className="text-gray-500 hover:text-white transition-colors text-2xl leading-none"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-3 mb-6">
                            <div className="bg-gradient-to-br from-[#0a0a0a] to-[#0d0d0d] rounded-xl border border-white/[0.08] p-4 text-center hover:border-accent-gold/20 transition-all shadow-lg shadow-black/20">
                                <Clock size={16} className="mx-auto mb-2 text-cyan-400" />
                                <p className="text-sm font-bold font-mono text-cyan-400">{Math.floor(selectedPirep.flight_time).toString().padStart(2, '0')}:{Math.floor((selectedPirep.flight_time % 1) * 60).toString().padStart(2, '0')}</p>
                                <p className="text-[8px] text-gray-500 uppercase tracking-widest font-bold mt-1">Flight Time</p>
                            </div>
                            <div className="bg-gradient-to-br from-[#0a0a0a] to-[#0d0d0d] rounded-xl border border-white/[0.08] p-4 text-center hover:border-accent-gold/20 transition-all shadow-lg shadow-black/20">
                                <TrendingUp size={16} className={`mx-auto mb-2 ${selectedPirep.landing_rate < -500 ? 'text-red-400' : 'text-emerald-400'}`} />
                                <p className={`text-sm font-bold font-mono ${selectedPirep.landing_rate < -500 ? 'text-red-400' : 'text-emerald-400'}`}>{selectedPirep.landing_rate}</p>
                                <p className="text-[8px] text-gray-500 uppercase tracking-widest font-bold mt-1">Landing Rate</p>
                            </div>
                            <div className="bg-gradient-to-br from-[#0a0a0a] to-[#0d0d0d] rounded-xl border border-white/[0.08] p-4 text-center hover:border-accent-gold/20 transition-all shadow-lg shadow-black/20">
                                <CheckCircle size={16} className={`mx-auto mb-2 ${selectedPirep.score < 80 ? 'text-red-400' : 'text-emerald-400'}`} />
                                <p className={`text-sm font-bold font-mono ${selectedPirep.score < 80 ? 'text-red-400' : 'text-emerald-400'}`}>{selectedPirep.score}</p>
                                <p className="text-[8px] text-gray-500 uppercase tracking-widest font-bold mt-1">Score</p>
                            </div>
                            <div className="bg-gradient-to-br from-[#0a0a0a] to-[#0d0d0d] rounded-xl border border-white/[0.08] p-4 text-center hover:border-accent-gold/20 transition-all shadow-lg shadow-black/20">
                                <Plane size={16} className="mx-auto mb-2 text-blue-400" />
                                <p className="text-sm font-bold font-mono text-blue-400">{selectedPirep.departure_icao}</p>
                                <p className="text-[8px] text-gray-500 uppercase tracking-widest font-bold mt-1">Departure</p>
                            </div>
                        </div>

                        {/* Manual Submission Proof */}
                        {selectedPirep.is_manual && (
                            <div className="mb-6 space-y-3">
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 shadow-lg shadow-red-500/10">
                                    <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
                                    <span className="text-sm font-bold text-red-400 uppercase tracking-wider">Manual Submission — Verify Proof Before Approving</span>
                                </div>
                                {selectedPirep.tracker_link && (
                                    <a
                                        href={selectedPirep.tracker_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent-gold/10 border border-accent-gold/30 text-accent-gold hover:bg-accent-gold/20 transition-all text-sm font-bold shadow-lg shadow-accent-gold/10"
                                    >
                                        <ExternalLink size={16} /> Verify External Stats
                                    </a>
                                )}
                                {selectedPirep.proof_image && (
                                    <button
                                        onClick={() => setLightboxImg(selectedPirep.proof_image!)}
                                        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-all text-sm font-bold shadow-lg shadow-blue-500/10"
                                    >
                                        <Image size={16} /> View Screenshot Proof
                                    </button>
                                )}
                            </div>
                        )}

                        {/* A380 Warning */}
                        {isA380(selectedPirep.aircraft_type) && (
                            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-5 flex items-center gap-4 shadow-lg shadow-red-500/10">
                                <AlertTriangle className="text-red-400 flex-shrink-0" size={24} />
                                <div>
                                    <p className="text-red-400 font-bold text-base">A380/A388 Fleet Violation</p>
                                    <p className="text-red-400/70 text-sm mt-1">This aircraft is restricted. PIREP cannot be approved.</p>
                                </div>
                            </div>
                        )}

                        {selectedPirep.comments && (
                            <div className="mb-6">
                                <p className="text-xs text-gray-500 uppercase mb-3 flex items-center gap-2 font-bold tracking-wider">
                                    <MessageSquare size={14} className="text-accent-gold" /> Pilot Comments
                                </p>
                                <div className="bg-gradient-to-br from-[#0a0a0a] to-[#0d0d0d] border border-white/[0.08] rounded-xl p-5 text-sm text-gray-300 italic shadow-lg shadow-black/20">
                                    "{selectedPirep.comments}"
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <label className="block text-xs text-gray-500 uppercase font-bold tracking-wider flex items-center gap-2">
                                <MessageSquare size={14} className="text-accent-gold" />
                                Admin Verdict & Comments
                            </label>
                            <textarea
                                value={adminComment}
                                onChange={(e) => setAdminComment(e.currentTarget.value)}
                                className="w-full bg-gradient-to-br from-[#0a0a0a] to-[#0d0d0d] border border-white/[0.08] rounded-xl p-4 text-white focus:border-accent-gold/40 focus:ring-2 focus:ring-accent-gold/10 outline-none h-28 text-sm shadow-lg shadow-black/20 transition-all"
                                placeholder="Reason for approval/rejection..."
                            />
                            
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => handleReview(selectedPirep._id, 1)}
                                    disabled={processing || isA380(selectedPirep.aircraft_type)}
                                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
                                    title={isA380(selectedPirep.aircraft_type) ? 'A380 aircraft is restricted — cannot approve' : ''}
                                >
                                    <CheckCircle size={18} /> APPROVE
                                </button>
                                <button
                                    onClick={() => handleReview(selectedPirep._id, 2)}
                                    disabled={processing}
                                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 hover:shadow-red-500/40"
                                >
                                    <XCircle size={18} /> REJECT
                                </button>
                                <button
                                    onClick={() => setSelectedPirep(null)}
                                    disabled={processing}
                                    className="px-6 py-3.5 bg-gradient-to-br from-[#0a0a0a] to-[#0d0d0d] border border-white/[0.08] text-gray-400 hover:text-white hover:border-white/[0.15] rounded-xl transition-all font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(selectedPirep._id)}
                                    disabled={processing}
                                    className="px-6 py-3.5 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white rounded-xl transition-all flex items-center gap-2 font-bold shadow-lg shadow-red-700/20"
                                    title="Permanently delete this PIREP and reverse credits"
                                >
                                    <Trash2 size={16} /> DELETE
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Lightbox */}
            {lightboxImg && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/90 backdrop-blur-md" onClick={() => setLightboxImg(null)}>
                    <button onClick={() => setLightboxImg(null)} className="absolute top-6 right-6 text-white/60 hover:text-white text-3xl font-bold">&times;</button>
                    <img src={lightboxImg} alt="Flight Proof" className="max-w-full max-h-full rounded-xl shadow-2xl border border-white/[0.08] object-contain" />
                </div>
            )}
        </div>
    );
}
