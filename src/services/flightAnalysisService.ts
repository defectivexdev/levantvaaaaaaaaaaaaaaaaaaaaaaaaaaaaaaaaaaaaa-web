/**
 * Flight Analysis Service
 * Comprehensive post-flight analysis with telemetry processing
 */

import type {
    TelemetryDataPoint,
    FlightAnalysisReport,
    LandingAnalysis,
    FuelEfficiencyAnalysis,
    FlightPathAnalysis,
    PhaseAnalysis,
    ViolationAnalysis,
    PerformanceMetrics,
    FlightChartData,
} from '@/types/flightAnalysis';
import type { FlightPhase } from '@/types/flight';
import {
    getLandingGrade,
    getFlightGrade,
    getFuelEfficiencyGrade,
    calculateRouteEfficiency,
} from '@/types/flightAnalysis';

// ============================================================================
// FLIGHT ANALYSIS SERVICE
// ============================================================================

export class FlightAnalysisService {
    /**
     * Generate complete flight analysis report
     */
    async generateReport(
        flightId: string,
        telemetry: TelemetryDataPoint[],
        flightData: {
            pilot_id: string;
            flight_number: string;
            aircraft: string;
            departure: string;
            arrival: string;
            departure_time: Date;
            arrival_time: Date;
            distance: number;
            planned_route?: { latitude: number; longitude: number; name?: string }[];
        },
        violations: any[]
    ): Promise<FlightAnalysisReport> {
        // Analyze each component
        const landing = this.analyzeLanding(telemetry);
        const fuelEfficiency = this.analyzeFuelEfficiency(telemetry, flightData.distance, flightData.aircraft);
        const flightPath = this.analyzeFlightPath(telemetry, flightData.planned_route || []);
        const phaseBreakdown = this.analyzePhases(telemetry);
        const violationAnalysis = this.analyzeViolations(violations, telemetry);
        const performance = this.calculatePerformance(
            landing,
            fuelEfficiency,
            flightPath,
            phaseBreakdown,
            violationAnalysis
        );

        // Generate recommendations
        const { strengths, areas_for_improvement, next_flight_tips } = this.generateRecommendations(
            performance,
            landing,
            fuelEfficiency,
            flightPath,
            violationAnalysis
        );

        return {
            flight_id: flightId,
            pilot_id: flightData.pilot_id,
            flight_number: flightData.flight_number,
            aircraft: flightData.aircraft,
            departure: flightData.departure,
            arrival: flightData.arrival,
            departure_time: flightData.departure_time,
            arrival_time: flightData.arrival_time,
            flight_duration: (flightData.arrival_time.getTime() - flightData.departure_time.getTime()) / 1000,
            distance: flightData.distance,
            performance,
            landing,
            fuel_efficiency: fuelEfficiency,
            flight_path: flightPath,
            phase_breakdown: phaseBreakdown,
            violations: violationAnalysis,
            telemetry_summary: {
                total_data_points: telemetry.length,
                sampling_rate: this.calculateSamplingRate(telemetry),
                data_quality: this.assessDataQuality(telemetry),
            },
            strengths,
            areas_for_improvement,
            next_flight_tips,
            generated_at: new Date(),
        };
    }

