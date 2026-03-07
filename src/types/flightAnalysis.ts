/**
 * Flight Analysis System Types
 * Post-flight debriefing, telemetry analysis, and performance reports
 */

import type { FlightPhase } from '@/types/flight';

// ============================================================================
// TELEMETRY DATA POINT
// ============================================================================

export interface TelemetryDataPoint {
    timestamp: number;
    elapsed_time: number;
    
    // Position
    latitude: number;
    longitude: number;
    altitude: number;
    heading: number;
    
    // Speed
    indicated_airspeed: number;
    ground_speed: number;
    vertical_speed: number;
    
    // Forces
    g_force: number;
    pitch: number;
    bank: number;
    
    // Engine
    throttle: number;
    fuel_flow: number;
    fuel_quantity: number;
    
    // Flight phase
    phase: FlightPhase;
    
    // Autopilot
    autopilot_master: boolean;
    autopilot_altitude: boolean;
    autopilot_heading: boolean;
    
    // Environment
    wind_speed?: number;
    wind_direction?: number;
    outside_temp?: number;
}

// ============================================================================
// LANDING ANALYSIS
// ============================================================================

export interface LandingAnalysis {
    // Landing metrics
    touchdown_rate: number;
    touchdown_speed: number;
    touchdown_g_force: number;
    touchdown_pitch: number;
    touchdown_bank: number;
    
    // Approach metrics
    approach_speed_avg: number;
    approach_speed_deviation: number;
    glideslope_deviation_avg: number;
    centerline_deviation_avg: number;
    
    // Grading
    landing_grade: 'Perfect' | 'Excellent' | 'Good' | 'Fair' | 'Hard' | 'Crash';
    landing_score: number;
    
    // Detailed breakdown
    rate_score: number;
    speed_score: number;
    alignment_score: number;
    smoothness_score: number;
    
    // Telemetry
    final_approach_data: TelemetryDataPoint[];
    touchdown_data: TelemetryDataPoint;
}

export const LANDING_GRADES = {
    PERFECT: { min: -50, max: 50, label: 'Perfect', emoji: '🌟', score: 100 },
    EXCELLENT: { min: -100, max: 100, label: 'Excellent', emoji: '✨', score: 95 },
    GOOD: { min: -200, max: 200, label: 'Good', emoji: '👍', score: 85 },
    FAIR: { min: -400, max: 400, label: 'Fair', emoji: '👌', score: 70 },
    HARD: { min: -600, max: 600, label: 'Hard', emoji: '⚠️', score: 50 },
    CRASH: { min: -Infinity, max: Infinity, label: 'Crash', emoji: '💥', score: 0 },
} as const;

// ============================================================================
// FUEL EFFICIENCY ANALYSIS
// ============================================================================

export interface FuelEfficiencyAnalysis {
    // Fuel metrics
    total_fuel_used: number;
    fuel_per_nm: number;
    fuel_per_hour: number;
    
    // Efficiency ratings
    efficiency_score: number;
    efficiency_grade: 'Excellent' | 'Good' | 'Average' | 'Poor';
    
    // Comparison
    expected_fuel_burn: number;
    fuel_savings: number;
    fuel_savings_percentage: number;
    
    // Phase breakdown
    phase_breakdown: {
        phase: FlightPhase;
        fuel_used: number;
        duration: number;
        percentage: number;
    }[];
    
    // Recommendations
    recommendations: string[];
    
    // Telemetry
    fuel_flow_data: {
        timestamp: number;
        fuel_flow: number;
        fuel_remaining: number;
        altitude: number;
    }[];
}

// ============================================================================
// FLIGHT PATH ANALYSIS
// ============================================================================

export interface FlightPathAnalysis {
    // Route metrics
    planned_distance: number;
    actual_distance: number;
    distance_deviation: number;
    
    // Efficiency
    route_efficiency: number;
    direct_distance: number;
    
