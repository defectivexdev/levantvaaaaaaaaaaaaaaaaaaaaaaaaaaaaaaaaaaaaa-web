import { BadgeCategory, BadgeTier } from '@/models/Badge';

export interface BadgeDefinition {
    badge_id: string;
    name: string;
    description: string;
    category: BadgeCategory;
    tier: BadgeTier;
    icon: string;
    image?: string; // Path to badge image in /img/awards/
    requirement: {
        type: string;
        value: number | string;
        condition?: string;
    };
    points: number;
    order: number;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
    // Flight Count Badges
    {
        badge_id: 'flights_5',
        name: '5 Flights',
        description: 'Complete 5 flights',
        category: 'flight_count',
        tier: 'bronze',
        icon: '🛫',
        image: '5flight.png',
        requirement: { type: 'total_flights', value: 5 },
        points: 25,
        order: 2
    },
    {
        badge_id: 'flights_25',
        name: '25 Flights',
        description: 'Complete 25 flights',
        category: 'flight_count',
        tier: 'silver',
        icon: '🛬',
        image: 'fl_25flight.png',
        requirement: { type: 'total_flights', value: 25 },
        points: 50,
        order: 3
    },
    {
        badge_id: 'flights_50',
        name: '50 Flights',
        description: 'Complete 50 flights',
        category: 'flight_count',
        tier: 'gold',
        icon: '🛩️',
        image: '50flight.png',
        requirement: { type: 'total_flights', value: 50 },
        points: 100,
        order: 4
    },
    {
        badge_id: 'flights_300',
        name: '300 Flights',
        description: 'Complete 300 flights',
        category: 'flight_count',
        tier: 'diamond',
        icon: '�',
        image: '300flight.png',
        requirement: { type: 'total_flights', value: 300 },
        points: 300,
        order: 5
    },

    // Hours Badges
    {
        badge_id: 'hours_300',
        name: '300 Hours',
        description: 'Accumulate 300 flight hours',
        category: 'hours',
        tier: 'silver',
        icon: '⏱️',
        image: '300hours.png',
        requirement: { type: 'total_hours', value: 300 },
        points: 75,
        order: 6
    },
    {
        badge_id: 'hours_1000',
        name: '1000 Hours',
        description: 'Accumulate 1000 flight hours',
        category: 'hours',
        tier: 'gold',
        icon: '⌚',
        image: '1000hours.png',
        requirement: { type: 'total_hours', value: 1000 },
        points: 150,
        order: 7
    },

    // Landing Badges
    {
        badge_id: 'butter_landing',
        name: 'Butter Landing',
        description: 'Land with -100 fpm or better',
        category: 'landing',
        tier: 'bronze',
        icon: '🧈',
        image: 'butterlanding.png',
        requirement: { type: 'landing_rate', value: -100, condition: 'better_than' },
        points: 25,
        order: 11
    },
    {
        badge_id: 'butter_king',
        name: 'Butter King',
        description: 'Achieve 10 butter landings',
        category: 'landing',
        tier: 'gold',
        icon: '👑',
        image: 'butterking.png',
        requirement: { type: 'butter_landings', value: 10 },
        points: 200,
        order: 21
    },
    {
        badge_id: 'firm_landing',
        name: 'Firm Landing',
        description: 'Land with -200 to -300 fpm (firm but safe)',
        category: 'landing',
        tier: 'bronze',
        icon: '�',
        image: 'firmlanding.png',
        requirement: { type: 'landing_rate', value: -200, condition: 'range' },
        points: 15,
        order: 13
    },
    {
        badge_id: 'crosswind_landing',
        name: 'Crosswind Landing',
        description: 'Land with crosswind > 20kts',
        category: 'landing',
        tier: 'silver',
        icon: '🌬️',
        image: 'crosswindlanding.png',
        requirement: { type: 'crosswind', value: 20 },
        points: 75,
        order: 47
    },
    {
        badge_id: 'blind_landing',
        name: 'Blind Landing',
        description: 'Complete an ILS approach in low visibility',
        category: 'landing',
        tier: 'gold',
        icon: '🌫️',
        image: 'blindlanding.png',
        requirement: { type: 'visibility', value: '0.5' },
        points: 150,
        order: 24
    },
    {
        badge_id: 'storm_landing',
        name: 'Storm Landing',
        description: 'Land in storm conditions',
        category: 'landing',
        tier: 'gold',
        icon: '⛈️',
        image: 'stormlanding.png',
        requirement: { type: 'weather', value: 'storm' },
        points: 150,
        order: 25
    },

