'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Network } from 'lucide-react';
import IVAOVerification from './IVAOVerification';
import VATSIMVerification from './VATSIMVerification';

interface NetworkVerificationProps {
    pilotId: string;
    currentIvaoVid?: string;
    currentVatsimCid?: string;
}

type NetworkType = 'ivao' | 'vatsim';

export default function NetworkVerification({ pilotId, currentIvaoVid, currentVatsimCid }: NetworkVerificationProps) {
    const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>('ivao');

    return (
        <div className="space-y-4">
            {/* Network Selector */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0a0a0a] rounded-xl border border-white/[0.04] overflow-hidden"
            >
                <div className="px-4 py-3 border-b border-white/[0.04] flex items-center gap-2">
                    <Network className="w-4 h-4 text-accent-gold" />
                    <h2 className="text-sm font-semibold text-white">Network Verification</h2>
                </div>

                <div className="p-4">
                    <p className="text-xs text-gray-400 mb-3">
                        Select which flight simulation network you want to link your account with.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setSelectedNetwork('ivao')}
                            className={`px-4 py-3 rounded-lg border transition-all ${
                                selectedNetwork === 'ivao'
                                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                    : 'bg-white/[0.02] border-white/[0.06] text-gray-400 hover:bg-white/[0.04]'
                            }`}
                        >
                            <div className="flex flex-col items-center gap-1">
                                <div className="text-lg font-bold">IVAO</div>
                                <div className="text-[10px] opacity-70">International Virtual Aviation</div>
                            </div>
                        </button>

                        <button
                            onClick={() => setSelectedNetwork('vatsim')}
                            className={`px-4 py-3 rounded-lg border transition-all ${
                                selectedNetwork === 'vatsim'
                                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                                    : 'bg-white/[0.02] border-white/[0.06] text-gray-400 hover:bg-white/[0.04]'
                            }`}
                        >
                            <div className="flex flex-col items-center gap-1">
                                <div className="text-lg font-bold">VATSIM</div>
                                <div className="text-[10px] opacity-70">Virtual Air Traffic Simulation</div>
                            </div>
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Selected Network Component */}
            <motion.div
                key={selectedNetwork}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
            >
                {selectedNetwork === 'ivao' ? (
                    <IVAOVerification pilotId={pilotId} currentIvaoVid={currentIvaoVid} />
                ) : (
                    <VATSIMVerification pilotId={pilotId} currentVatsimCid={currentVatsimCid} />
                )}
            </motion.div>
        </div>
    );
}
