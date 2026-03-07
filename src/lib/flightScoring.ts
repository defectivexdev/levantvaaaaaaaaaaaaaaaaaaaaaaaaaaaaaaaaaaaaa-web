/**
 * Flight Scoring System
 * Deducts points for violations and poor performance
 * Now configurable via VA Settings
 */

import type { Telemetry, FlightPhase } from '@/types/flight';
import type { OperationalLimits, ScoringWeights } from '@/types/settings';
import { DEFAULT_VA_SETTINGS } from '@/types/settings';

// ============================================================================
// VIOLATION TYPES
// ============================================================================

export interface Violation {
    type: ViolationType;
    timestamp: Date;
    severity: 'minor' | 'moderate' | 'severe';
    penalty: number;
    details: string;
    telemetry?: Partial<Telemetry>;
}

export enum ViolationType {
    EXCESSIVE_G_LOAD = 'excessive_g_load',
    LOW_G_LOAD = 'low_g_load',
    OVERSPEED = 'overspeed',
    TAXI_OVERSPEED = 'taxi_overspeed',
    HARD_LANDING = 'hard_landing',
    FLAP_OVERSPEED = 'flap_overspeed',
    GEAR_OVERSPEED = 'gear_overspeed',
    STRUCTURAL_STRESS = 'structural_stress',
}

// ============================================================================
// FLIGHT SCORING ENGINE
// ============================================================================

export class FlightScoringEngine {
    private score: number = 100;
    private violations: Violation[] = [];
    private gForceHistory: number[] = [];
    private maxGForce: number = 1.0;
    private minGForce: number = 1.0;
    private landingRate: number = 0;

    // Dynamic configuration from VA Settings
    private limits: OperationalLimits;
    private weights: ScoringWeights;

    constructor(
        limits?: OperationalLimits,
        weights?: ScoringWeights,
        initialScore: number = 100
    ) {
        this.limits = limits || DEFAULT_VA_SETTINGS.operational_limits;
        this.weights = weights || DEFAULT_VA_SETTINGS.scoring_weights;
        this.score = initialScore;
    }

    /**
     * Update scoring based on current telemetry
     */
    update(telemetry: Telemetry, phase: FlightPhase, aircraftData?: {
        vmo?: number;
        flapExtended?: boolean;
        gearExtended?: boolean;
        gForce?: number;
    }): void {
        const gForce = aircraftData?.gForce || this.estimateGForce(telemetry);
        this.gForceHistory.push(gForce);
        
        // Track extremes
        this.maxGForce = Math.max(this.maxGForce, gForce);
        this.minGForce = Math.min(this.minGForce, gForce);

        // Check G-Force violations
        this.checkGForce(gForce, telemetry);

        // Check speed violations
        this.checkSpeed(telemetry, phase, aircraftData);

        // Check landing
        if (phase === 'landing') {
            this.checkLanding(telemetry);
        }
    }

    /**
     * Check G-Force limits
     */
    private checkGForce(gForce: number, telemetry: Telemetry): void {
        if (gForce > this.limits.g_force_limits.max) {
            this.addViolation({
                type: ViolationType.EXCESSIVE_G_LOAD,
                timestamp: new Date(),
                severity: gForce > this.limits.g_force_limits.structural_warning ? 'severe' : 'moderate',
                penalty: this.weights.penalty_excessive_g,
                details: `Excessive G-load: ${gForce.toFixed(2)}G (max: ${this.limits.g_force_limits.max}G)`,
                telemetry,
            });
        }

        if (gForce < this.limits.g_force_limits.min && gForce > 0) {
            this.addViolation({
                type: ViolationType.LOW_G_LOAD,
                timestamp: new Date(),
                severity: 'minor',
                penalty: this.weights.penalty_low_g,
                details: `Low G-load: ${gForce.toFixed(2)}G (min: ${this.limits.g_force_limits.min}G)`,
                telemetry,
            });
        }

        // Structural stress warning
        if (gForce > this.limits.g_force_limits.structural_warning) {
            this.addViolation({
                type: ViolationType.STRUCTURAL_STRESS,
                timestamp: new Date(),
                severity: 'severe',
                penalty: this.weights.penalty_structural_stress,
                details: `STRUCTURAL STRESS WARNING: ${gForce.toFixed(2)}G - Risk of airframe damage`,
                telemetry,
            });
        }
    }

