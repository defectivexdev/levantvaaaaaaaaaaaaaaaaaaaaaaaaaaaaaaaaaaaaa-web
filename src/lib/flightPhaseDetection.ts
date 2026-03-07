/**
 * Flight Phase Detection - Finite State Machine
 * High-fidelity phase detection based on telemetry data
 */

import { FlightPhase } from '@/types/flight';
import type { Telemetry } from '@/types/flight';

// ============================================================================
// PHASE DETECTION THRESHOLDS
// ============================================================================

const THRESHOLDS = {
    TAXI_SPEED: 30,              // knots
    TAKEOFF_SPEED: 80,           // knots
    CLIMB_VS_MIN: 300,           // fpm
    CRUISE_VS_RANGE: 200,        // fpm (+/- range)
    DESCENT_VS_MAX: -300,        // fpm
    APPROACH_ALT: 3000,          // feet AGL
    LANDING_SPEED: 60,           // knots
    GROUND_SPEED: 40,            // knots (considered on ground)
    MIN_FLIGHT_ALT: 100,         // feet AGL
};

// ============================================================================
// PHASE TRANSITION CONDITIONS
// ============================================================================

interface PhaseConditions {
    altitude: number;
    groundSpeed: number;
    verticalSpeed: number;
    indicatedAirspeed: number;
    onGround: boolean;
    engineRunning: boolean;
}

export class FlightPhaseFSM {
    private currentPhase: FlightPhase = FlightPhase.PREFLIGHT;
    private previousPhase: FlightPhase = FlightPhase.PREFLIGHT;
    private phaseStartTime: Date = new Date();
    private phaseHistory: Array<{ phase: FlightPhase; timestamp: Date; duration: number }> = [];
    private departureAltitude: number = 0;
    private cruiseAltitude: number = 0;

    constructor(initialPhase: FlightPhase = FlightPhase.PREFLIGHT) {
        this.currentPhase = initialPhase;
        this.phaseStartTime = new Date();
    }

    /**
     * Update phase based on current telemetry
     */
    update(telemetry: Telemetry, conditions: Partial<PhaseConditions> = {}): {
        phase: FlightPhase;
        changed: boolean;
        duration: number;
    } {
        const cond: PhaseConditions = {
            altitude: telemetry.alt,
            groundSpeed: telemetry.groundspeed || 0,
            verticalSpeed: telemetry.v_speed,
            indicatedAirspeed: telemetry.ias || 0,
            onGround: this.isOnGround(telemetry),
            engineRunning: conditions.engineRunning ?? true,
        };

        const newPhase = this.detectPhase(cond);
        const changed = newPhase !== this.currentPhase;

        if (changed) {
            this.transitionTo(newPhase);
        }

        const duration = Date.now() - this.phaseStartTime.getTime();

        return {
            phase: this.currentPhase,
            changed,
            duration: Math.floor(duration / 1000), // seconds
        };
    }

    /**
     * Core FSM logic - determines next phase
     */
    private detectPhase(cond: PhaseConditions): FlightPhase {
        const { altitude, groundSpeed, verticalSpeed, indicatedAirspeed, onGround } = cond;

        switch (this.currentPhase) {
            case FlightPhase.PREFLIGHT:
                // PREFLIGHT -> TAXI_OUT
                if (onGround && groundSpeed > 5 && groundSpeed < THRESHOLDS.TAXI_SPEED) {
                    return FlightPhase.TAXI_OUT;
                }
                break;

            case FlightPhase.TAXI_OUT:
                // TAXI_OUT -> TAKEOFF
                if (groundSpeed > THRESHOLDS.TAKEOFF_SPEED && verticalSpeed > 100) {
                    this.departureAltitude = altitude;
                    return FlightPhase.TAKEOFF;
                }
                // TAXI_OUT -> PREFLIGHT (abort)
                if (groundSpeed < 5) {
                    return FlightPhase.PREFLIGHT;
                }
                break;

            case FlightPhase.TAKEOFF:
                // TAKEOFF -> CLIMB
                if (altitude - this.departureAltitude > THRESHOLDS.MIN_FLIGHT_ALT && 
                    verticalSpeed > THRESHOLDS.CLIMB_VS_MIN) {
                    return FlightPhase.CLIMB;
                }
                break;

            case FlightPhase.CLIMB:
                // CLIMB -> CRUISE
                if (Math.abs(verticalSpeed) < THRESHOLDS.CRUISE_VS_RANGE) {
                    this.cruiseAltitude = altitude;
                    return FlightPhase.CRUISE;
                }
                break;

            case FlightPhase.CRUISE:
                // CRUISE -> DESCENT
                if (verticalSpeed < THRESHOLDS.DESCENT_VS_MAX) {
                    return FlightPhase.DESCENT;
                }
                // CRUISE -> CLIMB (step climb)
                if (verticalSpeed > THRESHOLDS.CLIMB_VS_MIN && altitude > this.cruiseAltitude + 1000) {
                    return FlightPhase.CLIMB;
                }
                break;

            case FlightPhase.DESCENT:
                // DESCENT -> APPROACH
                if (altitude - this.departureAltitude < THRESHOLDS.APPROACH_ALT) {
                    return FlightPhase.APPROACH;
                }
                // DESCENT -> CRUISE (level off)
                if (Math.abs(verticalSpeed) < THRESHOLDS.CRUISE_VS_RANGE) {
                    return FlightPhase.CRUISE;
                }
                break;

            case FlightPhase.APPROACH:
                // APPROACH -> LANDING
                if (altitude - this.departureAltitude < 500 && verticalSpeed < -100) {
                    return FlightPhase.LANDING;
                }
                break;

            case FlightPhase.LANDING:
                // LANDING -> TAXI_IN
                if (onGround && groundSpeed < THRESHOLDS.LANDING_SPEED && groundSpeed > 5) {
                    return FlightPhase.TAXI_IN;
                }
                // LANDING -> ARRIVED
                if (onGround && groundSpeed < 5) {
                    return FlightPhase.ARRIVED;
                }
                break;

            case FlightPhase.TAXI_IN:
                // TAXI_IN -> ARRIVED
                if (groundSpeed < 5) {
                    return FlightPhase.ARRIVED;
                }
                break;

            case FlightPhase.ARRIVED:
                // Terminal state
                break;

            case FlightPhase.CANCELLED:
                // Terminal state
                break;
        }

        return this.currentPhase;
    }

