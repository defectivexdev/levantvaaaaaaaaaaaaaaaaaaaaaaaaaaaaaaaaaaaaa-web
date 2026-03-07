/**
 * Rank Progression & Badge System Types
 * Gamification and achievement tracking
 */

// ============================================================================
// RANK SYSTEM
// ============================================================================

export enum PilotRank {
    STUDENT_PILOT = 'Student Pilot',
    PRIVATE_PILOT = 'Private Pilot',
    COMMERCIAL_PILOT = 'Commercial Pilot',
    FIRST_OFFICER = 'First Officer',
    CAPTAIN = 'Captain',
    SENIOR_CAPTAIN = 'Senior Captain',
    TRAINING_CAPTAIN = 'Training Captain',
    CHIEF_PILOT = 'Chief Pilot',
}

export interface RankRequirements {
    rank: PilotRank;
    min_hours: number;
    min_flights: number;
    min_avg_score: number;
    required_badges?: string[];
    description: string;
    hourly_rate: number;
    color: string;
    icon: string;
}

export const RANK_PROGRESSION: RankRequirements[] = [
    {
        rank: PilotRank.STUDENT_PILOT,
        min_hours: 0,
        min_flights: 0,
        min_avg_score: 0,
        description: 'New pilot beginning their journey',
        hourly_rate: 25,
        color: '#9CA3AF',
        icon: '🎓',
    },
    {
        rank: PilotRank.PRIVATE_PILOT,
        min_hours: 10,
        min_flights: 5,
        min_avg_score: 70,
        description: 'Licensed for basic operations',
        hourly_rate: 35,
        color: '#60A5FA',
        icon: '✈️',
    },
    {
        rank: PilotRank.COMMERCIAL_PILOT,
        min_hours: 50,
        min_flights: 25,
        min_avg_score: 75,
        description: 'Qualified for commercial operations',
        hourly_rate: 50,
        color: '#34D399',
        icon: '🛫',
    },
    {
        rank: PilotRank.FIRST_OFFICER,
        min_hours: 150,
        min_flights: 75,
        min_avg_score: 80,
        description: 'Second-in-command on commercial flights',
        hourly_rate: 75,
        color: '#FBBF24',
        icon: '👨‍✈️',
    },
    {
        rank: PilotRank.CAPTAIN,
        min_hours: 500,
        min_flights: 200,
        min_avg_score: 85,
        required_badges: ['perfect_landing_10', 'long_haul_master'],
        description: 'Pilot-in-command authority',
        hourly_rate: 100,
        color: '#F59E0B',
        icon: '🎖️',
    },
    {
        rank: PilotRank.SENIOR_CAPTAIN,
        min_hours: 1500,
        min_flights: 500,
        min_avg_score: 88,
        required_badges: ['perfect_landing_50', 'fuel_master', 'event_winner'],
        description: 'Experienced command pilot',
        hourly_rate: 125,
        color: '#EF4444',
        icon: '⭐',
    },
    {
        rank: PilotRank.TRAINING_CAPTAIN,
        min_hours: 3000,
        min_flights: 1000,
        min_avg_score: 90,
        required_badges: ['perfect_landing_100', 'mentor'],
        description: 'Instructor and examiner',
        hourly_rate: 150,
        color: '#8B5CF6',
        icon: '🏆',
    },
    {
        rank: PilotRank.CHIEF_PILOT,
        min_hours: 5000,
        min_flights: 2000,
        min_avg_score: 92,
        required_badges: ['legend', 'perfect_landing_500'],
        description: 'Elite pilot and leader',
        hourly_rate: 200,
        color: '#FFD700',
        icon: '👑',
    },
];

export interface RankProgress {
    current_rank: PilotRank;
    next_rank: PilotRank | null;
    progress_percentage: number;
    
    current_hours: number;
    current_flights: number;
    current_avg_score: number;
    
    hours_needed: number;
    flights_needed: number;
    score_needed: number;
    badges_needed: string[];
    
    can_promote: boolean;
}

// ============================================================================
// BADGE/ACHIEVEMENT SYSTEM
// ============================================================================

export enum BadgeCategory {
    LANDING = 'landing',
    FLIGHT_TIME = 'flight_time',
    DISTANCE = 'distance',
    SCORING = 'scoring',
    SPECIAL = 'special',
    EVENT = 'event',
    SOCIAL = 'social',
}

export enum BadgeRarity {
    COMMON = 'common',
    UNCOMMON = 'uncommon',
    RARE = 'rare',
    EPIC = 'epic',
    LEGENDARY = 'legendary',
}