    /**
     * Check speed violations
     */
    private checkSpeed(
        telemetry: Telemetry,
        phase: FlightPhase,
        aircraftData?: {
            vmo?: number;
            flapExtended?: boolean;
            gearExtended?: boolean;
        }
    ): void {
        const ias = telemetry.ias || telemetry.groundspeed || 0;
        const groundSpeed = telemetry.groundspeed || 0;
        const vmo = aircraftData?.vmo || 350; // Default VMO

        // Taxi overspeed
        if ((phase === 'taxi_out' || phase === 'taxi_in') && groundSpeed > this.limits.max_taxi_speed) {
            this.addViolation({
                type: ViolationType.TAXI_OVERSPEED,
                timestamp: new Date(),
                severity: 'minor',
                penalty: this.weights.penalty_taxi_overspeed,
                details: `Taxi overspeed: ${groundSpeed.toFixed(0)} kts (max: ${this.limits.max_taxi_speed} kts)`,
                telemetry,
            });
        }

        // VMO overspeed (with configurable buffer)
        const overspeedThreshold = vmo + this.limits.overspeed_buffer;
        if (ias > overspeedThreshold) {
            this.addViolation({
                type: ViolationType.OVERSPEED,
                timestamp: new Date(),
                severity: ias > overspeedThreshold + 20 ? 'severe' : 'moderate',
                penalty: this.weights.penalty_overspeed,
                details: `OVERSPEED: ${ias.toFixed(0)} kts (VMO+buffer: ${overspeedThreshold} kts)`,
                telemetry,
            });
        }

        // Flap overspeed
        if (aircraftData?.flapExtended && ias > this.limits.flap_overspeed) {
            this.addViolation({
                type: ViolationType.FLAP_OVERSPEED,
                timestamp: new Date(),
                severity: 'moderate',
                penalty: this.weights.penalty_flap_overspeed,
                details: `Flap overspeed: ${ias.toFixed(0)} kts (max: ${this.limits.flap_overspeed} kts)`,
                telemetry,
            });
        }

        // Gear overspeed
        if (aircraftData?.gearExtended && ias > this.limits.gear_overspeed) {
            this.addViolation({
                type: ViolationType.GEAR_OVERSPEED,
                timestamp: new Date(),
                severity: 'moderate',
                penalty: this.weights.penalty_gear_overspeed,
                details: `Gear overspeed: ${ias.toFixed(0)} kts (max: ${this.limits.gear_overspeed} kts)`,
                telemetry,
            });
        }
    }

    /**
     * Check landing performance
     */
    private checkLanding(telemetry: Telemetry): void {
        const vSpeed = telemetry.v_speed;
        
        // Only record on touchdown (transition from negative to positive/zero)
        if (vSpeed < -100 && this.landingRate === 0) {
            this.landingRate = vSpeed;
            const absVSpeed = Math.abs(vSpeed);

            // Hard landing (exceeds max landing FPM)
            if (absVSpeed > this.limits.max_landing_fpm) {
                this.addViolation({
                    type: ViolationType.HARD_LANDING,
                    timestamp: new Date(),
                    severity: 'severe',
                    penalty: this.weights.penalty_hard_landing,
                    details: `HARD LANDING: ${absVSpeed.toFixed(0)} fpm (max: ${this.limits.max_landing_fpm} fpm)`,
                    telemetry,
                });
            }
            // Rough landing
            else if (absVSpeed > this.weights.landing_rough) {
                this.addViolation({
                    type: ViolationType.HARD_LANDING,
                    timestamp: new Date(),
                    severity: 'moderate',
                    penalty: this.weights.penalty_rough_landing,
                    details: `Rough landing: ${absVSpeed.toFixed(0)} fpm`,
                    telemetry,
                });
            }
            // Firm landing
            else if (absVSpeed > this.weights.landing_firm) {
                this.addViolation({
                    type: ViolationType.HARD_LANDING,
                    timestamp: new Date(),
                    severity: 'minor',
                    penalty: this.weights.penalty_firm_landing,
                    details: `Firm landing: ${absVSpeed.toFixed(0)} fpm`,
                    telemetry,
                });
            }
            // Butter landing bonus
            else if (absVSpeed < this.weights.landing_excellent) {
                this.score += this.weights.bonus_butter_landing;
                console.log(`[SCORING] BUTTER LANDING! +${this.weights.bonus_butter_landing} points`);
            }
        }
    }