    // Special Flight Badges
    {
        badge_id: 'long_haul_19h',
        name: 'Ultra Long Haul',
        description: 'Complete a 19+ hour flight',
        category: 'special',
        tier: 'diamond',
        icon: '🌍',
        image: 'longhaul.png',
        requirement: { type: 'flight_duration', value: 19 },
        points: 500,
        order: 30
    },
    {
        badge_id: 'ultra_long_haul',
        name: 'Ultra Long Haul',
        description: 'Complete a flight > 15 hours',
        category: 'special',
        tier: 'gold',
        icon: '🛫',
        image: 'ultralonghaul.png',
        requirement: { type: 'flight_duration', value: 15 },
        points: 300,
        order: 31
    },
    {
        badge_id: 'perfect_flight',
        name: 'Perfect Flight',
        description: 'Landing rate between -50 and -150 fpm',
        category: 'special',
        tier: 'silver',
        icon: '⭐',
        image: 'perfectflight.png',
        requirement: { type: 'landing_rate', value: '-50_-150' },
        points: 100,
        order: 32
    },
    {
        badge_id: 'iron_pilot',
        name: 'The Iron Pilot',
        description: '24h total flight time in 1 day',
        category: 'special',
        tier: 'diamond',
        icon: '🦾',
        image: 'ironpilot.png',
        requirement: { type: 'daily_hours', value: 24 },
        points: 750,
        order: 33
    },
    {
        badge_id: 'around_world',
        name: 'Around the World',
        description: 'Complete a global route series',
        category: 'special',
        tier: 'diamond',
        icon: '🌐',
        image: 'aroundtheworld.png',
        requirement: { type: 'route_series', value: 'global' },
        points: 1000,
        order: 34
    },

    // Location Badges
    {
        badge_id: 'madeira_landing',
        name: 'Challenge Airport',
        description: 'Land at Madeira (LPMA)',
        category: 'location',
        tier: 'gold',
        icon: '🏔️',
        image: 'madeiralanding.png',
        requirement: { type: 'airport', value: 'LPMA' },
        points: 200,
        order: 40
    },
    {
        badge_id: 'heathrow_landing',
        name: 'Busiest Airport',
        description: 'Land at London Heathrow (EGLL)',
        category: 'location',
        tier: 'silver',
        icon: '🏙️',
        image: 'heathrowlanding.png',
        requirement: { type: 'airport', value: 'EGLL' },
        points: 100,
        order: 41
    },
    {
        badge_id: 'world_traveler',
        name: 'World Traveler',
        description: 'Land in 25 different countries',
        category: 'location',
        tier: 'gold',
        icon: '🗺️',
        image: 'worldtraveler.png',
        requirement: { type: 'unique_countries', value: 25 },
        points: 300,
        order: 42
    },
    {
        badge_id: 'continental_pilot',
        name: 'Continental Pilot',
        description: 'Fly to all 6 continents',
        category: 'location',
        tier: 'diamond',
        icon: '🌏',
        image: 'continentalpilot.png',
        requirement: { type: 'continents', value: 6 },
        points: 500,
        order: 43
    },
    {
        badge_id: 'island_hopper',
        name: 'Island Hopper',
        description: 'Land in 10 island airports',
        category: 'location',
        tier: 'silver',
        icon: '🏝️',
        image: 'islandhopper.png',
        requirement: { type: 'island_airports', value: 10 },
        points: 150,
        order: 44
    },
    {
        badge_id: 'mountain_pilot',
        name: 'Mountain Pilot',
        description: 'Land in 5 mountain airports',
        category: 'location',
        tier: 'gold',
        icon: '⛰️',
        image: 'mountainpilot.png',
        requirement: { type: 'mountain_airports', value: 5 },
        points: 200,
        order: 45
    },
    {
        badge_id: 'polar_explorer',
        name: 'Polar Explorer',
        description: 'Land above 70° latitude',
        category: 'location',
        tier: 'diamond',
        icon: '🧊',
        image: 'polarexplorer.png',
        requirement: { type: 'latitude', value: 70 },
        points: 400,
        order: 46
    },
    {
        badge_id: 'short_runway',
        name: 'Short Runway Specialist',
        description: 'Land on runway < 2000m',
        category: 'location',
        tier: 'silver',
        icon: '🛬',
        image: 'shortrunway.png',
        requirement: { type: 'runway_length', value: 2000 },
        points: 100,
        order: 47
    },

    // Time-based Badges
    {
        badge_id: 'red_eye_specialist_1',
        name: 'Red Eye Specialist I',
        description: 'Complete 15 flights between 00:00-06:00 local time',
        category: 'time',
        tier: 'silver',
        icon: '🌙',
        image: 'redeye15flight.png',
        requirement: { type: 'night_flights', value: 15 },
        points: 50,
        order: 34
    },

    // Aircraft Badges

    // Domestic/International

    // Network Badges

    // Event Badges
];

export function getBadgesByCategory(category: BadgeCategory): BadgeDefinition[] {
    return BADGE_DEFINITIONS.filter(b => b.category === category).sort((a, b) => a.order - b.order);
}

export function getBadgesByTier(tier: BadgeTier): BadgeDefinition[] {
    return BADGE_DEFINITIONS.filter(b => b.tier === tier).sort((a, b) => a.order - b.order);
}

export function getBadgeById(badgeId: string): BadgeDefinition | undefined {
    return BADGE_DEFINITIONS.find(b => b.badge_id === badgeId);
}
