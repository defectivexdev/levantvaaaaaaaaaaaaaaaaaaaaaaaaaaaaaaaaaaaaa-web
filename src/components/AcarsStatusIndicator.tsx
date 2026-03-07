/**
 * ACARS Connection Status Indicator
 * Live status indicator with blinking animation when connected
 */

'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

interface AcarsStatusIndicatorProps {
    className?: string;
    showText?: boolean;
}

export default function AcarsStatusIndicator({ 
    className = '', 
    showText = true 
}: AcarsStatusIndicatorProps) {
    const [isConnected, setIsConnected] = useState(false);
    const [lastPing, setLastPing] = useState<Date | null>(null);

    useEffect(() => {
        // Check ACARS connection status
        const checkConnection = async () => {
            try {
                const response = await fetch('/api/acars/status');
                const data = await response.json();
                setIsConnected(data.connected || false);
                if (data.connected) {
                    setLastPing(new Date());
                }
            } catch (error) {
                setIsConnected(false);
            }
        };

        checkConnection();
        const interval = setInterval(checkConnection, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="relative">
                {isConnected ? (
                    <>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping opacity-75" />
                    </>
                ) : (
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                )}
            </div>
            
            {showText && (
                <div className="flex items-center gap-2">
                    {isConnected ? (
                        <>
                            <Wifi className="w-4 h-4 text-green-500" />
                            <span className="text-xs text-green-500 font-medium">ACARS Connected</span>
                        </>
                    ) : (
                        <>
                            <WifiOff className="w-4 h-4 text-red-500" />
                            <span className="text-xs text-red-500 font-medium">ACARS Offline</span>
                        </>
                    )}
                </div>
            )}

            {lastPing && isConnected && (
                <span className="text-[10px] text-gray-500 font-mono">
                    {lastPing.toLocaleTimeString()}
                </span>
            )}
        </div>
    );
}
