/**
 * Telemetry State Management - Zustand Store
 * Optimized for high-frequency updates without unnecessary re-renders
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Telemetry, FlightPhase } from '@/types/flight';
import type { Violation } from '@/lib/flightScoring';
import type { RouteDeviation } from '@/lib/navigationUtils';

// ============================================================================
// STORE TYPES
// ============================================================================

export interface TelemetryState {
    // Current telemetry
    telemetry: Telemetry | null;
    
    // Flight monitoring
    phase: FlightPhase;
    score: number;
    violations: Violation[];
    
    // Route tracking
    routeDeviation: RouteDeviation | null;
    
    // Autopilot tracking
    autopilotEngaged: boolean;
    autopilotTime: number;
    manualTime: number;
    
    // Performance metrics
    landingRate: number;
    maxGForce: number;
    minGForce: number;
    
    // Flight time
    flightStartTime: number | null;
    totalFlightTime: number;
    
    // Connection status
    isConnected: boolean;
    lastUpdate: number;
}

export interface TelemetryActions {
    // Update telemetry
    updateTelemetry: (telemetry: Telemetry) => void;
    
    // Update flight monitoring
    updatePhase: (phase: FlightPhase) => void;
    updateScore: (score: number) => void;
    addViolation: (violation: Violation) => void;
    
    // Update route tracking
    updateRouteDeviation: (deviation: RouteDeviation) => void;
    
    // Update autopilot
    setAutopilotEngaged: (engaged: boolean) => void;
    updateAutopilotTime: (time: number) => void;
    updateManualTime: (time: number) => void;
    
    // Update performance
    updateLandingRate: (rate: number) => void;
    updateGForce: (gForce: number) => void;
    
    // Flight control
    startFlight: () => void;
    endFlight: () => void;
    resetFlight: () => void;
    
    // Connection
    setConnected: (connected: boolean) => void;
}

export type TelemetryStore = TelemetryState & TelemetryActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: TelemetryState = {
    telemetry: null,
    phase: 'preflight' as FlightPhase,
    score: 100,
    violations: [],
    routeDeviation: null,
    autopilotEngaged: false,
    autopilotTime: 0,
    manualTime: 0,
    landingRate: 0,
    maxGForce: 1.0,
    minGForce: 1.0,
    flightStartTime: null,
    totalFlightTime: 0,
    isConnected: false,
    lastUpdate: 0,
};

// ============================================================================
// STORE CREATION
// ============================================================================

export const useTelemetryStore = create<TelemetryStore>()(
    subscribeWithSelector((set, get) => ({
        ...initialState,

        // Update telemetry
        updateTelemetry: (telemetry: Telemetry) => {
            set({
                telemetry,
                lastUpdate: Date.now(),
                isConnected: true,
            });

            // Auto-update flight time if flight is active
            const state = get();
            if (state.flightStartTime) {
                const totalFlightTime = Math.floor((Date.now() - state.flightStartTime) / 1000);
                set({ totalFlightTime });
            }
        },

        // Update flight monitoring
        updatePhase: (phase: FlightPhase) => {
            set({ phase });
        },

        updateScore: (score: number) => {
            set({ score });
        },

        addViolation: (violation: Violation) => {
            set((state) => ({
                violations: [...state.violations, violation],
            }));
        },

        // Update route tracking
        updateRouteDeviation: (deviation: RouteDeviation) => {
            set({ routeDeviation: deviation });
        },

        // Update autopilot
        setAutopilotEngaged: (engaged: boolean) => {
            set({ autopilotEngaged: engaged });
        },

        updateAutopilotTime: (time: number) => {
            set({ autopilotTime: time });
        },

        updateManualTime: (time: number) => {
            set({ manualTime: time });
        },

        // Update performance
        updateLandingRate: (rate: number) => {
            set({ landingRate: rate });
        },

        updateGForce: (gForce: number) => {
            set((state) => ({
                maxGForce: Math.max(state.maxGForce, gForce),
                minGForce: Math.min(state.minGForce, gForce),
            }));
        },

        // Flight control
        startFlight: () => {
            set({
                flightStartTime: Date.now(),
                totalFlightTime: 0,
                phase: 'preflight' as FlightPhase,
            });
        },

        endFlight: () => {
            set({
                phase: 'arrived' as FlightPhase,
            });
        },

        resetFlight: () => {
            set(initialState);
        },

        // Connection
        setConnected: (connected: boolean) => {
            set({ isConnected: connected });
        },
    }))
);

// ============================================================================
// SELECTORS (for optimized re-renders)
// ============================================================================

export const selectTelemetry = (state: TelemetryStore) => state.telemetry;
export const selectPhase = (state: TelemetryStore) => state.phase;
export const selectScore = (state: TelemetryStore) => state.score;
export const selectViolations = (state: TelemetryStore) => state.violations;
export const selectRouteDeviation = (state: TelemetryStore) => state.routeDeviation;
export const selectAutopilotEngaged = (state: TelemetryStore) => state.autopilotEngaged;
export const selectIsConnected = (state: TelemetryStore) => state.isConnected;

// Computed selectors
export const selectAutopilotPercentage = (state: TelemetryStore) => {
    const total = state.autopilotTime + state.manualTime;
    return total > 0 ? (state.autopilotTime / total) * 100 : 0;
};

export const selectFlightTimeFormatted = (state: TelemetryStore) => {
    const seconds = state.totalFlightTime;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// ============================================================================
// SUBSCRIPTION HELPERS
// ============================================================================

/**
 * Subscribe to telemetry updates
 */
export function subscribeTelemetry(callback: (telemetry: Telemetry | null) => void) {
    return useTelemetryStore.subscribe(
        (state) => state.telemetry,
        callback
    );
}

/**
 * Subscribe to phase changes
 */
export function subscribePhaseChanges(callback: (phase: FlightPhase) => void) {
    return useTelemetryStore.subscribe(
        (state) => state.phase,
        callback
    );
}

/**
 * Subscribe to score updates
 */
export function subscribeScoreUpdates(callback: (score: number) => void) {
    return useTelemetryStore.subscribe(
        (state) => state.score,
        callback
    );
}

/**
 * Subscribe to violations
 */
export function subscribeViolations(callback: (violations: Violation[]) => void) {
    return useTelemetryStore.subscribe(
        (state) => state.violations,
        callback
    );
}