    /**
     * Analyze landing performance
     */
    private analyzeLanding(telemetry: TelemetryDataPoint[]): LandingAnalysis {
        // Find touchdown point (when vertical speed crosses threshold and altitude is low)
        const touchdownIndex = this.findTouchdownPoint(telemetry);
        const touchdown = telemetry[touchdownIndex];

        // Get final approach data (last 3 minutes)
        const approachStartIndex = Math.max(0, touchdownIndex - 180);
        const finalApproach = telemetry.slice(approachStartIndex, touchdownIndex);

        // Calculate approach metrics
        const approachSpeeds = finalApproach.map(t => t.indicated_airspeed);
        const approachSpeedAvg = this.average(approachSpeeds);
        const targetApproachSpeed = 140; // knots, should be aircraft-specific
        const approachSpeedDeviation = Math.abs(approachSpeedAvg - targetApproachSpeed);

        // Calculate landing grade
        const landingGrade = getLandingGrade(touchdown.vertical_speed);

        // Calculate component scores
        const rateScore = this.calculateLandingRateScore(touchdown.vertical_speed);
        const speedScore = this.calculateSpeedScore(touchdown.indicated_airspeed, 130);
        const alignmentScore = this.calculateAlignmentScore(touchdown.bank, touchdown.heading);
        const smoothnessScore = this.calculateSmoothnessScore(finalApproach);

        const landingScore = (rateScore + speedScore + alignmentScore + smoothnessScore) / 4;

        return {
            touchdown_rate: touchdown.vertical_speed,
            touchdown_speed: touchdown.indicated_airspeed,
            touchdown_g_force: touchdown.g_force,
            touchdown_pitch: touchdown.pitch,
            touchdown_bank: touchdown.bank,
            approach_speed_avg: approachSpeedAvg,
            approach_speed_deviation: approachSpeedDeviation,
            glideslope_deviation_avg: 0, // Would need ILS data
            centerline_deviation_avg: 0, // Would need runway data
            landing_grade: landingGrade.label as any,
            landing_score: landingScore,
            rate_score: rateScore,
            speed_score: speedScore,
            alignment_score: alignmentScore,
            smoothness_score: smoothnessScore,
            final_approach_data: finalApproach,
            touchdown_data: touchdown,
        };
    }

    /**
     * Analyze fuel efficiency
     */
    private analyzeFuelEfficiency(
        telemetry: TelemetryDataPoint[],
        distance: number,
        aircraft: string
    ): FuelEfficiencyAnalysis {
        const startFuel = telemetry[0]?.fuel_quantity || 0;
        const endFuel = telemetry[telemetry.length - 1]?.fuel_quantity || 0;
        const totalFuelUsed = startFuel - endFuel;

        const duration = telemetry[telemetry.length - 1].elapsed_time / 3600; // hours
        const fuelPerNM = totalFuelUsed / distance;
        const fuelPerHour = totalFuelUsed / duration;

        // Expected fuel burn (simplified, should be aircraft-specific)
        const expectedFuelBurn = distance * 2.5; // 2.5 gal/nm baseline
        const fuelSavings = expectedFuelBurn - totalFuelUsed;
        const fuelSavingsPercentage = (fuelSavings / expectedFuelBurn) * 100;

        const efficiencyGrade = getFuelEfficiencyGrade(totalFuelUsed, expectedFuelBurn);
        const efficiencyScore = this.calculateFuelEfficiencyScore(totalFuelUsed, expectedFuelBurn);

        // Phase breakdown
        const phaseBreakdown = this.calculateFuelByPhase(telemetry);

        // Recommendations
        const recommendations = this.generateFuelRecommendations(
            efficiencyGrade,
            fuelSavingsPercentage,
            phaseBreakdown
        );

        // Fuel flow data for chart
        const fuelFlowData = telemetry
            .filter((_, i) => i % 10 === 0) // Sample every 10th point
            .map(t => ({
                timestamp: t.elapsed_time,
                fuel_flow: t.fuel_flow,
                fuel_remaining: t.fuel_quantity,
                altitude: t.altitude,
            }));

        return {
            total_fuel_used: totalFuelUsed,
            fuel_per_nm: fuelPerNM,
            fuel_per_hour: fuelPerHour,
            efficiency_score: efficiencyScore,
            efficiency_grade: efficiencyGrade,
            expected_fuel_burn: expectedFuelBurn,
            fuel_savings: fuelSavings,
            fuel_savings_percentage: fuelSavingsPercentage,
            phase_breakdown: phaseBreakdown,
            recommendations,
            fuel_flow_data: fuelFlowData,
        };
    }