    /**
     * Transition to new phase
     */
    private transitionTo(newPhase: FlightPhase): void {
        const now = new Date();
        const duration = now.getTime() - this.phaseStartTime.getTime();

        // Record phase history
        this.phaseHistory.push({
            phase: this.currentPhase,
            timestamp: this.phaseStartTime,
            duration: Math.floor(duration / 1000),
        });

        this.previousPhase = this.currentPhase;
        this.currentPhase = newPhase;
        this.phaseStartTime = now;

        console.log(`[FSM] Phase transition: ${this.previousPhase} -> ${newPhase}`);
    }

    /**
     * Determine if aircraft is on ground
     */
    private isOnGround(telemetry: Telemetry): boolean {
        const groundSpeed = telemetry.groundspeed || 0;
        const altitude = telemetry.alt;
        const verticalSpeed = telemetry.v_speed;

        // On ground if:
        // - Low altitude AND low vertical speed
        // - OR very low ground speed
        return (
            (altitude < this.departureAltitude + 50 && Math.abs(verticalSpeed) < 50) ||
            groundSpeed < THRESHOLDS.GROUND_SPEED
        );
    }

    /**
     * Get current phase
     */
    getCurrentPhase(): FlightPhase {
        return this.currentPhase;
    }

    /**
     * Get phase history
     */
    getPhaseHistory(): Array<{ phase: FlightPhase; timestamp: Date; duration: number }> {
        return [...this.phaseHistory];
    }

    /**
     * Get time in current phase (seconds)
     */
    getTimeInPhase(): number {
        return Math.floor((Date.now() - this.phaseStartTime.getTime()) / 1000);
    }

    /**
     * Reset FSM
     */
    reset(): void {
        this.currentPhase = FlightPhase.PREFLIGHT;
        this.previousPhase = FlightPhase.PREFLIGHT;
        this.phaseStartTime = new Date();
        this.phaseHistory = [];
        this.departureAltitude = 0;
        this.cruiseAltitude = 0;
    }

    /**
     * Force phase (for testing or manual override)
     */
    forcePhase(phase: FlightPhase): void {
        this.transitionTo(phase);
    }
}

/**
 * Helper function to get phase display name
 */
export function getPhaseDisplayName(phase: FlightPhase): string {
    const names: Record<FlightPhase, string> = {
        [FlightPhase.PREFLIGHT]: 'Pre-Flight',
        [FlightPhase.TAXI_OUT]: 'Taxi Out',
        [FlightPhase.TAKEOFF]: 'Takeoff',
        [FlightPhase.CLIMB]: 'Climb',
        [FlightPhase.CRUISE]: 'Cruise',
        [FlightPhase.DESCENT]: 'Descent',
        [FlightPhase.APPROACH]: 'Approach',
        [FlightPhase.LANDING]: 'Landing',
        [FlightPhase.TAXI_IN]: 'Taxi In',
        [FlightPhase.ARRIVED]: 'Arrived',
        [FlightPhase.CANCELLED]: 'Cancelled',
    };
    return names[phase] || phase;
}

/**
 * Get phase color for UI
 */
export function getPhaseColor(phase: FlightPhase): string {
    const colors: Record<FlightPhase, string> = {
        [FlightPhase.PREFLIGHT]: '#6B7280',
        [FlightPhase.TAXI_OUT]: '#F59E0B',
        [FlightPhase.TAKEOFF]: '#EF4444',
        [FlightPhase.CLIMB]: '#10B981',
        [FlightPhase.CRUISE]: '#3B82F6',
        [FlightPhase.DESCENT]: '#8B5CF6',
        [FlightPhase.APPROACH]: '#EC4899',
        [FlightPhase.LANDING]: '#F97316',
        [FlightPhase.TAXI_IN]: '#F59E0B',
        [FlightPhase.ARRIVED]: '#10B981',
        [FlightPhase.CANCELLED]: '#EF4444',
    };
    return colors[phase] || '#6B7280';
}