export interface BadgeDefinition {
    id: string;
    name: string;
    description: string;
    category: BadgeCategory;
    rarity: BadgeRarity;
    icon: string;
    color: string;
    
    // Award criteria
    criteria: {
        type: 'landing_rate' | 'flight_hours' | 'distance' | 'score' | 'streak' | 'event' | 'custom';
        threshold?: number;
        comparison?: 'less_than' | 'greater_than' | 'equal_to';
        count?: number;              // For "X times" achievements
        consecutive?: boolean;       // For streaks
    };
    
    // Rewards
    cash_reward?: number;
    rank_points?: number;
    
    hidden?: boolean;                // Hidden until unlocked
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
    // Landing Achievements
    {
        id: 'butter_landing',
        name: 'Butter Landing',
        description: 'Land with less than 100 fpm',
        category: BadgeCategory.LANDING,
        rarity: BadgeRarity.COMMON,
        icon: '🧈',
        color: '#FCD34D',
        criteria: { type: 'landing_rate', threshold: 100, comparison: 'less_than' },
        cash_reward: 50,
    },
    {
        id: 'perfect_landing_10',
        name: 'Smooth Operator',
        description: 'Achieve 10 butter landings',
        category: BadgeCategory.LANDING,
        rarity: BadgeRarity.UNCOMMON,
        icon: '✨',
        color: '#60A5FA',
        criteria: { type: 'landing_rate', threshold: 100, comparison: 'less_than', count: 10 },
        cash_reward: 200,
    },
    {
        id: 'perfect_landing_50',
        name: 'Landing Master',
        description: 'Achieve 50 butter landings',
        category: BadgeCategory.LANDING,
        rarity: BadgeRarity.RARE,
        icon: '🌟',
        color: '#8B5CF6',
        criteria: { type: 'landing_rate', threshold: 100, comparison: 'less_than', count: 50 },
        cash_reward: 500,
    },
    {
        id: 'perfect_landing_100',
        name: 'Touchdown Legend',
        description: 'Achieve 100 butter landings',
        category: BadgeCategory.LANDING,
        rarity: BadgeRarity.EPIC,
        icon: '💎',
        color: '#EC4899',
        criteria: { type: 'landing_rate', threshold: 100, comparison: 'less_than', count: 100 },
        cash_reward: 1000,
    },
    
    // Flight Time Achievements
    {
        id: 'first_flight',
        name: 'First Flight',
        description: 'Complete your first flight',
        category: BadgeCategory.FLIGHT_TIME,
        rarity: BadgeRarity.COMMON,
        icon: '🛫',
        color: '#10B981',
        criteria: { type: 'flight_hours', threshold: 0, comparison: 'greater_than' },
        cash_reward: 100,
    },
    {
        id: 'century_club',
        name: 'Century Club',
        description: 'Fly 100 hours',
        category: BadgeCategory.FLIGHT_TIME,
        rarity: BadgeRarity.UNCOMMON,
        icon: '💯',
        color: '#3B82F6',
        criteria: { type: 'flight_hours', threshold: 100, comparison: 'greater_than' },
        cash_reward: 500,
    },
    {
        id: 'thousand_hours',
        name: 'Thousand Hour Pilot',
        description: 'Accumulate 1000 flight hours',
        category: BadgeCategory.FLIGHT_TIME,
        rarity: BadgeRarity.RARE,
        icon: '⏱️',
        color: '#F59E0B',
        criteria: { type: 'flight_hours', threshold: 1000, comparison: 'greater_than' },
        cash_reward: 2000,
    },
    
    // Scoring Achievements
    {
        id: 'perfect_score',
        name: 'Perfect Flight',
        description: 'Complete a flight with 100 score',
        category: BadgeCategory.SCORING,
        rarity: BadgeRarity.RARE,
        icon: '💯',
        color: '#10B981',
        criteria: { type: 'score', threshold: 100, comparison: 'equal_to' },
        cash_reward: 300,
    },
    {
        id: 'ace_pilot',
        name: 'Ace Pilot',
        description: 'Maintain 95+ average score over 10 flights',
        category: BadgeCategory.SCORING,
        rarity: BadgeRarity.EPIC,
        icon: '🎯',
        color: '#EF4444',
        criteria: { type: 'score', threshold: 95, comparison: 'greater_than', count: 10, consecutive: true },
        cash_reward: 1000,
    },
    