    /**
     * Analyze flight path
     */
    private analyzeFlightPath(
        telemetry: TelemetryDataPoint[],
        plannedRoute: { latitude: number; longitude: number; name?: string }[]
    ): FlightPathAnalysis {
        // Calculate actual path
        const actualPath = telemetry.map(t => ({
            latitude: t.latitude,
            longitude: t.longitude,
            timestamp: t.elapsed_time,
            altitude: t.altitude,
        }));

        // Calculate distances
        const actualDistance = this.calculatePathDistance(actualPath);
        const directDistance = plannedRoute.length > 1
            ? this.calculateDistance(
                plannedRoute[0].latitude,
                plannedRoute[0].longitude,
                plannedRoute[plannedRoute.length - 1].latitude,
                plannedRoute[plannedRoute.length - 1].longitude
            )
            : actualDistance;

        const plannedDistance = this.calculatePathDistance(plannedRoute);
        const distanceDeviation = actualDistance - plannedDistance;
        const routeEfficiency = calculateRouteEfficiency(actualDistance, directDistance);

        // Calculate cross-track errors
        const deviationPoints = this.calculateCrossTrackErrors(actualPath, plannedRoute);
        const maxCrossTrackError = Math.max(...deviationPoints.map(d => d.deviation));
        const avgCrossTrackError = this.average(deviationPoints.map(d => d.deviation));

        return {
            planned_distance: plannedDistance,
            actual_distance: actualDistance,
            distance_deviation: distanceDeviation,
            route_efficiency: routeEfficiency,
            direct_distance: directDistance,
            max_cross_track_error: maxCrossTrackError,
            avg_cross_track_error: avgCrossTrackError,
            total_deviations: deviationPoints.filter(d => d.deviation > 5).length,
            waypoints_hit: 0, // Would need waypoint proximity detection
            waypoints_total: plannedRoute.length,
            waypoint_accuracy: 0,
            planned_route: plannedRoute,
            actual_path: actualPath,
            deviation_points: deviationPoints,
        };
    }

    /**
     * Analyze flight phases
     */
    private analyzePhases(telemetry: TelemetryDataPoint[]): PhaseAnalysis[] {
        const phases: PhaseAnalysis[] = [];
        let currentPhase: FlightPhase | null = null;
        let phaseStart = 0;

        telemetry.forEach((point, index) => {
            if (point.phase !== currentPhase) {
                // Phase changed
                if (currentPhase !== null) {
                    const phaseData = telemetry.slice(phaseStart, index);
                    phases.push(this.analyzePhase(currentPhase, phaseData, phaseStart, index - 1));
                }
                currentPhase = point.phase;
                phaseStart = index;
            }
        });

        // Add final phase
        if (currentPhase !== null) {
            const phaseData = telemetry.slice(phaseStart);
            phases.push(this.analyzePhase(currentPhase, phaseData, phaseStart, telemetry.length - 1));
        }

        return phases;
    }

    /**
     * Analyze single phase
     */
    private analyzePhase(
        phase: FlightPhase,
        data: TelemetryDataPoint[],
        startIndex: number,
        endIndex: number
    ): PhaseAnalysis {
        const startTime = data[0].elapsed_time;
        const endTime = data[data.length - 1].elapsed_time;
        const duration = endTime - startTime;

        const altitudes = data.map(d => d.altitude);
        const speeds = data.map(d => d.indicated_airspeed);
        const gForces = data.map(d => d.g_force);

        const startFuel = data[0].fuel_quantity;
        const endFuel = data[data.length - 1].fuel_quantity;
        const fuelUsed = startFuel - endFuel;

        const autopilotActive = data.filter(d => d.autopilot_master).length;
        const autopilotPercentage = (autopilotActive / data.length) * 100;

        return {
            phase,
            start_time: startTime,
            end_time: endTime,
            duration,
            avg_altitude: this.average(altitudes),
            max_altitude: Math.max(...altitudes),
            avg_speed: this.average(speeds),
            max_speed: Math.max(...speeds),
            avg_g_force: this.average(gForces),
            max_g_force: Math.max(...gForces),
            violations: 0, // Would need violation data
            fuel_used: fuelUsed,
            avg_fuel_flow: this.average(data.map(d => d.fuel_flow)),
            autopilot_percentage: autopilotPercentage,
            phase_score: this.calculatePhaseScore(phase, data),
        };
    }

