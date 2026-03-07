/**
 * useFlightMonitor Hook
 * High-frequency performance monitoring with phase detection and scoring
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { FlightPhaseFSM } from '@/lib/flightPhaseDetection';
import { FlightScoringEngine, type Violation } from '@/lib/flightScoring';
import { FlightPhase } from '@/types/flight';
import type { Telemetry } from '@/types/flight';

// ============================================================================
// TYPES
// ============================================================================

export interface FlightMonitorState {
    phase: FlightPhase;
    score: number;
    violations: Violation[];
    autopilotEngaged: boolean;
    autopilotTime: number;      // seconds
    manualTime: number;         // seconds
    totalFlightTime: number;    // seconds
    landingRate: number;
    gForceStats: {
        max: number;
        min: number;
        average: number;
    };
}

export interface FlightMonitorOptions {
    flightId: string;
    onPhaseChange?: (phase: FlightPhase, previousPhase: FlightPhase) => void;
    onViolation?: (violation: Violation) => void;
    onScoreUpdate?: (score: number) => void;
    syncInterval?: number;      // Sync to DB every N seconds (default: 30)
    enableLogging?: boolean;
}

export interface AircraftState {
    vmo?: number;
    flapExtended?: boolean;
    gearExtended?: boolean;
    gForce?: number;
    autopilotEngaged?: boolean;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useFlightMonitor(options: FlightMonitorOptions) {
    const {
        flightId,
        onPhaseChange,
        onViolation,
        onScoreUpdate,
        syncInterval = 30,
        enableLogging = true,
    } = options;

    // State
    const [state, setState] = useState<FlightMonitorState>({
        phase: FlightPhase.PREFLIGHT,
        score: 100,
        violations: [],
        autopilotEngaged: false,
        autopilotTime: 0,
        manualTime: 0,
        totalFlightTime: 0,
        landingRate: 0,
        gForceStats: { max: 1.0, min: 1.0, average: 1.0 },
    });

    // Refs for engines (persist across renders)
    const fsmRef = useRef<FlightPhaseFSM>(new FlightPhaseFSM());
    const scoringRef = useRef<FlightScoringEngine>(new FlightScoringEngine());
    const lastSyncRef = useRef<number>(Date.now());
    const flightStartRef = useRef<number>(Date.now());
    const autopilotStartRef = useRef<number | null>(null);
    const manualStartRef = useRef<number | null>(Date.now());

    /**
     * Process telemetry update
     */
    const processTelemetry = useCallback((
        telemetry: Telemetry,
        aircraftState?: AircraftState
    ) => {
        const fsm = fsmRef.current;
        const scoring = scoringRef.current;

        // Update FSM
        const { phase, changed } = fsm.update(telemetry);

        // Update scoring
        scoring.update(telemetry, phase, aircraftState);

        // Track autopilot time
        const now = Date.now();
        const isAutopilotEngaged = aircraftState?.autopilotEngaged ?? false;

        let manualTimeUpdate = 0;
        let autopilotTimeUpdate = 0;

        if (isAutopilotEngaged && !autopilotStartRef.current) {
            // AP just engaged
            autopilotStartRef.current = now;
            if (manualStartRef.current) {
                manualTimeUpdate = (now - manualStartRef.current) / 1000;
                manualStartRef.current = null;
            }
        } else if (!isAutopilotEngaged && !manualStartRef.current) {
            // AP just disengaged
            manualStartRef.current = now;
            if (autopilotStartRef.current) {
                autopilotTimeUpdate = (now - autopilotStartRef.current) / 1000;
                autopilotStartRef.current = null;
            }
        }

        // Calculate total flight time
        const totalFlightTime = Math.floor((now - flightStartRef.current) / 1000);

        // Update state
        const newViolations = scoring.getViolations();
        const newScore = scoring.getScore();
        const gForceStats = scoring.getGForceStats();
        const landingRate = scoring.getLandingRate();

        setState(prev => ({
            ...prev,
            phase,
            score: newScore,
            violations: newViolations,
            autopilotEngaged: isAutopilotEngaged,
            autopilotTime: prev.autopilotTime + autopilotTimeUpdate,
            manualTime: prev.manualTime + manualTimeUpdate,
            totalFlightTime,
            landingRate,
            gForceStats,
        }));

        // Callbacks
        if (changed && onPhaseChange) {
            const previousPhase = fsm.getPhaseHistory().slice(-1)[0]?.phase || FlightPhase.PREFLIGHT;
            onPhaseChange(phase, previousPhase);
        }

        if (newViolations.length > state.violations.length && onViolation) {
            const latestViolation = newViolations[newViolations.length - 1];
            onViolation(latestViolation);
        }

        if (newScore !== state.score && onScoreUpdate) {
            onScoreUpdate(newScore);
        }

        // Sync to database at intervals or on phase change
        const shouldSync = changed || (now - lastSyncRef.current) / 1000 >= syncInterval;
        if (shouldSync) {
            syncToDatabase(flightId, {
                phase,
                score: newScore,
                violations: newViolations,
                autopilotTime: state.autopilotTime,
                manualTime: state.manualTime,
                totalFlightTime,
                landingRate,
                gForceStats,
            });
            lastSyncRef.current = now;
        }

        if (enableLogging && changed) {
            console.log(`[FlightMonitor] Phase: ${phase}, Score: ${newScore}, Violations: ${newViolations.length}`);
        }
    }, [flightId, onPhaseChange, onViolation, onScoreUpdate, syncInterval, enableLogging, state.autopilotTime, state.manualTime]);

    /**
     * Reset monitor
     */
    const reset = useCallback(() => {
        fsmRef.current.reset();
        scoringRef.current.reset();
        flightStartRef.current = Date.now();
        lastSyncRef.current = Date.now();
        autopilotStartRef.current = null;
        manualStartRef.current = Date.now();

        setState({
            phase: FlightPhase.PREFLIGHT,
            score: 100,
            violations: [],
            autopilotEngaged: false,
            autopilotTime: 0,
            manualTime: 0,
            totalFlightTime: 0,
            landingRate: 0,
            gForceStats: { max: 1.0, min: 1.0, average: 1.0 },
        });
    }, []);

    /**
     * Get autopilot percentage
     */
    const getAutopilotPercentage = useCallback((): number => {
        const total = state.autopilotTime + state.manualTime;
        return total > 0 ? (state.autopilotTime / total) * 100 : 0;
    }, [state.autopilotTime, state.manualTime]);

    /**
     * Get phase history
     */
    const getPhaseHistory = useCallback(() => {
        return fsmRef.current.getPhaseHistory();
    }, []);

    /**
     * Get performance summary
     */
    const getSummary = useCallback(() => {
        return scoringRef.current.getSummary();
    }, []);

    /**
     * Force phase (for testing)
     */
    const forcePhase = useCallback((phase: FlightPhase) => {
        fsmRef.current.forcePhase(phase);
        setState(prev => ({ ...prev, phase }));
    }, []);

    return {
        state,
        processTelemetry,
        reset,
        getAutopilotPercentage,
        getPhaseHistory,
        getSummary,
        forcePhase,
    };
}

