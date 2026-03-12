'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Check, Loader2, RefreshCw, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

interface VATSIMVerificationProps {
    pilotId: string;
    currentVatsimCid?: string;
}

interface VerificationStatus {
    verified: boolean;
    vatsim_cid: string | null;
    rating: number | null;
    pilotrating: number | null;
    discord_roles_assigned: boolean;
    last_sync: string | null;
}

const ATC_RATINGS: Record<number, string> = {
    0: 'Inactive',
    1: 'OBS',
    2: 'S1',
    3: 'S2',
    4: 'S3',
    5: 'C1',
    6: 'C2',
    7: 'C3',
    8: 'I1',
    9: 'I2',
    10: 'I3',
    11: 'SUP',
    12: 'ADM',
};

const PILOT_RATINGS: Record<number, string> = {
    0: 'P0',
    1: 'PPL',
    3: 'IR',
    7: 'CMEL',
    15: 'ATPL',
    31: 'FI',
    63: 'FE',
};

export default function VATSIMVerification({ pilotId, currentVatsimCid }: VATSIMVerificationProps) {
    const [vatsimCid, setVatsimCid] = useState(currentVatsimCid || '');
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [status, setStatus] = useState<VerificationStatus | null>(null);
    const [statusLoading, setStatusLoading] = useState(true);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch('/api/vatsim/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const data = await res.json();
                setStatus(data);
                if (data.vatsim_cid) {
                    setVatsimCid(data.vatsim_cid);
                }
            }
        } catch (error) {
            console.error('Failed to fetch VATSIM status:', error);
        } finally {
            setStatusLoading(false);
        }
    };

    const handleVerify = async () => {
        if (!vatsimCid.trim()) {
            toast.error('Please enter your VATSIM CID');
            return;
        }

        setLoading(true);
        const toastId = toast.loading('Verifying VATSIM account...');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Not authenticated', { id: toastId });
                return;
            }

            const res = await fetch('/api/vatsim/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ vatsim_cid: vatsimCid.trim() }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('VATSIM account verified successfully!', { id: toastId });
                await fetchStatus();
            } else {
                toast.error(data.error || 'Verification failed', { id: toastId });
            }
        } catch (error) {
            console.error('Verification error:', error);
            toast.error('Failed to verify VATSIM account', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        const toastId = toast.loading('Syncing VATSIM data...');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Not authenticated', { id: toastId });
                return;
            }

            const res = await fetch('/api/vatsim/sync', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('VATSIM data synced successfully!', { id: toastId });
                await fetchStatus();
            } else {
                toast.error(data.error || 'Sync failed', { id: toastId });
            }
        } catch (error) {
            console.error('Sync error:', error);
            toast.error('Failed to sync VATSIM data', { id: toastId });
        } finally {
            setSyncing(false);
        }
    };

    if (statusLoading) {
        return (
            <div className="bg-[#0a0a0a] rounded-xl border border-white/[0.04] p-6">
                <div className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0a0a0a] rounded-xl border border-white/[0.04] overflow-hidden"
        >
            <div className="px-4 py-3 border-b border-white/[0.04] flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <h2 className="text-sm font-semibold text-white">VATSIM Verification</h2>
                {status?.verified && (
                    <div className="ml-auto flex items-center gap-1 text-emerald-400 text-xs">
                        <Check className="w-3 h-3" />
                        <span>Verified</span>
                    </div>
                )}
            </div>

            <div className="p-4 space-y-4">
                {!status?.verified ? (
                    <>
                        <p className="text-xs text-gray-400">
                            Link your VATSIM account to verify your network membership and sync your ratings.
                        </p>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-300">VATSIM CID</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={vatsimCid}
                                    onChange={(e) => setVatsimCid(e.target.value)}
                                    placeholder="Enter your VATSIM CID"
                                    className="flex-1 px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    disabled={loading}
                                />
                                <button
                                    onClick={handleVerify}
                                    disabled={loading || !vatsimCid.trim()}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <LinkIcon className="w-4 h-4" />
                                    )}
                                    {loading ? 'Verifying...' : 'Verify'}
                                </button>
                            </div>
                        </div>

                        <a
                            href="https://my.vatsim.net/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            <ExternalLink className="w-3 h-3" />
                            Find your VATSIM CID
                        </a>
                    </>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.04]">
                                <div className="text-xs text-gray-400 mb-1">VATSIM CID</div>
                                <div className="text-sm font-mono text-white">{status.vatsim_cid}</div>
                            </div>
                            <div className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.04]">
                                <div className="text-xs text-gray-400 mb-1">ATC Rating</div>
                                <div className="text-sm font-semibold text-blue-400">
                                    {ATC_RATINGS[status.rating || 0] || 'Unknown'}
                                </div>
                            </div>
                            <div className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.04]">
                                <div className="text-xs text-gray-400 mb-1">Pilot Rating</div>
                                <div className="text-sm font-semibold text-emerald-400">
                                    {PILOT_RATINGS[status.pilotrating || 0] || 'Unknown'}
                                </div>
                            </div>
                            <div className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.04]">
                                <div className="text-xs text-gray-400 mb-1">Last Sync</div>
                                <div className="text-xs text-gray-300">
                                    {status.last_sync
                                        ? new Date(status.last_sync).toLocaleDateString()
                                        : 'Never'}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            className="w-full px-4 py-2 bg-white/[0.03] hover:bg-white/[0.06] disabled:bg-white/[0.02] disabled:cursor-not-allowed border border-white/[0.06] text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {syncing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4" />
                            )}
                            {syncing ? 'Syncing...' : 'Sync VATSIM Data'}
                        </button>
                    </>
                )}
            </div>
        </motion.div>
    );
}
