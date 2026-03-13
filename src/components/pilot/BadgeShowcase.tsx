'use client';

import { useEffect, useState } from 'react';
import { Trophy, Lock, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Badge {
    badge_id: string;
    name: string;
    description: string;
    category: string;
    tier: 'bronze' | 'silver' | 'gold' | 'diamond';
    icon: string;
    image?: string;
    points: number;
    earned?: boolean;
    earned_at?: Date;
    progress?: number;
}

interface BadgeShowcaseProps {
    showProgress?: boolean;
    limit?: number;
}

export default function BadgeShowcase({ showProgress = false, limit }: BadgeShowcaseProps) {
    const [badges, setBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all');
    const [isExpanded, setIsExpanded] = useState(true);

    useEffect(() => {
        fetchBadges();
    }, []);

    const fetchBadges = async () => {
        try {
            const url = showProgress ? '/api/pilot/badges?progress=true' : '/api/pilot/badges';
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setBadges(data.badges || []);
            } else if (res.status === 401) {
                console.log('Not authenticated - badges require login');
                setBadges([]);
            } else {
                console.error('Failed to fetch badges:', res.status);
                setBadges([]);
            }
        } catch (error) {
            console.error('Failed to fetch badges:', error);
            setBadges([]);
        } finally {
            setLoading(false);
        }
    };

    const getTierColor = (tier: string) => {
        if (!tier) return 'bg-gray-500';
        const tierLower = tier.toLowerCase();
        switch (tierLower) {
            case 'bronze': return 'bg-gradient-to-br from-orange-600 to-orange-800';
            case 'silver': return 'bg-gradient-to-br from-gray-400 to-gray-600';
            case 'gold': return 'bg-gradient-to-br from-yellow-500 to-yellow-700';
            case 'diamond': return 'bg-gradient-to-br from-cyan-400 to-blue-600';
            default: return 'bg-gray-500';
        }
    };

    const filteredBadges = badges.filter(badge => {
        if (filter === 'earned') return badge.earned;
        if (filter === 'locked') return !badge.earned;
        return true;
    });

    const displayBadges = limit ? filteredBadges.slice(0, limit) : filteredBadges;
    const earnedCount = badges.filter(b => b.earned).length;

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-2">
                <div 
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            Achievements
                            <span className="text-gray-400 group-hover:text-white transition-colors">
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </span>
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {earnedCount} of {badges.length} earned
                        </p>
                    </div>
                </div>
                {isExpanded && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                                filter === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('earned')}
                            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                                filter === 'earned'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}
                        >
                            Earned
                        </button>
                        <button
                            onClick={() => setFilter('locked')}
                            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                                filter === 'locked'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}
                        >
                            Locked
                        </button>
                    </div>
                )}
            </div>

            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                            {displayBadges.map((badge) => (
                                <div
                                    key={badge.badge_id}
                                    className={`relative group ${
                                        badge.earned
                                            ? 'opacity-100'
                                            : 'opacity-40 grayscale'
                                    }`}
                                >
                                    <div className={`${getTierColor(badge.tier)} rounded-lg p-4 text-center transition-transform hover:scale-105 relative`}>
                                        {badge.image ? (
                                            <img 
                                                src={`/img/awards/${badge.image}`}
                                                alt={badge.name}
                                                className="w-16 h-16 mx-auto object-contain"
                                                onError={(e) => {
                                                    // Fallback to icon if image fails to load
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                    const parent = (e.target as HTMLElement).parentElement;
                                                    if (parent) {
                                                        const iconDiv = document.createElement('div');
                                                        iconDiv.className = 'text-3xl mb-2';
                                                        iconDiv.textContent = badge.icon;
                                                        parent.appendChild(iconDiv);
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <div className="text-3xl mb-2">{badge.icon}</div>
                                        )}
                                        {!badge.earned && (
                                            <Lock className="w-4 h-4 text-white/60 absolute top-2 right-2" />
                                        )}
                                    </div>
                                    <div className="mt-2">
                                        <p className="text-xs font-medium text-gray-900 dark:text-white text-center truncate">
                                            {badge.name}
                                        </p>
                                        {showProgress && !badge.earned && badge.progress !== undefined && (
                                            <div className="mt-1">
                                                <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500"
                                                        style={{ width: `${badge.progress}%` }}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center mt-0.5">
                                                    {badge.progress.toFixed(0)}%
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                        <p className="font-medium">{badge.name}</p>
                                        <p className="text-gray-300 text-[10px]">{badge.description}</p>
                                        <p className="text-yellow-400 text-[10px] mt-1">+{badge.points} pts</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {displayBadges.length === 0 && (
                            <div className="text-center py-12">
                                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">
                                    {filter === 'earned' ? 'No badges earned yet' : 'No badges available'}
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