// ============================================================================
// DATABASE SYNC
// ============================================================================

async function syncToDatabase(
    flightId: string,
    data: {
        phase: FlightPhase;
        score: number;
        violations: Violation[];
        autopilotTime: number;
        manualTime: number;
        totalFlightTime: number;
        landingRate: number;
        gForceStats: any;
    }
): Promise<void> {
    try {
        await fetch(`/api/flights/${flightId}/monitor`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phase: data.phase,
                score: data.score,
                violationCount: data.violations.length,
                violations: data.violations.map(v => ({
                    type: v.type,
                    severity: v.severity,
                    penalty: v.penalty,
                    details: v.details,
                    timestamp: v.timestamp,
                })),
                autopilotTime: data.autopilotTime,
                manualTime: data.manualTime,
                totalFlightTime: data.totalFlightTime,
                landingRate: data.landingRate,
                gForceMax: data.gForceStats.max,
                gForceMin: data.gForceStats.min,
                gForceAvg: data.gForceStats.average,
                lastUpdate: new Date(),
            }),
        });
    } catch (error) {
        console.error('[FlightMonitor] Failed to sync to database:', error);
    }
}

// ============================================================================
// HELPER HOOKS
// ============================================================================

/**
 * Hook for displaying real-time flight stats
 */
export function useFlightStats(monitor: ReturnType<typeof useFlightMonitor>) {
    const { state, getAutopilotPercentage, getSummary } = monitor;

    return {
        phase: state.phase,
        score: state.score,
        grade: getSummary().grade,
        violations: state.violations.length,
        autopilotPercentage: getAutopilotPercentage(),
        landingRate: state.landingRate,
        landingGrade: getSummary().landingGrade,
        flightTime: formatTime(state.totalFlightTime),
        gForceMax: state.gForceStats.max.toFixed(2),
        gForceMin: state.gForceStats.min.toFixed(2),
    };
}

/**
 * Format seconds to HH:MM:SS
 */
function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