    /**
     * Analyze violations
     */
    private analyzeViolations(violations: any[], telemetry: TelemetryDataPoint[]): ViolationAnalysis {
        const violationsByType = new Map<string, { count: number; severity: string; penalty: number }>();

        violations.forEach(v => {
            const existing = violationsByType.get(v.type) || { count: 0, severity: v.severity, penalty: 0 };
            existing.count++;
            existing.penalty += v.penalty || 0;
            violationsByType.set(v.type, existing);
        });

        const violationsTimeline = violations.map(v => ({
            timestamp: v.timestamp,
            type: v.type,
            severity: v.severity,
            description: v.description,
            phase: v.phase,
            telemetry: telemetry.find(t => Math.abs(t.elapsed_time - v.timestamp) < 1) || telemetry[0],
        }));

        return {
            total_violations: violations.length,
            violations_by_type: Array.from(violationsByType.entries()).map(([type, data]) => ({
                type,
                count: data.count,
                severity: data.severity as any,
                penalty: data.penalty,
            })),
            violations_timeline: violationsTimeline,
            total_penalty: violations.reduce((sum, v) => sum + (v.penalty || 0), 0),
        };
    }

    /**
     * Calculate overall performance metrics
     */
    private calculatePerformance(
        landing: LandingAnalysis,
        fuel: FuelEfficiencyAnalysis,
        path: FlightPathAnalysis,
        phases: PhaseAnalysis[],
        violations: ViolationAnalysis
    ): PerformanceMetrics {
        const landingScore = landing.landing_score;
        const fuelEfficiencyScore = fuel.efficiency_score;
        const routeAdherenceScore = Math.max(0, 100 - path.avg_cross_track_error);
        const smoothnessScore = landing.smoothness_score;
        const autopilotUsageScore = this.calculateAutopilotScore(phases);

        // Weighted average
        const flightScore = Math.max(
            0,
            landingScore * 0.3 +
            fuelEfficiencyScore * 0.2 +
            routeAdherenceScore * 0.2 +
            smoothnessScore * 0.15 +
            autopilotUsageScore * 0.15 -
            violations.total_penalty
        );

        const flightGrade = getFlightGrade(flightScore);

        const allGForces = phases.flatMap(p => [p.avg_g_force, p.max_g_force]);
        const avgGForce = this.average(allGForces);
        const maxGForce = Math.max(...allGForces);

        return {
            flight_score: flightScore,
            flight_grade: flightGrade,
            landing_score: landingScore,
            fuel_efficiency_score: fuelEfficiencyScore,
            route_adherence_score: routeAdherenceScore,
            smoothness_score: smoothnessScore,
            autopilot_usage_score: autopilotUsageScore,
            avg_g_force: avgGForce,
            max_g_force: maxGForce,
            avg_vertical_speed: 0, // Would calculate from telemetry
            max_vertical_speed: 0,
            percentile_rank: 0, // Would need database comparison
            better_than_percentage: 0,
        };
    }

    /**
     * Generate chart data for visualization
     */
    generateChartData(telemetry: TelemetryDataPoint[]): FlightChartData {
        // Downsample for performance
        const sampledData = telemetry.filter((_, i) => i % 5 === 0);

        const time = sampledData.map(t => t.elapsed_time);
        const altitude = sampledData.map(t => t.altitude);
        const ias = sampledData.map(t => t.indicated_airspeed);
        const gs = sampledData.map(t => t.ground_speed);
        const vs = sampledData.map(t => t.vertical_speed);
        const gforce = sampledData.map(t => t.g_force);
        const fuelQty = sampledData.map(t => t.fuel_quantity);
        const fuelFlow = sampledData.map(t => t.fuel_flow);

        // Detect phase changes
        const phases: { phase: FlightPhase; start: number; end: number }[] = [];
        let currentPhase = sampledData[0]?.phase;
        let phaseStart = 0;

        sampledData.forEach((point, index) => {
            if (point.phase !== currentPhase) {
                phases.push({ phase: currentPhase, start: phaseStart, end: time[index - 1] });
                currentPhase = point.phase;
                phaseStart = time[index];
            }
        });
        if (currentPhase) {
            phases.push({ phase: currentPhase, start: phaseStart, end: time[time.length - 1] });
        }

        return {
            altitude_chart: { time, altitude, phases },
            speed_chart: { time, indicated_airspeed: ias, ground_speed: gs },
            vertical_speed_chart: { time, vertical_speed: vs },
            g_force_chart: { time, g_force: gforce, limit_upper: 2.5, limit_lower: -1.0 },
            fuel_chart: { time, fuel_quantity: fuelQty, fuel_flow: fuelFlow },
            landing_approach_chart: {
                distance: [],
                altitude: [],
                glideslope: [],
            },
        };
    }

