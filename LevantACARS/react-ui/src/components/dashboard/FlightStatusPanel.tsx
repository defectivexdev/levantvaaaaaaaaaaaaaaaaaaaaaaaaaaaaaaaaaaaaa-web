import { Plane, Radio, MapPin } from 'lucide-react';

interface FlightStatusPanelProps {
    isConnected: boolean;
    isTracking: boolean;
    aircraft?: string;
    flightNumber?: string;
    departure?: string;
    arrival?: string;
}

export default function FlightStatusPanel({
    isConnected,
    isTracking,
    aircraft,
    flightNumber,
    departure,
    arrival
}: FlightStatusPanelProps) {
    
    const getStatusColor = () => {
        if (isTracking) return 'text-blue-400';
        if (isConnected) return 'text-emerald-400';
        return 'text-red-400';
    };

    const getStatusText = () => {
        if (isTracking) return 'Tracking Flight';
        if (isConnected) return 'Connected';
        return 'Disconnected';
    };

    const getStatusDot = () => {
        if (isTracking) return 'bg-blue-400 animate-pulse';
        if (isConnected) return 'bg-emerald-400';
        return 'bg-red-400';
    };

    return (
        <div className="glass-panel rounded-xl p-5 border border-white/[0.06]">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-accent-gold" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Flight Status</h3>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusDot()}`} />
                    <span className={`text-xs font-medium ${getStatusColor()}`}>
                        {getStatusText()}
                    </span>
                </div>
            </div>

            {flightNumber && aircraft ? (
                <div className="space-y-3">
                    {/* Aircraft & Flight Number */}
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-txt-disabled uppercase tracking-wider">Aircraft</span>
                        <div className="flex items-center gap-2">
                            <Plane className="w-3.5 h-3.5 text-accent" />
                            <span className="text-sm font-bold text-white font-mono">{aircraft}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-txt-disabled uppercase tracking-wider">Flight</span>
                        <span className="text-sm font-bold text-accent-gold font-mono">{flightNumber}</span>
                    </div>

                    {/* Route */}
                    {departure && arrival && (
                        <div className="pt-3 border-t border-white/[0.06]">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="w-3 h-3 text-accent" />
                                    <span className="text-xs font-bold text-white font-mono">{departure}</span>
                                </div>
                                <div className="flex-1 mx-3">
                                    <div className="h-[1px] bg-gradient-to-r from-accent-gold/50 via-accent/50 to-accent-gold/50" />
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-white font-mono">{arrival}</span>
                                    <MapPin className="w-3 h-3 text-accent-gold" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-6">
                    <Plane className="w-8 h-8 text-txt-disabled mx-auto mb-2 opacity-30" />
                    <p className="text-xs text-txt-disabled">No active flight</p>
                </div>
            )}
        </div>
    );
}