    // Special Achievements
    {
        id: 'long_haul_master',
        name: 'Long Haul Master',
        description: 'Complete a flight over 2000 NM',
        category: BadgeCategory.DISTANCE,
        rarity: BadgeRarity.UNCOMMON,
        icon: '🌍',
        color: '#06B6D4',
        criteria: { type: 'distance', threshold: 2000, comparison: 'greater_than' },
        cash_reward: 400,
    },
    {
        id: 'fuel_master',
        name: 'Fuel Efficiency Expert',
        description: 'Win a fuel efficiency competition',
        category: BadgeCategory.SPECIAL,
        rarity: BadgeRarity.RARE,
        icon: '⛽',
        color: '#84CC16',
        criteria: { type: 'event', threshold: 1, comparison: 'greater_than' },
        cash_reward: 500,
    },
    {
        id: 'event_winner',
        name: 'Competition Champion',
        description: 'Win any competition event',
        category: BadgeCategory.EVENT,
        rarity: BadgeRarity.EPIC,
        icon: '🏆',
        color: '#FFD700',
        criteria: { type: 'event', threshold: 1, comparison: 'greater_than' },
        cash_reward: 1000,
    },
    {
        id: 'legend',
        name: 'Living Legend',
        description: 'Reach the highest rank',
        category: BadgeCategory.SPECIAL,
        rarity: BadgeRarity.LEGENDARY,
        icon: '👑',
        color: '#FFD700',
        criteria: { type: 'custom' },
        cash_reward: 5000,
        hidden: true,
    },
];

export interface PilotBadge {
    id: string;
    pilotId: string;
    badgeId: string;
    earned_at: Date;
    progress?: number;           // For progressive badges
    metadata?: {
        event_id?: string;
        flight_id?: string;
        value?: number;
    };
}

// ============================================================================
// PROGRESSION CALCULATION
// ============================================================================

export interface ProgressionStats {
    total_hours: number;
    total_flights: number;
    avg_score: number;
    badges_earned: string[];
    
    // Weighted progress formula
    progress_score: number;      // (Total_Hours × 0.7) + (Avg_Score × 0.3)
}

export function calculateProgressionScore(stats: ProgressionStats): number {
    return (stats.total_hours * 0.7) + (stats.avg_score * 0.3);
}

export function calculateRankProgress(
    stats: ProgressionStats,
    currentRank: PilotRank
): RankProgress {
    const currentRankIndex = RANK_PROGRESSION.findIndex(r => r.rank === currentRank);
    const nextRankData = RANK_PROGRESSION[currentRankIndex + 1];
    
    if (!nextRankData) {
        return {
            current_rank: currentRank,
            next_rank: null,
            progress_percentage: 100,
            current_hours: stats.total_hours,
            current_flights: stats.total_flights,
            current_avg_score: stats.avg_score,
            hours_needed: 0,
            flights_needed: 0,
            score_needed: 0,
            badges_needed: [],
            can_promote: false,
        };
    }
    
    const hoursProgress = Math.min((stats.total_hours / nextRankData.min_hours) * 100, 100);
    const flightsProgress = Math.min((stats.total_flights / nextRankData.min_flights) * 100, 100);
    const scoreProgress = Math.min((stats.avg_score / nextRankData.min_avg_score) * 100, 100);
    
    const requiredBadges = nextRankData.required_badges || [];
    const hasBadges = requiredBadges.every(badge => stats.badges_earned.includes(badge));
    const badgeProgress = requiredBadges.length > 0 
        ? (stats.badges_earned.filter(b => requiredBadges.includes(b)).length / requiredBadges.length) * 100
        : 100;
    
    const overallProgress = (hoursProgress + flightsProgress + scoreProgress + badgeProgress) / 4;
    
    const canPromote = 
        stats.total_hours >= nextRankData.min_hours &&
        stats.total_flights >= nextRankData.min_flights &&
        stats.avg_score >= nextRankData.min_avg_score &&
        hasBadges;
    
    return {
        current_rank: currentRank,
        next_rank: nextRankData.rank,
        progress_percentage: overallProgress,
        current_hours: stats.total_hours,
        current_flights: stats.total_flights,
        current_avg_score: stats.avg_score,
        hours_needed: Math.max(0, nextRankData.min_hours - stats.total_hours),
        flights_needed: Math.max(0, nextRankData.min_flights - stats.total_flights),
        score_needed: Math.max(0, nextRankData.min_avg_score - stats.avg_score),
        badges_needed: requiredBadges.filter(b => !stats.badges_earned.includes(b)),
        can_promote: canPromote,
    };
}
