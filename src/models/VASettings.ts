/**
 * VA Settings Database Model
 * Stores global configuration with JSONB support
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import type { VASettings as IVASettings } from '@/types/settings';
import { DEFAULT_VA_SETTINGS } from '@/types/settings';

export interface IVASettingsDocument extends Omit<IVASettings, 'id'>, Document {}

interface IVASettingsModel extends Model<IVASettingsDocument> {
    getSettings(): Promise<IVASettingsDocument>;
    updateSettings(updates: Partial<IVASettings>, updatedBy: string): Promise<IVASettingsDocument>;
}

const VASettingsSchema = new Schema<IVASettingsDocument, IVASettingsModel>({
    // General Settings
    general: {
        va_name: { type: String, required: true, default: DEFAULT_VA_SETTINGS.general.va_name },
        va_logo_url: String,
        callsign_prefix: { type: String, required: true, default: DEFAULT_VA_SETTINGS.general.callsign_prefix },
        timezone: { type: String, default: DEFAULT_VA_SETTINGS.general.timezone },
        currency: { type: String, default: DEFAULT_VA_SETTINGS.general.currency },
        distance_unit: { type: String, enum: ['nm', 'km', 'mi'], default: DEFAULT_VA_SETTINGS.general.distance_unit },
        altitude_unit: { type: String, enum: ['ft', 'm'], default: DEFAULT_VA_SETTINGS.general.altitude_unit },
        speed_unit: { type: String, enum: ['kts', 'kmh', 'mph'], default: DEFAULT_VA_SETTINGS.general.speed_unit },
    },
    
    // Operational Limits
    operational_limits: {
        max_taxi_speed: { type: Number, default: DEFAULT_VA_SETTINGS.operational_limits.max_taxi_speed },
        max_landing_fpm: { type: Number, default: DEFAULT_VA_SETTINGS.operational_limits.max_landing_fpm },
        overspeed_buffer: { type: Number, default: DEFAULT_VA_SETTINGS.operational_limits.overspeed_buffer },
        g_force_limits: {
            max: { type: Number, default: DEFAULT_VA_SETTINGS.operational_limits.g_force_limits.max },
            min: { type: Number, default: DEFAULT_VA_SETTINGS.operational_limits.g_force_limits.min },
            structural_warning: { type: Number, default: DEFAULT_VA_SETTINGS.operational_limits.g_force_limits.structural_warning },
        },
        flap_overspeed: { type: Number, default: DEFAULT_VA_SETTINGS.operational_limits.flap_overspeed },
        gear_overspeed: { type: Number, default: DEFAULT_VA_SETTINGS.operational_limits.gear_overspeed },
    },
    
    // Scoring Weights
    scoring_weights: {
        penalty_excessive_g: { type: Number, default: DEFAULT_VA_SETTINGS.scoring_weights.penalty_excessive_g },
        penalty_low_g: { type: Number, default: DEFAULT_VA_SETTINGS.scoring_weights.penalty_low_g },
        penalty_structural_stress: { type: Number, default: DEFAULT_VA_SETTINGS.scoring_weights.penalty_structural_stress },
        penalty_overspeed: { type: Number, default: DEFAULT_VA_SETTINGS.scoring_weights.penalty_overspeed },
        penalty_taxi_overspeed: { type: Number, default: DEFAULT_VA_SETTINGS.scoring_weights.penalty_taxi_overspeed },
        penalty_hard_landing: { type: Number, default: DEFAULT_VA_SETTINGS.scoring_weights.penalty_hard_landing },
        penalty_rough_landing: { type: Number, default: DEFAULT_VA_SETTINGS.scoring_weights.penalty_rough_landing },
        penalty_firm_landing: { type: Number, default: DEFAULT_VA_SETTINGS.scoring_weights.penalty_firm_landing },
        penalty_flap_overspeed: { type: Number, default: DEFAULT_VA_SETTINGS.scoring_weights.penalty_flap_overspeed },
        penalty_gear_overspeed: { type: Number, default: DEFAULT_VA_SETTINGS.scoring_weights.penalty_gear_overspeed },
        landing_excellent: { type: Number, default: DEFAULT_VA_SETTINGS.scoring_weights.landing_excellent },
        landing_good: { type: Number, default: DEFAULT_VA_SETTINGS.scoring_weights.landing_good },
        landing_fair: { type: Number, default: DEFAULT_VA_SETTINGS.scoring_weights.landing_fair },
        landing_firm: { type: Number, default: DEFAULT_VA_SETTINGS.scoring_weights.landing_firm },
        landing_rough: { type: Number, default: DEFAULT_VA_SETTINGS.scoring_weights.landing_rough },
        bonus_butter_landing: { type: Number, default: DEFAULT_VA_SETTINGS.scoring_weights.bonus_butter_landing },
        bonus_perfect_flight: { type: Number, default: DEFAULT_VA_SETTINGS.scoring_weights.bonus_perfect_flight },
    },
    
    // Fuel Constants
    fuel_constants: {
        default_reserve_minutes: { type: Number, default: DEFAULT_VA_SETTINGS.fuel_constants.default_reserve_minutes },
        contingency_percentage: { type: Number, default: DEFAULT_VA_SETTINGS.fuel_constants.contingency_percentage },
        taxi_time_minutes: { type: Number, default: DEFAULT_VA_SETTINGS.fuel_constants.taxi_time_minutes },
        taxi_burn_multiplier: { type: Number, default: DEFAULT_VA_SETTINGS.fuel_constants.taxi_burn_multiplier },
        alternate_reserve_minutes: { type: Number, default: DEFAULT_VA_SETTINGS.fuel_constants.alternate_reserve_minutes },
    },
    
    // ACARS Configuration
    acars_config: {
        telemetry_update_rate: { type: Number, default: DEFAULT_VA_SETTINGS.acars_config.telemetry_update_rate },
        sync_interval: { type: Number, default: DEFAULT_VA_SETTINGS.acars_config.sync_interval },
        enable_smooth_interpolation: { type: Boolean, default: DEFAULT_VA_SETTINGS.acars_config.enable_smooth_interpolation },
        enable_route_deviation_alerts: { type: Boolean, default: DEFAULT_VA_SETTINGS.acars_config.enable_route_deviation_alerts },
        deviation_threshold_nm: { type: Number, default: DEFAULT_VA_SETTINGS.acars_config.deviation_threshold_nm },
        connection_timeout: { type: Number, default: DEFAULT_VA_SETTINGS.acars_config.connection_timeout },
    },
    
    // Flight Operations
    flight_operations: {
        strict_mode: { type: Boolean, default: DEFAULT_VA_SETTINGS.flight_operations.strict_mode },
        simbrief_mandatory: { type: Boolean, default: DEFAULT_VA_SETTINGS.flight_operations.simbrief_mandatory },
        require_flight_plan: { type: Boolean, default: DEFAULT_VA_SETTINGS.flight_operations.require_flight_plan },
        auto_approve_flights: { type: Boolean, default: DEFAULT_VA_SETTINGS.flight_operations.auto_approve_flights },
        max_flight_duration_hours: { type: Number, default: DEFAULT_VA_SETTINGS.flight_operations.max_flight_duration_hours },
        min_flight_duration_minutes: { type: Number, default: DEFAULT_VA_SETTINGS.flight_operations.min_flight_duration_minutes },
        allow_pause: { type: Boolean, default: DEFAULT_VA_SETTINGS.flight_operations.allow_pause },
        require_real_weather: { type: Boolean, default: DEFAULT_VA_SETTINGS.flight_operations.require_real_weather },
    },
    
    // Economics
    economics: {
        pay_rates: {
            type: Map,
            of: Number,
            default: DEFAULT_VA_SETTINGS.economics.pay_rates,
        },
        fuel_cost_multiplier: { type: Number, default: DEFAULT_VA_SETTINGS.economics.fuel_cost_multiplier },
        landing_fee_base: { type: Number, default: DEFAULT_VA_SETTINGS.economics.landing_fee_base },
        landing_fee_per_pax: { type: Number, default: DEFAULT_VA_SETTINGS.economics.landing_fee_per_pax },
        bonus_on_time: { type: Number, default: DEFAULT_VA_SETTINGS.economics.bonus_on_time },
        bonus_fuel_efficient: { type: Number, default: DEFAULT_VA_SETTINGS.economics.bonus_fuel_efficient },
        penalty_crash: { type: Number, default: DEFAULT_VA_SETTINGS.economics.penalty_crash },
        penalty_overspeed_fine: { type: Number, default: DEFAULT_VA_SETTINGS.economics.penalty_overspeed_fine },
    },
    
    // Metadata
    updated_by: { type: String, required: true },
    version: { type: Number, default: 1 },
}, {
    timestamps: true,
    collection: 'va_settings',
});

// Ensure only one settings document exists
VASettingsSchema.index({ _id: 1 }, { unique: true });

// Pre-save hook to increment version
VASettingsSchema.pre('save', function() {
    if (this.isModified() && !this.isNew) {
        this.version += 1;
    }
});

// Static method to get or create settings
VASettingsSchema.statics.getSettings = async function() {
    let settings = await this.findOne();
    
    if (!settings) {
        // Create default settings
        settings = await this.create({
            ...DEFAULT_VA_SETTINGS,
            updated_by: 'system',
        });
    }
    
    return settings;
};

// Static method to update settings
VASettingsSchema.statics.updateSettings = async function(updates: Partial<IVASettings>, updatedBy: string) {
    const settings = await this.getSettings();
    
    Object.assign(settings, updates);
    settings.updated_by = updatedBy;
    
    await settings.save();
    return settings;
};

const VASettingsModel = (mongoose.models.VASettings as IVASettingsModel) || mongoose.model<IVASettingsDocument, IVASettingsModel>('VASettings', VASettingsSchema);

export default VASettingsModel;