    // ========================================================================
    // HELPER METHODS
    // ========================================================================

    private findTouchdownPoint(telemetry: TelemetryDataPoint[]): number {
        // Find point where vertical speed is negative and altitude is low
        for (let i = telemetry.length - 1; i >= 0; i--) {
            if (telemetry[i].altitude < 100 && telemetry[i].vertical_speed < -50) {
                return i;
            }
        }
        return telemetry.length - 1;
    }

    private calculateLandingRateScore(rate: number): number {
        const absRate = Math.abs(rate);
        if (absRate <= 50) return 100;
        if (absRate <= 100) return 95;
        if (absRate <= 200) return 85;
        if (absRate <= 400) return 70;
        if (absRate <= 600) return 50;
        return 0;
    }

    private calculateSpeedScore(actual: number, target: number): number {
        const deviation = Math.abs(actual - target);
        return Math.max(0, 100 - deviation);
    }

    private calculateAlignmentScore(bank: number, heading: number): number {
        const bankPenalty = Math.abs(bank) * 2;
        return Math.max(0, 100 - bankPenalty);
    }

    private calculateSmoothnessScore(approach: TelemetryDataPoint[]): number {
        const gForceVariations = approach.map((t, i) => {
            if (i === 0) return 0;
            return Math.abs(t.g_force - approach[i - 1].g_force);
        });
        const avgVariation = this.average(gForceVariations);
        return Math.max(0, 100 - avgVariation * 100);
    }

    private calculateFuelEfficiencyScore(actual: number, expected: number): number {
        const efficiency = (expected / actual) * 100;
        if (efficiency >= 110) return 100;
        if (efficiency >= 100) return 90;
        if (efficiency >= 90) return 75;
        return Math.max(0, 50 - (100 - efficiency));
    }

    private calculateFuelByPhase(telemetry: TelemetryDataPoint[]): {
        phase: FlightPhase;
        fuel_used: number;
        duration: number;
        percentage: number;
    }[] {
        const phases = this.analyzePhases(telemetry);
        const totalFuel = phases.reduce((sum, p) => sum + p.fuel_used, 0);

        return phases.map(p => ({
            phase: p.phase,
            fuel_used: p.fuel_used,
            duration: p.duration,
            percentage: (p.fuel_used / totalFuel) * 100,
        }));
    }

    private generateFuelRecommendations(
        grade: string,
        savingsPercentage: number,
        phaseBreakdown: any[]
    ): string[] {
        const recommendations: string[] = [];

        if (grade === 'Poor') {
            recommendations.push('Consider optimizing cruise altitude for better fuel efficiency');
            recommendations.push('Review throttle management during climb and descent');
        }

        if (savingsPercentage < -10) {
            recommendations.push('Fuel consumption was higher than expected - review flight planning');
        }

        const climbPhase = phaseBreakdown.find(p => p.phase === 'CLIMB');
        if (climbPhase && climbPhase.percentage > 30) {
            recommendations.push('Climb phase consumed significant fuel - consider shallower climb rate');
        }

        return recommendations;
    }

    private calculatePhaseScore(phase: FlightPhase, data: TelemetryDataPoint[]): number {
        // Simplified phase scoring
        const gForces = data.map(d => d.g_force);
        const maxG = Math.max(...gForces);
        const minG = Math.min(...gForces);

        let score = 100;
        if (maxG > 2.5) score -= (maxG - 2.5) * 10;
        if (minG < -1.0) score -= Math.abs(minG + 1.0) * 10;

        return Math.max(0, score);
    }

