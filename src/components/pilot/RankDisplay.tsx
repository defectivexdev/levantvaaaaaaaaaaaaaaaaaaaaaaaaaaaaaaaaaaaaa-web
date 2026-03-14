'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { TrendingUp, Clock, Zap } from 'lucide-react';

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
        image: string;
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

interface RankDisplayProps {
    showProgress?: boolean;
    compact?: boolean;
}

export default function RankDisplay({ showProgress = true, compact = false }: RankDisplayProps) {
    const [rankInfo, setRankInfo] = useState<RankInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRankInfo();
    }, []);

    const fetchRankInfo = async () => {
        try {
            const res = await fetch('/api/pilot/rank');
            if (res.ok) {
                const data = await res.json();
                setRankInfo(data);
            } else if (res.status === 401) {
                console.log('Not authenticated - rank info requires login');
                setRankInfo(null);
            } else {
                console.error('Failed to fetch rank info:', res.status);
            }
        } catch (error) {
            console.error('Failed to fetch rank info:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
        );
    }

    if (!rankInfo) return null;

    const getTierColor = (tier: string) => {
        if (!tier) return 'from-gray-400 to-gray-600';
        const tierLower = tier.toLowerCase();
        switch (tierLower) {
            case 'bronze': return 'from-orange-600 to-orange-800';
            case 'silver': return 'from-gray-400 to-gray-600';
            case 'gold': return 'from-yellow-500 to-yellow-700';
            case 'diamond': return 'from-cyan-400 to-blue-600';
            default: return 'from-gray-400 to-gray-600';
        }
    };

    if (compact) {
        return (
            <div className="flex items-center gap-3">
                <div className="relative w-12 h-12">
                    <img
                        src={rankInfo.currentRank.image}
                        alt={rankInfo.currentRank.name}
                        className="w-full h-full object-contain"
                    />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {rankInfo.currentRank.name}
                        </span>
                        <span className="text-lg">{rankInfo.tier.badge}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {Math.floor(rankInfo.totalHours)} hours
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20">
                        <img
                            src={rankInfo.currentRank.image}
                            alt={rankInfo.currentRank.name}
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {rankInfo.currentRank.name}
                            </h3>
                            <span className="text-2xl">{rankInfo.tier.badge}</span>
                        </div>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getTierColor(rankInfo.tier.level)} text-white`}>
                            {rankInfo.tier.name} Tier
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">Total Hours</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {Math.floor(rankInfo.totalHours)}
                    </p>
                </div>
            </div>

            {showProgress && rankInfo.nextRank && (
                <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Progress to {rankInfo.nextRank.name}
                            </span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {Math.floor(rankInfo.hoursToNext)} hours remaining
                        </span>
                    </div>
                    <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                            style={{ width: `${rankInfo.progress}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {rankInfo.progress.toFixed(1)}% complete
                    </p>
                </div>
            )}

            {!rankInfo.nextRank && (
                <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        🏆 Maximum rank achieved! You are an Instructor.
                    </p>
                </div>
            )}
        </div>
    );
}
