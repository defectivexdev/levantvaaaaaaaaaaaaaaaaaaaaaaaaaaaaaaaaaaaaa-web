'use client';

import { useState } from 'react';
import { Wrench, Trash2, Database, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DeveloperManagementPage() {
    const [loading, setLoading] = useState<string | null>(null);

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
        </div>
    );
}