    private calculateAutopilotScore(phases: PhaseAnalysis[]): number {
        const cruisePhase = phases.find(p => p.phase === 'cruise');
        if (!cruisePhase) return 100;

        // Ideal autopilot usage in cruise: 80-100%
        const usage = cruisePhase.autopilot_percentage;
        if (usage >= 80) return 100;
        if (usage >= 60) return 90;
        if (usage >= 40) return 75;
        return 50;
    }

    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 3440.065; // Earth radius in nautical miles
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) *
            Math.cos(this.toRadians(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private calculatePathDistance(path: { latitude: number; longitude: number }[]): number {
        let total = 0;
        for (let i = 1; i < path.length; i++) {
            total += this.calculateDistance(
                path[i - 1].latitude,
                path[i - 1].longitude,
                path[i].latitude,
                path[i].longitude
            );
        }
        return total;
    }

    private calculateCrossTrackErrors(
        actualPath: { latitude: number; longitude: number; timestamp: number }[],
        plannedRoute: { latitude: number; longitude: number }[]
    ): { latitude: number; longitude: number; deviation: number; timestamp: number }[] {
        if (plannedRoute.length < 2) return [];

        return actualPath.map(point => {
            // Find nearest segment
            let minDeviation = Infinity;
            for (let i = 1; i < plannedRoute.length; i++) {
                const deviation = this.pointToLineDistance(
                    point,
                    plannedRoute[i - 1],
                    plannedRoute[i]
                );
                minDeviation = Math.min(minDeviation, deviation);
            }

            return {
                latitude: point.latitude,
                longitude: point.longitude,
                deviation: minDeviation,
                timestamp: point.timestamp,
            };
        });
    }

    private pointToLineDistance(
        point: { latitude: number; longitude: number },
        lineStart: { latitude: number; longitude: number },
        lineEnd: { latitude: number; longitude: number }
    ): number {
        // Simplified cross-track distance calculation
        const d1 = this.calculateDistance(point.latitude, point.longitude, lineStart.latitude, lineStart.longitude);
        const d2 = this.calculateDistance(point.latitude, point.longitude, lineEnd.latitude, lineEnd.longitude);
        const d3 = this.calculateDistance(lineStart.latitude, lineStart.longitude, lineEnd.latitude, lineEnd.longitude);

        // Use Heron's formula for cross-track error
        const s = (d1 + d2 + d3) / 2;
        const area = Math.sqrt(s * (s - d1) * (s - d2) * (s - d3));
        return (2 * area) / d3;
    }

    private calculateSamplingRate(telemetry: TelemetryDataPoint[]): number {
        if (telemetry.length < 2) return 0;
        const totalTime = telemetry[telemetry.length - 1].elapsed_time - telemetry[0].elapsed_time;
        return telemetry.length / totalTime;
    }

    private assessDataQuality(telemetry: TelemetryDataPoint[]): number {
        // Simple quality assessment based on data completeness
        let quality = 100;
        const missingData = telemetry.filter(t => !t.latitude || !t.longitude || !t.altitude).length;
        quality -= (missingData / telemetry.length) * 100;
        return Math.max(0, quality);
    }

    private generateRecommendations(
        performance: PerformanceMetrics,
        landing: LandingAnalysis,
        fuel: FuelEfficiencyAnalysis,
        path: FlightPathAnalysis,
        violations: ViolationAnalysis
    ): { strengths: string[]; areas_for_improvement: string[]; next_flight_tips: string[] } {
        const strengths: string[] = [];
        const areas_for_improvement: string[] = [];
        const next_flight_tips: string[] = [];

        // Strengths
        if (landing.landing_score >= 90) strengths.push('Excellent landing technique');
        if (fuel.efficiency_score >= 90) strengths.push('Outstanding fuel efficiency');
        if (path.route_efficiency >= 95) strengths.push('Precise route adherence');
        if (violations.total_violations === 0) strengths.push('Clean flight with no violations');

        // Areas for improvement
        if (landing.landing_score < 70) areas_for_improvement.push('Landing technique needs practice');
        if (fuel.efficiency_score < 70) areas_for_improvement.push('Fuel management could be optimized');
        if (path.avg_cross_track_error > 5) areas_for_improvement.push('Route navigation accuracy');
        if (violations.total_violations > 5) areas_for_improvement.push('Reduce flight violations');

        // Tips
        next_flight_tips.push('Review the telemetry graphs to identify improvement areas');
        if (landing.landing_score < 90) next_flight_tips.push('Practice stabilized approaches at target speed');
        if (fuel.efficiency_score < 90) next_flight_tips.push('Optimize cruise altitude and throttle settings');

        return { strengths, areas_for_improvement, next_flight_tips };
    }

    private average(numbers: number[]): number {
        if (numbers.length === 0) return 0;
        return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    }

    private toRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }
}

// Export singleton instance
export const flightAnalysisService = new FlightAnalysisService();