    // Deviations
    max_cross_track_error: number;
    avg_cross_track_error: number;
    total_deviations: number;
    
    // Waypoints
    waypoints_hit: number;
    waypoints_total: number;
    waypoint_accuracy: number;
    
    // Path data
    planned_route: {
        latitude: number;
        longitude: number;
        name?: string;
    }[];
    actual_path: {
        latitude: number;
        longitude: number;
        timestamp: number;
        altitude: number;
    }[];
    
    // Deviation points
    deviation_points: {
        latitude: number;
        longitude: number;
        deviation: number;
        timestamp: number;
    }[];
}

// ============================================================================
// PHASE ANALYSIS
// ============================================================================

export interface PhaseAnalysis {
    phase: FlightPhase;
    
    // Timing
    start_time: number;
    end_time: number;
    duration: number;
    
    // Metrics
    avg_altitude: number;
    max_altitude: number;
    avg_speed: number;
    max_speed: number;
    
    // Performance
    avg_g_force: number;
    max_g_force: number;
    violations: number;
    
    // Fuel
    fuel_used: number;
    avg_fuel_flow: number;
    
    // Autopilot usage
    autopilot_percentage: number;
    
    // Score
    phase_score: number;
}

// ============================================================================
// VIOLATION ANALYSIS
// ============================================================================

export interface ViolationAnalysis {
    total_violations: number;
    
    violations_by_type: {
        type: string;
        count: number;
        severity: 'minor' | 'major' | 'critical';
        penalty: number;
    }[];
    
    violations_timeline: {
        timestamp: number;
        type: string;
        severity: 'minor' | 'major' | 'critical';
        description: string;
        phase: FlightPhase;
        telemetry: TelemetryDataPoint;
    }[];
    
    total_penalty: number;
}

// ============================================================================
// PERFORMANCE METRICS
// ============================================================================

export interface PerformanceMetrics {
    // Overall
    flight_score: number;
    flight_grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
    
    // Category scores
    landing_score: number;
    fuel_efficiency_score: number;
    route_adherence_score: number;
    smoothness_score: number;
    autopilot_usage_score: number;
    
    // Statistics
    avg_g_force: number;
    max_g_force: number;
    avg_vertical_speed: number;
    max_vertical_speed: number;
    
    // Comparison
    percentile_rank: number;
    better_than_percentage: number;
}

// ============================================================================
// FLIGHT ANALYSIS REPORT
// ============================================================================

export interface FlightAnalysisReport {
    flight_id: string;
    pilot_id: string;
    
    // Basic info
    flight_number: string;
    aircraft: string;
    departure: string;
    arrival: string;
    
    // Timing
    departure_time: Date;
    arrival_time: Date;
    flight_duration: number;
    
    // Distance
    distance: number;
    
    // Analysis sections
    performance: PerformanceMetrics;
    landing: LandingAnalysis;
    fuel_efficiency: FuelEfficiencyAnalysis;
    flight_path: FlightPathAnalysis;
    phase_breakdown: PhaseAnalysis[];
    violations: ViolationAnalysis;
    
    // Telemetry
    telemetry_summary: {
        total_data_points: number;
        sampling_rate: number;
        data_quality: number;
    };
    
    // Recommendations
    strengths: string[];
    areas_for_improvement: string[];
    next_flight_tips: string[];
    
    // Generated
    generated_at: Date;
}

// ============================================================================
// CHART DATA
// ============================================================================

export interface ChartDataPoint {
    x: number;
    y: number;
    label?: string;
}

export interface FlightChartData {
    // Altitude profile
    altitude_chart: {
        time: number[];
        altitude: number[];
        phases: { phase: FlightPhase; start: number; end: number }[];
    };
    
    // Speed profile
    speed_chart: {
        time: number[];
        indicated_airspeed: number[];
        ground_speed: number[];
    };
    
    // Vertical speed
    vertical_speed_chart: {
        time: number[];
        vertical_speed: number[];
    };
    
