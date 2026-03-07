/**
 * Virtual Airline Settings Types
 * Global configuration schema for the entire platform
 */

// ============================================================================
// OPERATIONAL LIMITS
// ============================================================================

export interface OperationalLimits {
    max_taxi_speed: number;           // knots
    max_landing_fpm: number;          // feet per minute (positive value)
    overspeed_buffer: number;         // knots above VMO before penalty
    g_force_limits: {
        max: number;                  // maximum G-load
        min: number;                  // minimum G-load
        structural_warning: number;   // structural stress threshold
    };
    flap_overspeed: number;           // knots
    gear_overspeed: number;           // knots
}

// ============================================================================
// SCORING WEIGHTS
// ============================================================================

export interface ScoringWeights {
    // Penalties
    penalty_excessive_g: number;
    penalty_low_g: number;
    penalty_structural_stress: number;
    penalty_overspeed: number;
    penalty_taxi_overspeed: number;
    penalty_hard_landing: number;
    penalty_rough_landing: number;
    penalty_firm_landing: number;
    penalty_flap_overspeed: number;
    penalty_gear_overspeed: number;
    
    // Landing rate thresholds (fpm - positive values)
    landing_excellent: number;
    landing_good: number;
    landing_fair: number;
    landing_firm: number;
    landing_rough: number;
    
    // Bonus points
    bonus_butter_landing: number;     // < 100 fpm
    bonus_perfect_flight: number;     // No violations
}

// ============================================================================
// FUEL CONSTANTS
// ============================================================================

export interface FuelConstants {
    default_reserve_minutes: number;   // Final reserve time
    contingency_percentage: number;    // % of trip fuel
    taxi_time_minutes: number;         // Default taxi time
    taxi_burn_multiplier: number;      // % of cruise burn rate
    alternate_reserve_minutes: number; // Time to alternate
}

// ============================================================================
// ACARS CONFIGURATION
// ============================================================================

export interface AcarsConfig {
    telemetry_update_rate: number;     // milliseconds (1000 = 1s)
    sync_interval: number;             // seconds (DB sync frequency)
    enable_smooth_interpolation: boolean;
    enable_route_deviation_alerts: boolean;
    deviation_threshold_nm: number;    // Nautical miles
    connection_timeout: number;        // seconds
}

// ============================================================================
// GENERAL SETTINGS
// ============================================================================

export interface GeneralSettings {
    va_name: string;
    va_logo_url?: string;
    callsign_prefix: string;           // e.g., "LVA"
    timezone: string;                  // IANA timezone
    currency: string;                  // ISO 4217 code
    distance_unit: 'nm' | 'km' | 'mi';
    altitude_unit: 'ft' | 'm';
    speed_unit: 'kts' | 'kmh' | 'mph';
}

// ============================================================================
// FLIGHT OPERATIONS
// ============================================================================

export interface FlightOperations {
    strict_mode: boolean;              // Auto-reject crashed flights
    simbrief_mandatory: boolean;       // Require SimBrief import
    require_flight_plan: boolean;      // Mandatory flight plan
    auto_approve_flights: boolean;     // Skip manual approval
    max_flight_duration_hours: number; // Maximum flight time
    min_flight_duration_minutes: number; // Minimum flight time
    allow_pause: boolean;              // Allow pausing flights
    require_real_weather: boolean;     // Force real weather usage
}

// ============================================================================
// ECONOMICS
// ============================================================================

export interface Economics {
    pay_rates: {
        [rank: string]: number;        // $/hour by rank
    };
    fuel_cost_multiplier: number;      // Multiplier for fuel costs
    landing_fee_base: number;          // Base landing fee
    landing_fee_per_pax: number;       // Per passenger fee
    bonus_on_time: number;             // Bonus for on-time arrival
    bonus_fuel_efficient: number;      // Bonus for fuel efficiency
    penalty_crash: number;             // Penalty for crash
    penalty_overspeed_fine: number;    // Fine per overspeed violation
}

// ============================================================================
// COMPLETE VA SETTINGS
// ============================================================================

