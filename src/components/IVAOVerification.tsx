'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Check, Loader2, RefreshCw, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

interface IVAOVerificationProps {
    pilotId: string;
    currentIvaoVid?: string;
}

interface VerificationStatus {
    verified: boolean;
    ivao_vid: string | null;
    atc_rating: number | null;
    pilot_rating: number | null;
    discord_roles_assigned: boolean;
    last_sync: string | null;
}

const ATC_RATINGS: Record<number, string> = {
    2: 'AS1',
    3: 'AS2',
    4: 'AS3',
    5: 'ADC',
    6: 'APC',
    7: 'ACC',
    8: 'SEC',
    9: 'SAI',
    10: 'CAI',
};

const PILOT_RATINGS: Record<number, string> = {
    2: 'FS1',
    3: 'FS2',
    4: 'FS3',
    5: 'PP',
    6: 'SPP',
    7: 'CP',
    8: 'ATP',
    9: 'SFI',
    10: 'CFI',
};

export default function IVAOVerification({ pilotId, currentIvaoVid }: IVAOVerificationProps) {
    const [ivaoVid, setIvaoVid] = useState(currentIvaoVid || '');
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [status, setStatus] = useState<VerificationStatus | null>(null);
    const [statusLoading, setStatusLoading] = useState(true);
    const [discordLinking, setDiscordLinking] = useState(false);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch('/api/ivao/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const data = await res.json();
                setStatus(data);
                if (data.ivao_vid) {
                    setIvaoVid(data.ivao_vid);
                }
            }
        } catch (error) {
            console.error('Failed to fetch IVAO status:', error);
        } finally {
            setStatusLoading(false);
        }
    };

    const handleVerify = async () => {
        if (!ivaoVid.trim()) {
            toast.error('Please enter your IVAO VID');
            return;
        }

        setLoading(true);
        const toastId = toast.loading('Verifying IVAO account...');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Not authenticated', { id: toastId });
                return;
            }

            const res = await fetch('/api/ivao/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ ivao_vid: ivaoVid.trim() }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('IVAO account verified successfully!', { id: toastId });
                await fetchStatus();
            } else {
                toast.error(data.error || 'Verification failed', { id: toastId });
            }
        } catch (error) {
            console.error('Verification error:', error);
            toast.error('Failed to verify IVAO account', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        const toastId = toast.loading('Syncing IVAO data...');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Not authenticated', { id: toastId });
                return;
            }

            const res = await fetch('/api/ivao/sync', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('IVAO data synced successfully!', { id: toastId });
                await fetchStatus();
            } else {
                toast.error(data.error || 'Sync failed', { id: toastId });
            }
        } catch (error) {
            console.error('Sync error:', error);
            toast.error('Failed to sync IVAO data', { id: toastId });
        } finally {
            setSyncing(false);
        }
    };

    const handleDiscordLink = async () => {
        setDiscordLinking(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Not authenticated');
                return;
            }

            const res = await fetch('/api/discord/verify-link', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (res.ok && data.authUrl) {
                window.location.href = data.authUrl;
            } else {
                toast.error('Failed to generate Discord link');
                setDiscordLinking(false);
            }
        } catch (error) {
            console.error('Discord link error:', error);
            toast.error('Failed to link Discord account');
            setDiscordLinking(false);
        }
    };

    if (statusLoading) {
        return (
            <div className="bg-[#0a0a0a] border border-white/[0.04] rounded-xl p-4">
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-[#0a0a0a] border border-white/[0.04] rounded-xl overflow-hidden"
        >
            <div className="px-4 py-3 border-b border-white/[0.04] flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-semibold text-white">IVAO Verification</h2>
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
                            Link your IVAO account to receive Discord roles based on your ratings.
                        </p>
                        <div className="space-y-2">
                            <label className="text-xs text-gray-500">IVAO VID</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={ivaoVid}
                                    onChange={(e) => setIvaoVid(e.target.value)}
                                    placeholder="Enter your IVAO VID"
                                    className="flex-1 px-3 py-2 bg-black/50 border border-white/[0.08] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                                    disabled={loading}
                                />
                                <button
                                    onClick={handleVerify}
                                    disabled={loading || !ivaoVid.trim()}
                                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        'Verify'
                                    )}
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={handleDiscordLink}
                            disabled={discordLinking}
                            className="w-full px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] disabled:bg-gray-800 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
                        >
                            {discordLinking ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Connecting...
                                </>
                            ) : (
                                <>
                                    <LinkIcon className="w-4 h-4" />
                                    Link Discord Account
                                </>
                            )}
                        </button>
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                            <p className="text-xs text-blue-400">
                                Click "Link Discord Account" to automatically join the server and receive the Levant Members role. IVAO roles will be assigned after verification.
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500">IVAO VID</span>
                                <a
                                    href={`https://www.ivao.aero/Member.aspx?Id=${status.ivao_vid}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                                >
                                    {status.ivao_vid}
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500">ATC Rating</span>
                                <span className="text-white font-medium">
                                    {status.atc_rating ? ATC_RATINGS[status.atc_rating] || `Rating ${status.atc_rating}` : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500">Pilot Rating</span>
                                <span className="text-white font-medium">
                                    {status.pilot_rating ? PILOT_RATINGS[status.pilot_rating] || `Rating ${status.pilot_rating}` : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500">Discord Roles</span>
                                <span className={status.discord_roles_assigned ? 'text-emerald-400' : 'text-amber-400'}>
                                    {status.discord_roles_assigned ? 'Assigned' : 'Pending'}
                                </span>
                            </div>
                            {status.last_sync && (
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500">Last Sync</span>
                                    <span className="text-gray-400">
                                        {new Date(status.last_sync).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            className="w-full px-4 py-2 bg-black/50 hover:bg-black/70 disabled:bg-gray-800 disabled:cursor-not-allowed border border-white/[0.08] hover:border-amber-500/50 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {syncing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Syncing...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-4 h-4" />
                                    Sync IVAO Data
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleDiscordLink}
                            disabled={discordLinking}
                            className="w-full px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] disabled:bg-gray-800 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {discordLinking ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Connecting...
                                </>
                            ) : (
                                <>
                                    <LinkIcon className="w-4 h-4" />
                                    {status.discord_roles_assigned ? 'Re-link Discord Account' : 'Link Discord Account'}
                                </>
                            )}
                        </button>

                        {!status.discord_roles_assigned && (
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                                <p className="text-xs text-blue-400">
                                    Click "Link Discord Account" above to automatically join the server and receive your roles.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </motion.div>
    );
}