    // G-force
    g_force_chart: {
        time: number[];
        g_force: number[];
        limit_upper: number;
        limit_lower: number;
    };
    
    // Fuel
    fuel_chart: {
        time: number[];
        fuel_quantity: number[];
        fuel_flow: number[];
    };
    
    // Landing approach
    landing_approach_chart: {
        distance: number[];
        altitude: number[];
        glideslope: number[];
    };
}

// ============================================================================
// REPLAY DATA
// ============================================================================

export interface FlightReplayData {
    flight_id: string;
    
    // Metadata
    duration: number;
    data_points: number;
    
    // Telemetry
    telemetry: TelemetryDataPoint[];
    
    // Route
    planned_route: {
        latitude: number;
        longitude: number;
        altitude?: number;
        name?: string;
    }[];
    
    // Events
    events: {
        timestamp: number;
        type: 'phase_change' | 'violation' | 'waypoint' | 'milestone';
        description: string;
        data?: any;
    }[];
    
    // Playback settings
    playback_speed: number;
    current_position: number;
}

// ============================================================================
// COMPARISON DATA
// ============================================================================

export interface FlightComparison {
    current_flight: FlightAnalysisReport;
    
    // Personal bests
    personal_best_score: number;
    personal_best_landing: number;
    personal_best_fuel_efficiency: number;
    
    // Averages
    pilot_average_score: number;
    pilot_average_landing: number;
    pilot_average_fuel_efficiency: number;
    
    // VA averages
    va_average_score: number;
    va_average_landing: number;
    va_average_fuel_efficiency: number;
    
    // Rankings
    score_rank: number;
    landing_rank: number;
    fuel_efficiency_rank: number;
    
    // Improvements
    score_improvement: number;
    landing_improvement: number;
    fuel_efficiency_improvement: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getLandingGrade(landingRate: number): {
    label: string;
    emoji: string;
    score: number;
} {
    const absRate = Math.abs(landingRate);
    
    if (absRate <= 50) return LANDING_GRADES.PERFECT;
    if (absRate <= 100) return LANDING_GRADES.EXCELLENT;
    if (absRate <= 200) return LANDING_GRADES.GOOD;
    if (absRate <= 400) return LANDING_GRADES.FAIR;
    if (absRate <= 600) return LANDING_GRADES.HARD;
    return LANDING_GRADES.CRASH;
}

export function getFlightGrade(score: number): 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 97) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
}

export function getFuelEfficiencyGrade(
    actual: number,
    expected: number
): 'Excellent' | 'Good' | 'Average' | 'Poor' {
    const efficiency = (expected / actual) * 100;
    
    if (efficiency >= 110) return 'Excellent';
    if (efficiency >= 100) return 'Good';
    if (efficiency >= 90) return 'Average';
    return 'Poor';
}

export function calculateRouteEfficiency(
    actualDistance: number,
    directDistance: number
): number {
    return (directDistance / actualDistance) * 100;
}

export function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

export function formatFuelFlow(gallonsPerHour: number): string {
    return `${gallonsPerHour.toFixed(1)} gal/hr`;
}

export function formatVerticalSpeed(fpm: number): string {
    const sign = fpm >= 0 ? '+' : '';
    return `${sign}${fpm.toFixed(0)} fpm`;
}

export function downsampleTelemetry(
    telemetry: TelemetryDataPoint[],
    targetPoints: number
): TelemetryDataPoint[] {
    if (telemetry.length <= targetPoints) return telemetry;
    
    const step = Math.floor(telemetry.length / targetPoints);
    const downsampled: TelemetryDataPoint[] = [];
    
    for (let i = 0; i < telemetry.length; i += step) {
        downsampled.push(telemetry[i]);
    }
    
    // Always include last point
    if (downsampled[downsampled.length - 1] !== telemetry[telemetry.length - 1]) {
        downsampled.push(telemetry[telemetry.length - 1]);
    }
    
    return downsampled;
}
