import { useEffect, useState } from 'react';
import { Clock, TrendingUp } from 'lucide-react';

interface RankInfo {
    currentRank: {
        id: string;
        name: string;
        image: string;
        minHours: number;
        maxHours: number;
    };
    nextRank: {
        id: string;
        name: string;
        minHours: number;
    } | null;
    totalHours: number;
    progress: number;
    hoursToNext: number;
    tier: {
        level: 'bronze' | 'silver' | 'gold' | 'diamond';
        badge: string;
        name: string;
    };
}

interface PilotCardProps {
    pilotName: string;
    pilotId: string;
}

export default function PilotCard({ pilotName, pilotId }: PilotCardProps) {
    const [rankInfo, setRankInfo] = useState<RankInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRankInfo();
    }, []);

    const fetchRankInfo = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/pilot/rank`);
            if (res.ok) {
                const data = await res.json();
                setRankInfo(data);
            }
        } catch (error) {
            console.error('Failed to fetch rank info:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'bronze': return 'from-orange-600 to-orange-800';
            case 'silver': return 'from-gray-400 to-gray-600';
            case 'gold': return 'from-yellow-500 to-yellow-700';
            case 'diamond': return 'from-cyan-400 to-blue-600';
            default: return 'from-gray-400 to-gray-600';
        }
    };

    if (loading) {
        return (
            <div className="glass-panel rounded-xl p-6 animate-pulse">
                <div className="h-24 bg-surface-elevated rounded"></div>
            </div>
        );
    }

    if (!rankInfo) return null;

    return (
        <div className="glass-panel rounded-xl p-6 border border-white/5">
            <div className="flex items-start gap-4">
                {/* Rank Image */}
                <div className="relative w-20 h-20 flex-shrink-0">
                    <img
                        src={rankInfo.currentRank.image}
                        alt={rankInfo.currentRank.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                </div>

                {/* Pilot Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white truncate">{pilotName}</h3>
                        <span className="text-xl">{rankInfo.tier.badge}</span>
                    </div>
                    <p className="text-xs text-txt-secondary mb-1">{pilotId}</p>
                    <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r ${getTierColor(rankInfo.tier.level)} text-white`}>
                        {rankInfo.tier.name} • {rankInfo.currentRank.name}
                    </div>
                </div>

                {/* Hours */}
                <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 text-txt-secondary mb-1">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px] font-medium">Total Hours</span>
                    </div>
                    <p className="text-2xl font-bold text-accent-gold">
                        {Math.floor(rankInfo.totalHours)}
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            {rankInfo.nextRank && (
                <div className="mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                            <TrendingUp className="w-3 h-3 text-accent" />
                            <span className="text-[10px] font-medium text-txt-secondary">
                                Next: {rankInfo.nextRank.name}
                            </span>
                        </div>
                        <span className="text-[10px] text-txt-disabled">
                            {Math.floor(rankInfo.hoursToNext)}h remaining
                        </span>
                    </div>
                    <div className="relative w-full h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                        <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent-gold to-accent transition-all duration-500"
                            style={{ width: `${rankInfo.progress}%` }}
                        />
                    </div>
                    <p className="text-[9px] text-txt-disabled mt-1">
                        {rankInfo.progress.toFixed(1)}% complete
                    </p>
                </div>
            )}

            {!rankInfo.nextRank && (
                <div className="mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-accent-gold">
                        <span className="text-lg">🏆</span>
                        <p className="text-[11px] font-medium">Maximum rank achieved!</p>
                    </div>
                </div>
            )}
        </div>
    );
}