export interface VASettings {
    id: string;
    
    // Configuration sections
    general: GeneralSettings;
    operational_limits: OperationalLimits;
    scoring_weights: ScoringWeights;
    fuel_constants: FuelConstants;
    acars_config: AcarsConfig;
    flight_operations: FlightOperations;
    economics: Economics;
    
    // Metadata
    updated_at: Date;
    updated_by: string;
    version: number;
}

// ============================================================================
// DEFAULT SETTINGS
// ============================================================================

export const DEFAULT_VA_SETTINGS: Omit<VASettings, 'id' | 'updated_at' | 'updated_by' | 'version'> = {
    general: {
        va_name: 'Levant Virtual Airline',
        callsign_prefix: 'LVA',
        timezone: 'UTC',
        currency: 'USD',
        distance_unit: 'nm',
        altitude_unit: 'ft',
        speed_unit: 'kts',
    },
    
    operational_limits: {
        max_taxi_speed: 30,
        max_landing_fpm: 600,
        overspeed_buffer: 10,
        g_force_limits: {
            max: 2.1,
            min: 0.5,
            structural_warning: 2.5,
        },
        flap_overspeed: 250,
        gear_overspeed: 270,
    },
    
    scoring_weights: {
        penalty_excessive_g: 5,
        penalty_low_g: 3,
        penalty_structural_stress: 20,
        penalty_overspeed: 10,
        penalty_taxi_overspeed: 5,
        penalty_hard_landing: 15,
        penalty_rough_landing: 10,
        penalty_firm_landing: 5,
        penalty_flap_overspeed: 10,
        penalty_gear_overspeed: 10,
        landing_excellent: 100,
        landing_good: 200,
        landing_fair: 300,
        landing_firm: 400,
        landing_rough: 600,
        bonus_butter_landing: 10,
        bonus_perfect_flight: 20,
    },
    
    fuel_constants: {
        default_reserve_minutes: 30,
        contingency_percentage: 5,
        taxi_time_minutes: 15,
        taxi_burn_multiplier: 0.3,
        alternate_reserve_minutes: 45,
    },
    
    acars_config: {
        telemetry_update_rate: 1000,
        sync_interval: 30,
        enable_smooth_interpolation: true,
        enable_route_deviation_alerts: true,
        deviation_threshold_nm: 5,
        connection_timeout: 30,
    },
    
    flight_operations: {
        strict_mode: false,
        simbrief_mandatory: false,
        require_flight_plan: true,
        auto_approve_flights: true,
        max_flight_duration_hours: 18,
        min_flight_duration_minutes: 10,
        allow_pause: true,
        require_real_weather: false,
    },
    
    economics: {
        pay_rates: {
            'Cadet': 50,
            'Second Officer': 75,
            'First Officer': 100,
            'Senior First Officer': 125,
            'Captain': 150,
            'Senior Captain': 175,
            'Training Captain': 200,
            'Chief Pilot': 250,
        },
        fuel_cost_multiplier: 1.0,
        landing_fee_base: 100,
        landing_fee_per_pax: 5,
        bonus_on_time: 50,
        bonus_fuel_efficient: 75,
        penalty_crash: 500,
        penalty_overspeed_fine: 25,
    },
};

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export interface SettingsValidation {
    field: string;
    min?: number;
    max?: number;
    required?: boolean;
    type: 'number' | 'string' | 'boolean' | 'object';
}

export const SETTINGS_VALIDATION: Record<string, SettingsValidation> = {
    'operational_limits.max_taxi_speed': { field: 'Max Taxi Speed', min: 10, max: 50, type: 'number' },
    'operational_limits.max_landing_fpm': { field: 'Max Landing FPM', min: 300, max: 1000, type: 'number' },
    'acars_config.telemetry_update_rate': { field: 'Telemetry Update Rate', min: 500, max: 30000, type: 'number' },
    'scoring_weights.penalty_hard_landing': { field: 'Hard Landing Penalty', min: 0, max: 50, type: 'number' },
};