    /**
     * Add violation and deduct points
     */
    private addViolation(violation: Violation): void {
        this.violations.push(violation);
        this.score = Math.max(0, this.score - violation.penalty);
        
        console.warn(`[SCORING] ${violation.details} (-${violation.penalty} points, Score: ${this.score})`);
    }

    /**
     * Estimate G-force from vertical speed change
     */
    private estimateGForce(telemetry: Telemetry): number {
        // Simple estimation: G = 1 + (ΔV / (g * Δt))
        // For now, return 1.0 as baseline
        // In production, calculate from actual acceleration data
        return 1.0;
    }

    /**
     * Get current score
     */
    getScore(): number {
        return Math.round(this.score);
    }

    /**
     * Get all violations
     */
    getViolations(): Violation[] {
        return [...this.violations];
    }

    /**
     * Get violations by severity
     */
    getViolationsBySeverity(severity: 'minor' | 'moderate' | 'severe'): Violation[] {
        return this.violations.filter(v => v.severity === severity);
    }

    /**
     * Get G-force statistics
     */
    getGForceStats(): {
        max: number;
        min: number;
        average: number;
    } {
        const avg = this.gForceHistory.length > 0
            ? this.gForceHistory.reduce((a, b) => a + b, 0) / this.gForceHistory.length
            : 1.0;

        return {
            max: this.maxGForce,
            min: this.minGForce,
            average: avg,
        };
    }

    /**
     * Get landing rate
     */
    getLandingRate(): number {
        return this.landingRate;
    }

    /**
     * Get landing grade
     */
    getLandingGrade(): 'Excellent' | 'Good' | 'Fair' | 'Firm' | 'Rough' | 'Hard' | 'N/A' {
        if (this.landingRate === 0) return 'N/A';
        
        const rate = Math.abs(this.landingRate);
        if (rate < this.weights.landing_excellent) return 'Excellent';
        if (rate < this.weights.landing_good) return 'Good';
        if (rate < this.weights.landing_fair) return 'Fair';
        if (rate < this.weights.landing_firm) return 'Firm';
        if (rate < this.weights.landing_rough) return 'Rough';
        return 'Hard';
    }

    /**
     * Get performance summary
     */
    getSummary(): {
        score: number;
        grade: string;
        violations: number;
        landingRate: number;
        landingGrade: string;
        gForceStats: ReturnType<FlightScoringEngine['getGForceStats']>;
    } {
        return {
            score: this.getScore(),
            grade: this.getGrade(),
            violations: this.violations.length,
            landingRate: this.landingRate,
            landingGrade: this.getLandingGrade(),
            gForceStats: this.getGForceStats(),
        };
    }

    /**
     * Get overall grade
     */
    private getGrade(): string {
        const score = this.score;
        if (score >= 95) return 'A+';
        if (score >= 90) return 'A';
        if (score >= 85) return 'A-';
        if (score >= 80) return 'B+';
        if (score >= 75) return 'B';
        if (score >= 70) return 'B-';
        if (score >= 65) return 'C+';
        if (score >= 60) return 'C';
        if (score >= 55) return 'C-';
        if (score >= 50) return 'D';
        return 'F';
    }

    /**
     * Reset scoring
     */
    reset(): void {
        this.score = 100;
        this.violations = [];
        this.gForceHistory = [];
        this.maxGForce = 1.0;
        this.minGForce = 1.0;
        this.landingRate = 0;
    }
}
