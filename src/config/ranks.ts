export interface RankConfig {
    id: string;
    name: string;
    minHours: number;
    maxHours: number;
    image: string;
    order: number;
}

export const PILOT_RANKS: RankConfig[] = [
    {
        id: 'cadet',
        name: 'Cadet',
        minHours: 0,
        maxHours: 15,
        image: '/img/ranks/cadet.png',
        order: 1
    },
    {
        id: 'student_pilot',
        name: 'Student Pilot',
        minHours: 15,
        maxHours: 150,
        image: '/img/ranks/student_pilots.png',
        order: 2
    },
    {
        id: 'amateur_pilot',
        name: 'Amateur Pilot',
        minHours: 150,
        maxHours: 300,
        image: '/img/ranks/amature_pilots.png',
        order: 3
    },
    {
        id: 'private_pilot',
        name: 'Private Pilot',
        minHours: 300,
        maxHours: 500,
        image: '/img/ranks/pp_pilots.png',
        order: 4
    },
    {
        id: 'first_officer',
        name: 'First Officer',
        minHours: 500,
        maxHours: 1000,
        image: '/img/ranks/first_officers.png',
        order: 5
    },
    {
        id: 'senior_first_officer',
        name: 'Senior First Officer',
        minHours: 1000,
        maxHours: 2500,
        image: '/img/ranks/senior_firstofficer.png',
        order: 6
    },
    {
        id: 'captain',
        name: 'Captain',
        minHours: 2500,
        maxHours: 5000,
        image: '/img/ranks/captain.png',
        order: 7
    },
    {
        id: 'flight_captain',
        name: 'Flight Captain',
        minHours: 5000,
        maxHours: 7000,
        image: '/img/ranks/flight_cap.png',
        order: 8
    },
    {
        id: 'senior_flight_captain',
        name: 'Senior Flight Captain',
        minHours: 7000,
        maxHours: 10000,
        image: '/img/ranks/senior_flightcaps.png',
        order: 9
    },
    {
        id: 'commercial_captain',
        name: 'Commercial Captain',
        minHours: 10000,
        maxHours: 20000,
        image: '/img/ranks/CommerCap.png',
        order: 10
    },
    {
        id: 'instructor',
        name: 'Instructor',
        minHours: 20000,
        maxHours: Infinity,
        image: '/img/ranks/Instructor.png',
        order: 11
    }
];

export function getRankByHours(totalHours: number): RankConfig {
    for (const rank of PILOT_RANKS) {
        if (totalHours >= rank.minHours && totalHours < rank.maxHours) {
            return rank;
        }
    }
    return PILOT_RANKS[PILOT_RANKS.length - 1];
}

export function getNextRank(currentRank: string): RankConfig | null {
    const currentIndex = PILOT_RANKS.findIndex(r => r.id === currentRank);
    if (currentIndex === -1 || currentIndex === PILOT_RANKS.length - 1) {
        return null;
    }
    return PILOT_RANKS[currentIndex + 1];
}

export function getRankProgress(totalHours: number): { current: RankConfig; next: RankConfig | null; progress: number } {
    const current = getRankByHours(totalHours);
    const next = getNextRank(current.id);
    
    if (!next) {
        return { current, next: null, progress: 100 };
    }
    
    const hoursInCurrentRank = totalHours - current.minHours;
    const hoursNeededForNext = next.minHours - current.minHours;
    const progress = Math.min((hoursInCurrentRank / hoursNeededForNext) * 100, 100);
    
    return { current, next, progress };
}
