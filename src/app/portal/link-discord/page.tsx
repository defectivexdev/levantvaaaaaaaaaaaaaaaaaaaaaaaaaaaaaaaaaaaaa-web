'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Loader2, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import IVAOVerification from '@/components/IVAOVerification';

export default function LinkDiscordPage() {
    const [loading, setLoading] = useState(false);
    const [pilotId, setPilotId] = useState('');
    const [ivaoVid, setIvaoVid] = useState('');
    const [ivaoVerified, setIvaoVerified] = useState(false);
    const [statusLoading, setStatusLoading] = useState(true);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const res = await fetch('/api/auth/me', {
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                setPilotId(data.user.pilotId);
                setIvaoVid(data.user.ivao_vid || '');
                
                // Check IVAO verification
                const ivaoRes = await fetch('/api/ivao/verify', { credentials: 'include' });
                const ivaoData = ivaoRes.ok ? await ivaoRes.json() : { verified: false };
                
                setIvaoVerified(ivaoData.verified);
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        } finally {
            setStatusLoading(false);
        }
    };


    const handleLinkDiscord = async () => {
        if (!ivaoVerified) {
            toast.error('Please verify your IVAO account first');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/discord/verify-link', {
                credentials: 'include',
            });

            const data = await res.json();
            
            if (res.ok && data.authUrl) {
                window.location.href = data.authUrl;
            } else {
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
                    className="mb-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${ivaoVerified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {ivaoVerified ? <Check className="w-5 h-5" /> : <span className="font-bold">1</span>}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">IVAO Verification</h2>
                            <p className="text-sm text-gray-400">Verify your IVAO account</p>
                        </div>
                    </div>

                    <IVAOVerification 
                        pilotId={pilotId}
                        currentIvaoVid={ivaoVid}
                    />
                </motion.div>

                {/* Step 2: Discord Linking */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#0a0a0a] border border-white/[0.04] rounded-xl p-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${ivaoVerified ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-500/20 text-gray-500'}`}>
                            <span className="font-bold">2</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Link Discord Account</h2>
                            <p className="text-sm text-gray-400">Connect your Discord to receive roles automatically</p>
                        </div>
                    </div>

                    {!ivaoVerified ? (
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
                                        <span>Get IVAO rating roles</span>
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
