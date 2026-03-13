'use client';

interface TierBadgeProps {
    tier: 'bronze' | 'silver' | 'gold' | 'diamond';
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

export default function TierBadge({ tier, size = 'md', showLabel = false }: TierBadgeProps) {
    const badges = {
        bronze: '🥉',
        silver: '🥈',
        gold: '🥇',
        diamond: '💎'
    };

    const names = {
        bronze: 'Beginner',
        silver: 'Intermediate',
        gold: 'Expert',
        diamond: 'Elite'
    };

    const colors = {
        bronze: 'from-orange-600 to-orange-800',
        silver: 'from-gray-400 to-gray-600',
        gold: 'from-yellow-500 to-yellow-700',
        diamond: 'from-cyan-400 to-blue-600'
    };

    const sizes = {
        sm: 'text-sm px-2 py-0.5',
        md: 'text-base px-3 py-1',
        lg: 'text-lg px-4 py-2'
    };

    return (
        <div className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${colors[tier]} text-white font-medium ${sizes[size]}`}>
            <span>{badges[tier]}</span>
            {showLabel && <span>{names[tier]}</span>}
        </div>
    );
}
