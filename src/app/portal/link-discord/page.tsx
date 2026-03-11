'use client';
// Version: 2.0.0 - Cookie-based auth
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Check, Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface IVAOVerificationStatus {
    verified: boolean;
    ivao_vid: string | null;
    atc_rating: number | null;
    pilot_rating: number | null;
}

const ATC_RATINGS: Record<number, string> = {
    2: 'AS1', 3: 'AS2', 4: 'AS3', 5: 'ADC', 6: 'APC', 7: 'ACC', 8: 'SEC', 9: 'SAI', 10: 'CAI',
};

const PILOT_RATINGS: Record<number, string> = {
    2: 'FS1', 3: 'FS2', 4: 'FS3', 5: 'PP', 6: 'SPP', 7: 'CP', 8: 'ATP', 9: 'SFI', 10: 'CFI',
};

export default function LinkDiscordPage() {
    const [ivaoVid, setIvaoVid] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [status, setStatus] = useState<IVAOVerificationStatus | null>(null);
    const [statusLoading, setStatusLoading] = useState(true);

    useEffect(() => {
        console.log('=== LinkDiscordPage mounted at', new Date().toISOString(), '===');
        fetchStatus();
        
        // Check if returning from IVAO OAuth
        const params = new URLSearchParams(window.location.search);
        console.log('URL params:', params.toString());
        if (params.get('ivao_verified') === 'success') {
            console.log('Returning from IVAO OAuth success');
            // Refresh status multiple times to ensure DB is updated
            setTimeout(() => {
                console.log('Refreshing status (500ms)');
                fetchStatus();
            }, 500);
            setTimeout(() => {
                console.log('Refreshing status (1500ms)');
                fetchStatus();
            }, 1500);
            setTimeout(() => {
                console.log('Refreshing status (3000ms)');
                fetchStatus();
            }, 3000);
        }
    }, []);

    const fetchStatus = async () => {
        try {
            console.log('Fetching IVAO status...');
            const res = await fetch('/api/ivao/verify', {
                credentials: 'include', // Include cookies in request
            });

            console.log('API response status:', res.status);
            if (res.ok) {
                const data = await res.json();
                console.log('IVAO status fetched:', data);
                console.log('Is verified?', data.verified);
                console.log('IVAO VID:', data.ivao_vid);
                setStatus(data);
                if (data.ivao_vid) {
                    setIvaoVid(data.ivao_vid);
                }
            } else {
                const errorText = await res.text();
                console.error('Failed to fetch status:', res.status, errorText);
            }
        } catch (error) {
            console.error('Failed to fetch IVAO status:', error);
        } finally {
            setStatusLoading(false);
        }
    };

    const handleVerifyIVAO = async () => {
        setVerifying(true);
        // Direct redirect to IVAO OAuth - no need for API call
        window.location.href = '/api/ivao/oauth/authorize?redirect=/portal/link-discord';
    };

    const handleLinkDiscord = async () => {
        console.log('handleLinkDiscord called, status:', status);
        if (!status?.verified) {
            console.error('IVAO not verified, status:', status);
            toast.error('Please verify your IVAO account first');
            return;
        }

        setLoading(true);
        try {
            console.log('Fetching Discord auth URL...');
            const res = await fetch('/api/discord/verify-link', {
                credentials: 'include', // Include cookies in request
            });

            const data = await res.json();
            console.log('Discord verify-link response:', data);
            
            if (res.ok && data.authUrl) {
                console.log('Redirecting to Discord:', data.authUrl);
                window.location.href = data.authUrl;
            } else {
                console.error('Discord link failed:', data);
                toast.error(data.error || 'Failed to generate Discord link');
                setLoading(false);
            }
        } catch (error) {
            console.error('Discord link error:', error);
            toast.error('Failed to link Discord account');
            setLoading(false);
        }
    };

    if (statusLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] p-6">
            <div className="max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <h1 className="text-3xl font-bold text-white mb-2">Link Discord & IVAO</h1>
                    <p className="text-gray-400">Connect your Discord account and verify your IVAO credentials to receive roles</p>
                </motion.div>

                {/* Step 1: IVAO Verification */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[#0a0a0a] border border-white/[0.04] rounded-xl p-6 mb-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${status?.verified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {status?.verified ? <Check className="w-5 h-5" /> : <span className="font-bold">1</span>}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">IVAO Verification</h2>
                            <p className="text-sm text-gray-400">Enter your IVAO VID to verify your account</p>
                        </div>
                    </div>

                    {status?.verified ? (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-start gap-3">
                            <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-emerald-400 font-medium mb-2">IVAO Account Verified</p>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-400">IVAO VID:</span>
                                        <span className="text-white ml-2 font-mono">{status.ivao_vid}</span>
                                    </div>
                                    {status.atc_rating && (
                                        <div>
                                            <span className="text-gray-400">ATC Rating:</span>
                                            <span className="text-cyan-400 ml-2 font-semibold">{ATC_RATINGS[status.atc_rating] || status.atc_rating}</span>
                                        </div>
                                    )}
                                    {status.pilot_rating && (
                                        <div>
                                            <span className="text-gray-400">Pilot Rating:</span>
                                            <span className="text-cyan-400 ml-2 font-semibold">{PILOT_RATINGS[status.pilot_rating] || status.pilot_rating}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                                <p className="text-amber-400 text-sm mb-2 font-medium">IVAO OAuth Authorization</p>
                                <p className="text-gray-300 text-sm">
                                    Click the button below to authorize with IVAO. You'll be redirected to IVAO's website to log in and grant access.
                                </p>
                            </div>
                            <button
                                onClick={handleVerifyIVAO}
                                disabled={verifying}
                                className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {verifying ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Redirecting to IVAO...
                                    </>
                                ) : (
                                    <>
                                        <ExternalLink className="w-5 h-5" />
                                        Authorize with IVAO
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* Step 2: Discord Linking */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#0a0a0a] border border-white/[0.04] rounded-xl p-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${status?.verified ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-500/20 text-gray-500'}`}>
                            <span className="font-bold">2</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Link Discord Account</h2>
                            <p className="text-sm text-gray-400">Connect your Discord to receive roles automatically</p>
                        </div>
                    </div>

                    {!status?.verified ? (
                        <div className="bg-gray-500/10 border border-gray-500/20 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                            <p className="text-gray-400 text-sm">Please verify your IVAO account first before linking Discord</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
                                <p className="text-cyan-400 text-sm mb-3 font-medium">What happens when you link:</p>
                                <ul className="space-y-2 text-sm text-gray-300">
                                    <li className="flex items-start gap-2">
                                        <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                                        <span>Automatically join Levant VA Discord server</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                                        <span>Receive Levant Members role</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                                        <span>Get IVAO rating roles ({status.atc_rating ? ATC_RATINGS[status.atc_rating] : ''} {status.pilot_rating ? `& ${PILOT_RATINGS[status.pilot_rating]}` : ''})</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                                        <span>Nickname updated to your pilot name</span>
                                    </li>
                                </ul>
                            </div>
                            <button
                                onClick={handleLinkDiscord}
                                disabled={loading}
                                className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Redirecting to Discord...
                                    </>
                                ) : (
                                    <>
                                        <ExternalLink className="w-5 h-5" />
                                        Link Discord Account
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
