/**
 * Rank configuration interface matching the web app structure
 * Synced with src/config/ranks.ts from the main web application
 */
export interface RankConfig {
    rank_id: number;
    rank_name: string;
    required_hours: number;
    required_flights: number;
    rank_image: string;
    description: string;
    priority_order: number;
}

export const PILOT_RANKS: RankConfig[] = [
    { rank_id: 1, rank_name: 'Cadet', required_hours: 0, required_flights: 0, rank_image: '/img/ranks/cadet.png?v=1', description: 'Beginner pilot in training.', priority_order: 1 },
    { rank_id: 2, rank_name: 'Student Pilot', required_hours: 15, required_flights: 5, rank_image: '/img/ranks/student_pilots.png?v=1', description: 'Student pilot continuing education.', priority_order: 2 },
    { rank_id: 3, rank_name: 'Amateur Pilot', required_hours: 150, required_flights: 25, rank_image: '/img/ranks/amateur_pilots.png?v=1', description: 'Amateur pilot with moderate experience.', priority_order: 3 },
    { rank_id: 4, rank_name: 'Private Pilot', required_hours: 300, required_flights: 50, rank_image: '/img/ranks/private_pilot.png?v=1', description: 'Licensed private pilot.', priority_order: 4 },
    { rank_id: 5, rank_name: 'First Officer', required_hours: 500, required_flights: 100, rank_image: '/img/ranks/first_officer.png?v=1', description: 'Professional First Officer.', priority_order: 5 },
    { rank_id: 6, rank_name: 'Senior First Officer', required_hours: 1000, required_flights: 200, rank_image: '/img/ranks/senior_first_officer.png?v=1', description: 'Highly experienced Senior First Officer.', priority_order: 6 },
    { rank_id: 7, rank_name: 'Captain', required_hours: 2500, required_flights: 500, rank_image: '/img/ranks/captain.png?v=1', description: 'Airline Captain.', priority_order: 7 },
    { rank_id: 8, rank_name: 'Flight Captain', required_hours: 5000, required_flights: 1000, rank_image: '/img/ranks/flight_captain.png?v=1', description: 'Distinguished Flight Captain.', priority_order: 8 },
    { rank_id: 9, rank_name: 'Senior Flight Captain', required_hours: 7000, required_flights: 1500, rank_image: '/img/ranks/senior_flight_captain.png?v=1', description: 'Veteran Senior Flight Captain.', priority_order: 9 },
    { rank_id: 10, rank_name: 'Commercial Captain', required_hours: 10000, required_flights: 2000, rank_image: '/img/ranks/commercial_captain.png?v=1', description: 'Elite Commercial Captain.', priority_order: 10 },
    { rank_id: 11, rank_name: 'Instructor', required_hours: 20000, required_flights: 4000, rank_image: '/img/ranks/instructor.png?v=1', description: 'Master Instructor Pilot.', priority_order: 11 }
].sort((a, b) => a.required_hours - b.required_hours);

export function getRankByHours(totalHours: number): RankConfig {
    let currentRank = PILOT_RANKS[0];
    for (const rank of PILOT_RANKS) {
        if (totalHours >= rank.required_hours) {
            currentRank = rank;
        } else {
            break;
        }
    }
    return currentRank;
}

export function getRankByFlights(totalFlights: number): RankConfig {
    let currentRank = PILOT_RANKS[0];
    for (const rank of PILOT_RANKS) {
        if (totalFlights >= rank.required_flights) {
            currentRank = rank;
        } else {
            break;
        }
    }
    return currentRank;
}

export function calculatePilotRank(totalHours: number, totalFlights: number): RankConfig {
    const rankByHours = getRankByHours(totalHours);
    const rankByFlights = getRankByFlights(totalFlights);
    
    // Choose the highest rank between hours and flights (using priority_order)
    return rankByHours.priority_order > rankByFlights.priority_order ? rankByHours : rankByFlights;
}

export function getNextRank(currentRankId: number): RankConfig | null {
    const currentIndex = PILOT_RANKS.findIndex(r => r.rank_id === currentRankId);
    if (currentIndex === -1 || currentIndex === PILOT_RANKS.length - 1) {
        return null;
    }
    return PILOT_RANKS[currentIndex + 1];
}

export function getRankProgress(totalHours: number, totalFlights: number): { current: RankConfig; next: RankConfig | null; progress: number; hoursToNext: number } {
    const current = calculatePilotRank(totalHours, totalFlights);
    const next = getNextRank(current.rank_id);

    if (!next) {
        return { current, next: null, progress: 100, hoursToNext: 0 };
    }

    // Calculate progress based on the requirement that is closest to completion
    const hoursProgress = Math.min(((totalHours - current.required_hours) / (next.required_hours - current.required_hours)) * 100, 100);
    const flightsProgress = Math.min(((totalFlights - current.required_flights) / (next.required_flights - current.required_flights)) * 100, 100);

    const progress = Math.max(hoursProgress || 0, flightsProgress || 0);
    const hoursToNext = Math.max(0, next.required_hours - totalHours);

    return { current, next, progress: Math.max(0, Math.min(100, progress)), hoursToNext };
}

export function getTierByHours(totalHours: number): 'bronze' | 'silver' | 'gold' | 'diamond' {
    if (totalHours < 150) return 'bronze';
    if (totalHours < 1000) return 'silver';
    if (totalHours < 5000) return 'gold';
    return 'diamond';
}

export function getTierBadge(tier: 'bronze' | 'silver' | 'gold' | 'diamond'): string {
    const badges = {
        bronze: '🥉',
        silver: '🥈',
        gold: '🥇',
        diamond: '💎'
    };
    return badges[tier];
}

export function getTierName(tier: 'bronze' | 'silver' | 'gold' | 'diamond'): string {
    const names = {
        bronze: 'Beginner',
        silver: 'Intermediate',
        gold: 'Expert',
        diamond: 'Elite'
    };
    return names[tier];
}
