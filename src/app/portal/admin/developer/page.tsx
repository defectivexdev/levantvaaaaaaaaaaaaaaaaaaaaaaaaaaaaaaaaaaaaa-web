'use client';

import { useState, useEffect } from 'react';
import { Wrench, Trash2, Database, Loader2, Mail, Globe, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface BlacklistEntry {
    _id: string;
    country_code: string;
    country_name: string;
    reason?: string;
    added_by: string;
    created_at: string;
}

interface BypassEntry {
    _id: string;
    pilot_id: string;
    country_code: string;
    reason?: string;
    added_by: string;
    created_at: string;
}

export default function DeveloperManagementPage() {
    const [loading, setLoading] = useState<string | null>(null);
    const [testEmail, setTestEmail] = useState('');
    const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
    const [newCountry, setNewCountry] = useState({ code: '', name: '', reason: '' });
    const [showAddForm, setShowAddForm] = useState(false);
    const [bypasses, setBypasses] = useState<BypassEntry[]>([]);
    const [newBypass, setNewBypass] = useState({ pilotId: '', countryCode: '', reason: '' });
    const [showBypassForm, setShowBypassForm] = useState(false);

    const handleClearDownloadLogs = async () => {
        if (!confirm('Are you sure you want to clear all download logs? This action cannot be undone.')) {
            return;
        }

        setLoading('downloadLogs');
        try {
            const res = await fetch('/api/admin/developer/clear-download-logs', {
                method: 'POST',
            });
            const data = await res.json();

            if (res.ok) {
                toast.success(`Successfully deleted ${data.deletedCount} download logs`);
            } else {
                toast.error(data.error || 'Failed to clear download logs');
            }
        } catch (error) {
            console.error('Error clearing download logs:', error);
            toast.error('Failed to clear download logs');
        } finally {
            setLoading(null);
        }
    };

    const handleClearBids = async () => {
        if (!confirm('Clear all inactive bids (completed, cancelled, and expired)? Active and in-progress flights will be preserved.')) {
            return;
        }

        setLoading('bids');
        try {
            const res = await fetch('/api/admin/developer/clear-bids', {
                method: 'POST',
            });
            const data = await res.json();

            if (res.ok) {
                toast.success(`Successfully deleted ${data.deletedCount} bids`);
            } else {
                toast.error(data.error || 'Failed to clear bids');
            }
        } catch (error) {
            console.error('Error clearing bids:', error);
            toast.error('Failed to clear bids');
        } finally {
            setLoading(null);
        }
    };

    const handleTestEmail = async () => {
        if (!testEmail) {
            toast.error('Please enter an email address');
            return;
        }

        setLoading('email');
        try {
            const res = await fetch('/api/admin/test-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ testEmail }),
            });
            const data = await res.json();

            if (res.ok) {
                toast.success(`Email sent successfully! Check ${testEmail}`);
                console.log('[Email Test] Result:', data);
            } else {
                toast.error(`Email failed: ${data.error}`);
                console.error('[Email Test] Error:', data);
            }
        } catch (error) {
            console.error('Error testing email:', error);
            toast.error('Failed to test email');
        } finally {
            setLoading(null);
        }
    };

    // Fetch blacklist and bypasses on mount
    useEffect(() => {
        fetchBlacklist();
        fetchBypasses();
    }, []);

    const fetchBlacklist = async () => {
        try {
            const res = await fetch('/api/admin/developer/country-blacklist');
            const data = await res.json();
            if (res.ok) {
                setBlacklist(data.blacklist);
            }
        } catch (error) {
            console.error('Error fetching blacklist:', error);
        }
    };

    const fetchBypasses = async () => {
        try {
            const res = await fetch('/api/admin/developer/country-bypass');
            const data = await res.json();
            if (res.ok) {
                setBypasses(data.bypasses);
            }
        } catch (error) {
            console.error('Error fetching bypasses:', error);
        }
    };

    const handleAddCountry = async () => {
        if (!newCountry.code) {
            toast.error('Country code is required');
            return;
        }

        setLoading('addCountry');
        try {
            const res = await fetch('/api/admin/developer/country-blacklist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    country_code: newCountry.code.toUpperCase(),
                    country_name: newCountry.name,
                    reason: newCountry.reason,
                }),
            });
            const data = await res.json();

            if (res.ok) {
                toast.success(`${newCountry.code.toUpperCase()} added to blacklist`);
                setNewCountry({ code: '', name: '', reason: '' });
                setShowAddForm(false);
                fetchBlacklist();
            } else {
                toast.error(data.error || 'Failed to add country');
            }
        } catch (error) {
            console.error('Error adding country:', error);
            toast.error('Failed to add country');
        } finally {
            setLoading(null);
        }
    };

    const handleRemoveCountry = async (countryCode: string, countryName: string) => {
        if (!confirm(`Remove ${countryName} from blacklist?`)) {
            return;
        }

        setLoading(`remove-${countryCode}`);
        try {
            const res = await fetch('/api/admin/developer/country-blacklist', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ country_code: countryCode }),
            });

            if (res.ok) {
                toast.success(`${countryName} removed from blacklist`);
                fetchBlacklist();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to remove country');
            }
        } catch (error) {
            console.error('Error removing country:', error);
            toast.error('Failed to remove country');
        } finally {
            setLoading(null);
        }
    };

    const handleAddBypass = async () => {
        if (!newBypass.pilotId) {
            toast.error('Pilot ID is required');
            return;
        }

        setLoading('addBypass');
        try {
            const res = await fetch('/api/admin/developer/country-bypass', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pilot_id: newBypass.pilotId.toUpperCase(),
                    country_code: newBypass.countryCode,
                    reason: newBypass.reason,
                }),
            });
            const data = await res.json();

            if (res.ok) {
                toast.success(`${newBypass.pilotId} added to bypass list`);
                setNewBypass({ pilotId: '', countryCode: '', reason: '' });
                setShowBypassForm(false);
                fetchBypasses();
            } else {
                toast.error(data.error || 'Failed to add bypass');
            }
        } catch (error) {
            console.error('Error adding bypass:', error);
            toast.error('Failed to add bypass');
        } finally {
            setLoading(null);
        }
    };

    const handleRemoveBypass = async (pilotId: string) => {
        if (!confirm(`Remove ${pilotId} from bypass list?`)) {
            return;
        }

        setLoading(`remove-bypass-${pilotId}`);
        try {
            const res = await fetch('/api/admin/developer/country-bypass', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pilot_id: pilotId }),
            });

            if (res.ok) {
                toast.success(`${pilotId} removed from bypass list`);
                fetchBypasses();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to remove bypass');
            }
        } catch (error) {
            console.error('Error removing bypass:', error);
            toast.error('Failed to remove bypass');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                    <Wrench className="text-purple-400 w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        Developer Management
                    </h1>
                    <p className="text-gray-500 text-xs mt-0.5">Dangerous operations - use with caution</p>
                </div>
            </div>

            {/* Warning Banner */}
            <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-red-500/20">
                        <Database className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-red-400">⚠️ Warning</h3>
                        <p className="text-xs text-gray-400 mt-1">
                            These operations directly modify the database and cannot be undone. 
                            Please ensure you have a backup before proceeding.
                        </p>
                    </div>
                </div>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Test Email */}
                <div className="bg-gradient-to-br from-[#0a0e17] to-[#0d1117] border border-white/[0.06] rounded-xl p-6 hover:border-blue-500/30 transition-all">
                    <div className="flex items-start gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                            <Mail className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-white">Test Email Service</h3>
                            <p className="text-xs text-gray-500 mt-1">
                                Verify SMTP configuration and send a test email
                            </p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <input
                            type="email"
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            placeholder="Enter test email address"
                            className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                        />
                        <button
                            onClick={handleTestEmail}
                            disabled={loading !== null}
                            className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-400 hover:border-blue-500/50 hover:from-blue-500/30 hover:to-cyan-500/30 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading === 'email' ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Testing...
                                </>
                            ) : (
                                <>
                                    <Mail className="w-4 h-4" />
                                    Send Test Email
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Clear Download Logs */}
                <div className="bg-gradient-to-br from-[#0a0e17] to-[#0d1117] border border-white/[0.06] rounded-xl p-6 hover:border-purple-500/30 transition-all">
                    <div className="flex items-start gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                            <Trash2 className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-white">Clear Download Logs</h3>
                            <p className="text-xs text-gray-500 mt-1">
                                Remove all download tracking records from the database
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClearDownloadLogs}
                        disabled={loading !== null}
                        className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-400 hover:border-purple-500/50 hover:from-purple-500/30 hover:to-pink-500/30 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading === 'downloadLogs' ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Clearing...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4" />
                                Clear Download Logs
                            </>
                        )}
                    </button>
                </div>

                {/* Clear Bids */}
                <div className="bg-gradient-to-br from-[#0a0e17] to-[#0d1117] border border-white/[0.06] rounded-xl p-6 hover:border-pink-500/30 transition-all">
                    <div className="flex items-start gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-pink-500/10">
                            <Trash2 className="w-5 h-5 text-pink-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-white">Clear Inactive Bids</h3>
                            <p className="text-xs text-gray-500 mt-1">
                                Remove completed, cancelled, and expired bids (preserves active flights)
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClearBids}
                        disabled={loading !== null}
                        className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-pink-500/20 to-red-500/20 border border-pink-500/30 text-pink-400 hover:border-pink-500/50 hover:from-pink-500/30 hover:to-red-500/30 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading === 'bids' ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Clearing...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4" />
                                Clear Inactive Bids
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Country Blacklist Section */}
            <div className="bg-gradient-to-br from-[#0a0e17] to-[#0d1117] border border-white/[0.06] rounded-xl p-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-red-500/10">
                            <Globe className="w-5 h-5 text-red-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-white">Country Blacklist</h3>
                            <p className="text-xs text-gray-500 mt-1">
                                Block registrations and access from specific countries (by code or name)
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 text-red-400 hover:border-red-500/50 hover:from-red-500/30 hover:to-orange-500/30 transition-all font-medium text-xs flex items-center gap-2"
                    >
                        {showAddForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        {showAddForm ? 'Cancel' : 'Add Country'}
                    </button>
                </div>

                {/* Add Country Form */}
                {showAddForm && (
                    <div className="mb-4 p-4 bg-[#0a0a0a] border border-white/10 rounded-lg space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                value={newCountry.code}
                                onChange={(e) => setNewCountry({ ...newCountry, code: e.target.value.toUpperCase() })}
                                placeholder="Country Code (e.g., US) *Required"
                                maxLength={2}
                                className="px-3 py-2 rounded-lg bg-[#0a0a0a] border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/50 transition-colors uppercase"
                            />
                            <input
                                type="text"
                                value={newCountry.name}
                                onChange={(e) => setNewCountry({ ...newCountry, name: e.target.value })}
                                placeholder="Country Name (optional)"
                                className="px-3 py-2 rounded-lg bg-[#0a0a0a] border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/50 transition-colors"
                            />
                        </div>
                        <input
                            type="text"
                            value={newCountry.reason}
                            onChange={(e) => setNewCountry({ ...newCountry, reason: e.target.value })}
                            placeholder="Reason (optional)"
                            className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-white/10 text-white text-sm focus:outline-none focus:border-red-500/50 transition-colors"
                        />
                        <button
                            onClick={handleAddCountry}
                            disabled={loading === 'addCountry'}
                            className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 text-red-400 hover:border-red-500/50 hover:from-red-500/30 hover:to-orange-500/30 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading === 'addCountry' ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Add to Blacklist
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Blacklist Table */}
                <div className="space-y-2">
                    {blacklist.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm">
                            No countries blacklisted
                        </div>
                    ) : (
                        blacklist.map((entry) => (
                            <div
                                key={entry._id}
                                className="flex items-center justify-between p-3 bg-[#0a0a0a] border border-white/10 rounded-lg hover:border-red-500/30 transition-all"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-bold text-sm">{entry.country_code}</span>
                                        {entry.country_name && (
                                            <span className="text-gray-400 text-sm">{entry.country_name}</span>
                                        )}
                                    </div>
                                    {entry.reason && (
                                        <p className="text-xs text-gray-500 mt-1">Reason: {entry.reason}</p>
                                    )}
                                    <p className="text-[10px] text-gray-600 mt-1">
                                        Added by {entry.added_by} on {new Date(entry.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleRemoveCountry(entry.country_code, entry.country_name)}
                                    disabled={loading === `remove-${entry.country_code}`}
                                    className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-all text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                >
                                    {loading === `remove-${entry.country_code}` ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-3 h-3" />
                                    )}
                                    Remove
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Country Bypass Section */}
            <div className="bg-gradient-to-br from-[#0a0e17] to-[#0d1117] border border-white/[0.06] rounded-xl p-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10">
                            <Globe className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-white">Bypass Blacklist</h3>
                            <p className="text-xs text-gray-500 mt-1">
                                Allow specific pilots from blacklisted countries to register
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowBypassForm(!showBypassForm)}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 text-emerald-400 hover:border-emerald-500/50 hover:from-emerald-500/30 hover:to-green-500/30 transition-all font-medium text-xs flex items-center gap-2"
                    >
                        {showBypassForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        {showBypassForm ? 'Cancel' : 'Add Bypass'}
                    </button>
                </div>

                {/* Add Bypass Form */}
                {showBypassForm && (
                    <div className="mb-4 p-4 bg-[#0a0a0a] border border-white/10 rounded-lg space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                value={newBypass.pilotId}
                                onChange={(e) => setNewBypass({ ...newBypass, pilotId: e.target.value.toUpperCase() })}
                                placeholder="Pilot ID (e.g., LVT123) *Required"
                                className="px-3 py-2 rounded-lg bg-[#0a0a0a] border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors uppercase"
                            />
                            <input
                                type="text"
                                value={newBypass.countryCode}
                                onChange={(e) => setNewBypass({ ...newBypass, countryCode: e.target.value.toUpperCase() })}
                                placeholder="Country Code (optional)"
                                maxLength={2}
                                className="px-3 py-2 rounded-lg bg-[#0a0a0a] border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors uppercase"
                            />
                        </div>
                        <input
                            type="text"
                            value={newBypass.reason}
                            onChange={(e) => setNewBypass({ ...newBypass, reason: e.target.value })}
                            placeholder="Reason (optional)"
                            className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                        />
                        <button
                            onClick={handleAddBypass}
                            disabled={loading === 'addBypass'}
                            className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 text-emerald-400 hover:border-emerald-500/50 hover:from-emerald-500/30 hover:to-green-500/30 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading === 'addBypass' ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Add to Bypass List
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Bypass Table */}
                <div className="space-y-2">
                    {bypasses.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm">
                            No bypasses configured
                        </div>
                    ) : (
                        bypasses.map((entry) => (
                            <div
                                key={entry._id}
                                className="flex items-center justify-between p-3 bg-[#0a0a0a] border border-white/10 rounded-lg hover:border-emerald-500/30 transition-all"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-bold text-sm">{entry.pilot_id}</span>
                                        {entry.country_code && (
                                            <>
                                                <span className="text-gray-400 text-xs">from</span>
                                                <span className="text-emerald-400 text-sm font-bold">{entry.country_code}</span>
                                            </>
                                        )}
                                    </div>
                                    {entry.reason && (
                                        <p className="text-xs text-gray-500 mt-1">Reason: {entry.reason}</p>
                                    )}
                                    <p className="text-[10px] text-gray-600 mt-1">
                                        Added by {entry.added_by} on {new Date(entry.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleRemoveBypass(entry.pilot_id)}
                                    disabled={loading === `remove-bypass-${entry.pilot_id}`}
                                    className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-all text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                >
                                    {loading === `remove-bypass-${entry.pilot_id}` ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-3 h-3" />
                                    )}
                                    Remove
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
