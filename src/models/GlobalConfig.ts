import mongoose, { Schema, Document } from 'mongoose';

export interface IGlobalConfig extends Document {
    key: string;
    // Economy Rates
    fuel_tax_percent: number;
    penalty_multiplier: number;
    // Revenue Rates
    ticket_price_per_nm: number;
    cargo_price_per_lb_nm: number;
    fuel_price_per_lb: number;
    base_landing_fee: number;
    // Rank Pay Rates (per hour)
    rank_pay_rates: {
        cadet: number;
        student_pilot: number;
        amateur_pilot: number;
        private_pilot: number;
        first_officer: number;
        senior_first_officer: number;
        captain: number;
        flight_captain: number;
        senior_flight_captain: number;
        commercial_captain: number;
        instructor: number;
    };
    // Damage Thresholds
    hard_landing_threshold: number;
    severe_damage_threshold: number;
    overspeed_damage_per_10s: number;
    gforce_high_threshold: number;
    gforce_low_threshold: number;
    grounded_health_threshold: number;
    // Store → Airline Cr
    store_to_airline_percent: number;
    // Credit Bonuses (Flight Performance)
    cr_base_flight: number;
    cr_greaser_bonus: number;
    cr_firm_bonus: number;
    cr_hard_landing_penalty: number;
    cr_on_time_bonus: number;
    cr_fuel_efficiency_bonus: number;
    cr_first_flight_multiplier: number;
    cr_hub_to_hub_bonus: number;
    cr_event_multiplier: number;
    cr_long_haul_4h: number;
    cr_long_haul_8h: number;
    cr_new_route_bonus: number;
    // Professionalism Penalties
    cr_taxi_speed_penalty: number;
    cr_light_violation_penalty: number;
    cr_overspeed_penalty: number;
    cr_taxi_speed_limit: number;
    // Group Flight Credits
    cr_group_flight_participation: number;
    location_based_fleet: boolean;
    // Timestamps
    updated_at: Date;
    updated_by?: string;
}

const GlobalConfigSchema = new Schema<IGlobalConfig>({
    key: { type: String, default: 'LVT_MAIN', unique: true, index: true },
    // Economy Rates
    fuel_tax_percent: { type: Number, default: 10 },
    penalty_multiplier: { type: Number, default: 5 },
    // Revenue Rates
    ticket_price_per_nm: { type: Number, default: 0.8 },
    cargo_price_per_lb_nm: { type: Number, default: 0.002 },
    fuel_price_per_lb: { type: Number, default: 0.65 },
    base_landing_fee: { type: Number, default: 250 },
    // Rank Pay Rates (per hour)
    rank_pay_rates: {
        type: {
            cadet: { type: Number, default: 25 },
            student_pilot: { type: Number, default: 35 },
            amateur_pilot: { type: Number, default: 50 },
            private_pilot: { type: Number, default: 75 },
            first_officer: { type: Number, default: 100 },
            senior_first_officer: { type: Number, default: 150 },
            captain: { type: Number, default: 200 },
            flight_captain: { type: Number, default: 250 },
            senior_flight_captain: { type: Number, default: 300 },
            commercial_captain: { type: Number, default: 400 },
            instructor: { type: Number, default: 500 }
        },
        default: {
            cadet: 25,
            student_pilot: 35,
            amateur_pilot: 50,
            private_pilot: 75,
            first_officer: 100,
            senior_first_officer: 150,
            captain: 200,
            flight_captain: 250,
            senior_flight_captain: 300,
            commercial_captain: 400,
            instructor: 500
        }
    },
    // Damage Thresholds
    hard_landing_threshold: { type: Number, default: -400 },
    severe_damage_threshold: { type: Number, default: -700 },
    overspeed_damage_per_10s: { type: Number, default: 0.5 },
    gforce_high_threshold: { type: Number, default: 2.5 },
    gforce_low_threshold: { type: Number, default: -1.0 },
    grounded_health_threshold: { type: Number, default: 20 },
    // Store → Airline Cr
    store_to_airline_percent: { type: Number, default: 100 },
    // Credit Bonuses (Flight Performance)
    cr_base_flight: { type: Number, default: 100 },
    cr_greaser_bonus: { type: Number, default: 50 },
    cr_firm_bonus: { type: Number, default: 25 },
    cr_hard_landing_penalty: { type: Number, default: -50 },
    cr_on_time_bonus: { type: Number, default: 20 },
    cr_fuel_efficiency_bonus: { type: Number, default: 30 },
    cr_first_flight_multiplier: { type: Number, default: 1.2 },
    cr_hub_to_hub_bonus: { type: Number, default: 50 },
    cr_event_multiplier: { type: Number, default: 2.0 },
    cr_long_haul_4h: { type: Number, default: 100 },
    cr_long_haul_8h: { type: Number, default: 250 },
    cr_new_route_bonus: { type: Number, default: 50 },
    // Professionalism Penalties
    cr_taxi_speed_penalty: { type: Number, default: -10 },
    cr_light_violation_penalty: { type: Number, default: -15 },
    cr_overspeed_penalty: { type: Number, default: -50 },
    cr_taxi_speed_limit: { type: Number, default: 30 },
    // Group Flight Credits
    cr_group_flight_participation: { type: Number, default: 50 },
    location_based_fleet: { type: Boolean, default: true },
    // Timestamps
    updated_at: { type: Date, default: Date.now },
    updated_by: String,
});

const GlobalConfig = mongoose.models.GlobalConfig || mongoose.model<IGlobalConfig>('GlobalConfig', GlobalConfigSchema);
export default GlobalConfig;
