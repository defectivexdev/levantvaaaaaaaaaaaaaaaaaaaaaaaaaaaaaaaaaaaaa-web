/**
 * Events & Competition System Types
 * Live competitions, leaderboards, and event management
 */

// ============================================================================
// EVENT TYPES
// ============================================================================

export enum EventType {
    LANDING_CHALLENGE = 'landing_challenge',
    FUEL_EFFICIENCY = 'fuel_efficiency',
    SPEED_RUN = 'speed_run',
    LONG_HAUL = 'long_haul',
    PERFECT_SCORE = 'perfect_score',
    GROUP_FLIGHT = 'group_flight',
}

export enum EventStatus {
    UPCOMING = 'upcoming',
    ACTIVE = 'active',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

export interface CompetitionEvent {
    id: string;
    name: string;
    description: string;
    type: EventType;
    status: EventStatus;
    
    start_date: Date;
    end_date: Date;
    
    // Requirements
    required_route?: {
        departure: string;
        arrival: string;
    };
    required_aircraft?: string[];
    min_rank?: string;
    
    // Scoring criteria
    scoring_metric: 'landing_rate' | 'fuel_efficiency' | 'flight_time' | 'score' | 'distance';
    scoring_order: 'asc' | 'desc';  // Lower is better (landing rate) or higher is better (score)
    
    // Rewards
    rewards: {
        first_place: EventReward;
        second_place?: EventReward;
        third_place?: EventReward;
        participation?: EventReward;
    };
    
    // Metadata
    max_participants?: number;
    current_participants: number;
    
    created_by: string;
    created_at: Date;
    updated_at: Date;
}

export interface EventReward {
    cash: number;
    badge_id?: string;
    rank_points?: number;
    special_title?: string;
}

// ============================================================================
// LEADERBOARD
// ============================================================================

export interface LeaderboardEntry {
    position: number;
    pilotId: string;
    pilotName: string;
    pilotRank: string;
    
    // Score data
    score_value: number;
    score_display: string;      // Formatted for display
    
    // Flight details
    flightId?: string;
    aircraft?: string;
    route?: string;
    
    // Metadata
    submitted_at: Date;
    is_verified: boolean;
}

export interface Leaderboard {
    eventId: string;
    event_name: string;
    event_type: EventType;
    
    entries: LeaderboardEntry[];
    total_participants: number;
    
    last_updated: Date;
}

// ============================================================================
// EVENT PARTICIPATION
// ============================================================================

export interface EventParticipation {
    id: string;
    eventId: string;
    pilotId: string;
    
    // Submission
    flightId?: string;
    score_value?: number;
    submitted_at?: Date;
    
    // Status
    status: 'registered' | 'participated' | 'completed' | 'disqualified';
    
    // Rewards
    reward_received?: EventReward;
    final_position?: number;
    
    created_at: Date;
}

// ============================================================================
// EVENT FILTERS & QUERIES
// ============================================================================

export interface EventFilters {
    status?: EventStatus[];
    type?: EventType[];
    start_date_from?: Date;
    start_date_to?: Date;
    available_only?: boolean;  // Only events user can join
}

export interface LeaderboardQuery {
    eventId: string;
    limit?: number;
    offset?: number;
    pilotId?: string;          // Get specific pilot's position
}

// ============================================================================
// LIVE COMPETITION METRICS
// ============================================================================

export interface LiveCompetitionMetrics {
    eventId: string;
    
    // Real-time stats
    active_participants: number;
    submissions_today: number;
    
    // Current leaders
    current_leader: LeaderboardEntry | null;
    top_3: LeaderboardEntry[];
    
    // User stats
    user_position?: number;
    user_score?: number;
    user_can_improve: boolean;
    
    // Time remaining
    time_remaining_ms: number;
    time_remaining_display: string;
}

// ============================================================================
// EVENT NOTIFICATIONS
// ============================================================================

export interface EventNotification {
    id: string;
    pilotId: string;
    eventId: string;
    
    type: 'event_started' | 'event_ending_soon' | 'position_changed' | 'event_completed' | 'reward_received';
    
    title: string;
    message: string;
    
    read: boolean;
    created_at: Date;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getEventStatusColor(status: EventStatus): string {
    const colors: Record<EventStatus, string> = {
        [EventStatus.UPCOMING]: '#3B82F6',
        [EventStatus.ACTIVE]: '#10B981',
        [EventStatus.COMPLETED]: '#6B7280',
        [EventStatus.CANCELLED]: '#EF4444',
    };
    return colors[status];
}

export function getEventTypeIcon(type: EventType): string {
    const icons: Record<EventType, string> = {
        [EventType.LANDING_CHALLENGE]: '🛬',
        [EventType.FUEL_EFFICIENCY]: '⛽',
        [EventType.SPEED_RUN]: '⚡',
        [EventType.LONG_HAUL]: '🌍',
        [EventType.PERFECT_SCORE]: '💯',
        [EventType.GROUP_FLIGHT]: '👥',
    };
    return icons[type];
}

export function formatTimeRemaining(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

export function isEventActive(event: CompetitionEvent): boolean {
    const now = new Date();
    return event.status === EventStatus.ACTIVE &&
           now >= event.start_date &&
           now <= event.end_date;
}

export function canParticipate(event: CompetitionEvent, pilotRank: string): boolean {
    if (event.status !== EventStatus.ACTIVE && event.status !== EventStatus.UPCOMING) {
        return false;
    }
    
    if (event.max_participants && event.current_participants >= event.max_participants) {
        return false;
    }
    
    if (event.min_rank) {
        // Would need rank comparison logic
        return true;
    }
    
    return true;
}
