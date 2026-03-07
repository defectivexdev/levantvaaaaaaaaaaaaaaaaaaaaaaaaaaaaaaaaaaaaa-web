/**
 * Fuel Calculation Service
 * Enterprise-grade fuel planning logic for flight dispatch
 */

import type { FuelPlan, FuelCalculationParams, Aircraft } from '@/types/flight';

// ============================================================================
// CONSTANTS
// ============================================================================

const CONSTANTS = {
    CONTINGENCY_PERCENT: 0.05,      // 5% of trip fuel
    FINAL_RESERVE_MINUTES: 30,      // 30 minutes reserve
    TAXI_TIME_MINUTES: 15,          // Default taxi time
    TAXI_BURN_RATE_MULTIPLIER: 0.3, // 30% of cruise burn rate
    ALTERNATE_RESERVE_MINUTES: 45,  // Time to reach alternate
};

// ============================================================================
// FUEL CALCULATION ENGINE
// ============================================================================

/**
 * Calculate comprehensive fuel plan for a flight
 * Formula: Fuel = (Distance / Groundspeed) * BurnRate + Reserves
 */
export function calculateFuelPlan(params: FuelCalculationParams): FuelPlan {
    const {
        distance,
        cruiseSpeed,
        burnRate,
        alternateDistance = 50, // Default 50 NM to alternate
        taxiTime = CONSTANTS.TAXI_TIME_MINUTES,
    } = params;

    // 1. Trip Fuel (main route)
    const flightTimeHours = distance / cruiseSpeed;
    const tripFuel = flightTimeHours * burnRate;

    // 2. Contingency Fuel (5% of trip fuel)
    const contingency = tripFuel * CONSTANTS.CONTINGENCY_PERCENT;

    // 3. Alternate Fuel (fuel to reach alternate airport)
    const alternateTimeHours = alternateDistance / cruiseSpeed;
    const alternate = alternateTimeHours * burnRate;

    // 4. Final Reserve (30 minutes at cruise)
    const finalReserve = (CONSTANTS.FINAL_RESERVE_MINUTES / 60) * burnRate;

    // 5. Taxi Fuel (ground operations)
    const taxiBurnRate = burnRate * CONSTANTS.TAXI_BURN_RATE_MULTIPLIER;
    const taxi = (taxiTime / 60) * taxiBurnRate;

    // 6. Total Required Fuel
    const totalRequired = tripFuel + contingency + alternate + finalReserve + taxi;

    // 7. Planned Onboard (round up to nearest 50 gallons for safety)
    const plannedOnboard = Math.ceil(totalRequired / 50) * 50;

    // 8. Estimated Landing Fuel
    const estimatedLanding = plannedOnboard - tripFuel - taxi;

    return {
        tripFuel: Math.round(tripFuel),
        contingency: Math.round(contingency),
        alternate: Math.round(alternate),
        finalReserve: Math.round(finalReserve),
        taxi: Math.round(taxi),
        totalRequired: Math.round(totalRequired),
        plannedOnboard: Math.round(plannedOnboard),
        estimatedLanding: Math.round(estimatedLanding),
    };
}

/**
 * Calculate fuel for aircraft type
 */
export function calculateFuelForAircraft(
    aircraft: Aircraft,
    distance: number,
    alternateDistance?: number
): FuelPlan {
    return calculateFuelPlan({
        distance,
        cruiseSpeed: aircraft.cruiseSpeed,
        burnRate: aircraft.burnRate,
        alternateDistance,
    });
}

/**
 * Validate if planned fuel is sufficient
 */
export function validateFuelPlan(fuelPlan: FuelPlan, aircraftCapacity: number): {
    isValid: boolean;
    warnings: string[];
    errors: string[];
} {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check if fuel exceeds aircraft capacity
    if (fuelPlan.plannedOnboard > aircraftCapacity) {
        errors.push(
            `Planned fuel (${fuelPlan.plannedOnboard} gal) exceeds aircraft capacity (${aircraftCapacity} gal)`
        );
    }

    // Check if fuel is below minimum required
    if (fuelPlan.plannedOnboard < fuelPlan.totalRequired) {
        errors.push(
            `Planned fuel (${fuelPlan.plannedOnboard} gal) is below required (${fuelPlan.totalRequired} gal)`
        );
    }

    // Warning if landing fuel is too low
    if (fuelPlan.estimatedLanding < fuelPlan.finalReserve) {
        warnings.push(
            `Estimated landing fuel (${fuelPlan.estimatedLanding} gal) is below final reserve (${fuelPlan.finalReserve} gal)`
        );
    }

    // Warning if using more than 90% of capacity
    const usagePercent = (fuelPlan.plannedOnboard / aircraftCapacity) * 100;
    if (usagePercent > 90) {
        warnings.push(
            `Fuel load is ${usagePercent.toFixed(1)}% of capacity - consider weight limitations`
        );
    }

    return {
        isValid: errors.length === 0,
        warnings,
        errors,
    };
}

/**
 * Calculate fuel burn for a specific flight time
 */
export function calculateFuelBurn(
    flightTimeMinutes: number,
    burnRate: number,
    phase: 'taxi' | 'cruise' | 'descent' = 'cruise'
): number {
    const multipliers = {
        taxi: CONSTANTS.TAXI_BURN_RATE_MULTIPLIER,
        cruise: 1.0,
        descent: 0.7, // Reduced power during descent
    };

    const hours = flightTimeMinutes / 60;
    return hours * burnRate * multipliers[phase];
}

/**
 * Estimate remaining fuel based on flight progress
 */
export function estimateRemainingFuel(
    onboardFuel: number,
    elapsedMinutes: number,
    burnRate: number,
    phase: 'taxi' | 'cruise' | 'descent' = 'cruise'
): number {
    const burned = calculateFuelBurn(elapsedMinutes, burnRate, phase);
    return Math.max(0, onboardFuel - burned);
}

/**
 * Calculate endurance (how long can aircraft fly with current fuel)
 */
export function calculateEndurance(
    currentFuel: number,
    burnRate: number,
    reserveFuel: number = 0
): number {
    const usableFuel = Math.max(0, currentFuel - reserveFuel);
    return (usableFuel / burnRate) * 60; // Return minutes
}

/**
 * Format fuel plan for display
 */
export function formatFuelPlan(fuelPlan: FuelPlan): string {
    return `
FUEL PLAN
─────────────────────────────
Trip Fuel:        ${fuelPlan.tripFuel.toLocaleString()} gal
Contingency:      ${fuelPlan.contingency.toLocaleString()} gal
Alternate:        ${fuelPlan.alternate.toLocaleString()} gal
Final Reserve:    ${fuelPlan.finalReserve.toLocaleString()} gal
Taxi:             ${fuelPlan.taxi.toLocaleString()} gal
─────────────────────────────
Total Required:   ${fuelPlan.totalRequired.toLocaleString()} gal
Planned Onboard:  ${fuelPlan.plannedOnboard.toLocaleString()} gal
Est. Landing:     ${fuelPlan.estimatedLanding.toLocaleString()} gal
    `.trim();
}
