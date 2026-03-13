'use client';

import { motion } from 'framer-motion';
import { Network } from 'lucide-react';
import IVAOVerification from './IVAOVerification';

interface NetworkVerificationProps {
    pilotId: string;
    currentIvaoVid?: string;
}

export default function NetworkVerification({ pilotId, currentIvaoVid }: NetworkVerificationProps) {
    return (
        <div className="space-y-4">
            {/* Network Selector */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-panel rounded-xl border border-white/5 overflow-hidden"
            >
                <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
                    <Network className="w-4 h-4 text-accent-gold" />
                    <h2 className="text-sm font-semibold text-white">Network Verification</h2>
                </div>

                <div className="p-4">
                    <p className="text-xs text-gray-400 mb-3">
                        Link your IVAO account with Levant Virtual Airlines.
                    </p>
                </div>
            </motion.div>

            {/* IVAO Verification Component */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
            >
                <IVAOVerification pilotId={pilotId} currentIvaoVid={currentIvaoVid} />
            </motion.div>
        </div>
    );
}
