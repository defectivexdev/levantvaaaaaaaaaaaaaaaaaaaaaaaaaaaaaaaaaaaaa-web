/**
 * Flight Analysis API Endpoint
 * Fetch or generate flight analysis reports
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/database';
import Flight from '@/models/Flight';
import { flightAnalysisService } from '@/services/flightAnalysisService';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ flightId: string }> }
) {
    try {
        const session = await verifyAuth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const { flightId } = await params;

        // Fetch flight data
        const flight = await Flight.findById(flightId);
        if (!flight) {
            return NextResponse.json({ error: 'Flight not found' }, { status: 404 });
        }

        // Check permissions
        const isOwner = flight.pilot_id.toString() === session.id;
        const isAdmin = session.isAdmin || session.role === 'admin';

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Check if analysis already exists
        if (flight.analysis_report) {
            return NextResponse.json({
                success: true,
                report: flight.analysis_report,
                chartData: flight.chart_data,
                cached: true,
            });
        }

        // Generate analysis if telemetry data exists
        if (!flight.telemetry || flight.telemetry.length === 0) {
            return NextResponse.json({
                error: 'No telemetry data available for analysis',
            }, { status: 400 });
        }

        // Convert telemetry to analysis format
        const telemetryData = flight.telemetry.map((t: any) => ({
            timestamp: new Date(t.timestamp).getTime(),
            elapsed_time: t.elapsed_time || 0,
            latitude: t.latitude || t.lat,
            longitude: t.longitude || t.lng,
            altitude: t.altitude || t.alt,
            heading: t.heading || 0,
            indicated_airspeed: t.indicated_airspeed || t.ias || 0,
            ground_speed: t.ground_speed || t.groundspeed || 0,
            vertical_speed: t.vertical_speed || t.v_speed || 0,
            g_force: t.g_force || 1.0,
            pitch: t.pitch || 0,
            bank: t.bank || 0,
            throttle: t.throttle || 0,
            fuel_flow: t.fuel_flow || 0,
            fuel_quantity: t.fuel_quantity || 0,
            phase: t.phase || 'cruise',
            autopilot_master: t.autopilot_master || false,
            autopilot_altitude: t.autopilot_altitude || false,
            autopilot_heading: t.autopilot_heading || false,
            wind_speed: t.wind_speed,
            wind_direction: t.wind_direction,
            outside_temp: t.outside_temp,
        }));

        // Generate analysis report
        const report = await flightAnalysisService.generateReport(
            flightId,
            telemetryData,
            {
                pilot_id: flight.pilot_id.toString(),
                flight_number: flight.flight_number || 'N/A',
                aircraft: flight.aircraft || 'Unknown',
                departure: flight.departure || 'N/A',
                arrival: flight.arrival || 'N/A',
                departure_time: flight.departure_time || new Date(),
                arrival_time: flight.arrival_time || new Date(),
                distance: flight.distance || 0,
                planned_route: flight.route || [],
            },
            flight.violations || []
        );

        // Generate chart data
        const chartData = flightAnalysisService.generateChartData(telemetryData);

        // Save analysis to flight record
        flight.analysis_report = report;
        flight.chart_data = chartData;
        await flight.save();

        return NextResponse.json({
            success: true,
            report,
            chartData,
            cached: false,
        });

    } catch (error: any) {
        console.error('Flight analysis error:', error);
        return NextResponse.json({
            error: 'Failed to generate flight analysis',
            details: error.message,
        }, { status: 500 });
    }
}

// Regenerate analysis (admin only)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ flightId: string }> }
) {
    try {
        const session = await verifyAuth();
        if (!session || (!session.isAdmin && session.role !== 'admin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const { flightId } = await params;

        // Fetch flight data
        const flight = await Flight.findById(flightId);
        if (!flight) {
            return NextResponse.json({ error: 'Flight not found' }, { status: 404 });
        }

        if (!flight.telemetry || flight.telemetry.length === 0) {
            return NextResponse.json({
                error: 'No telemetry data available for analysis',
            }, { status: 400 });
        }

        // Convert telemetry
        const telemetryData = flight.telemetry.map((t: any) => ({
            timestamp: new Date(t.timestamp).getTime(),
            elapsed_time: t.elapsed_time || 0,
            latitude: t.latitude || t.lat,
            longitude: t.longitude || t.lng,
            altitude: t.altitude || t.alt,
            heading: t.heading || 0,
            indicated_airspeed: t.indicated_airspeed || t.ias || 0,
            ground_speed: t.ground_speed || t.groundspeed || 0,
            vertical_speed: t.vertical_speed || t.v_speed || 0,
            g_force: t.g_force || 1.0,
            pitch: t.pitch || 0,
            bank: t.bank || 0,
            throttle: t.throttle || 0,
            fuel_flow: t.fuel_flow || 0,
            fuel_quantity: t.fuel_quantity || 0,
            phase: t.phase || 'cruise',
            autopilot_master: t.autopilot_master || false,
            autopilot_altitude: t.autopilot_altitude || false,
            autopilot_heading: t.autopilot_heading || false,
        }));

        // Regenerate analysis
        const report = await flightAnalysisService.generateReport(
            flightId,
            telemetryData,
            {
                pilot_id: flight.pilot_id.toString(),
                flight_number: flight.flight_number || 'N/A',
                aircraft: flight.aircraft || 'Unknown',
                departure: flight.departure || 'N/A',
                arrival: flight.arrival || 'N/A',
                departure_time: flight.departure_time || new Date(),
                arrival_time: flight.arrival_time || new Date(),
                distance: flight.distance || 0,
                planned_route: flight.route || [],
            },
            flight.violations || []
        );

        const chartData = flightAnalysisService.generateChartData(telemetryData);

        // Update flight record
        flight.analysis_report = report;
        flight.chart_data = chartData;
        await flight.save();

        return NextResponse.json({
            success: true,
            report,
            chartData,
            regenerated: true,
        });

    } catch (error: any) {
        console.error('Flight analysis regeneration error:', error);
        return NextResponse.json({
            error: 'Failed to regenerate flight analysis',
            details: error.message,
        }, { status: 500 });
    }
}
