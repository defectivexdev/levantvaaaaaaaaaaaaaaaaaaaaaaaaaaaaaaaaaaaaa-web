import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Fleet from '@/models/Fleet';
import { getConfig, corsHeaders } from '@/lib/acars/helpers';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const { registration } = await request.json();

        if (!registration) {
            return NextResponse.json({ health: 100, status: 'Available', grounded: false }, { headers: corsHeaders() });
        }

        const aircraft = await Fleet.findOne({ registration });
        if (!aircraft) {
            return NextResponse.json({ health: 100, status: 'Available', grounded: false }, { headers: corsHeaders() });
        }

        const config = await getConfig();
        const groundedThreshold = config.grounded_health_threshold;
        const isGrounded = aircraft.condition < groundedThreshold;

        if (isGrounded && aircraft.status !== 'Grounded') {
            aircraft.status = 'Grounded';
            aircraft.grounded_reason = `Health below ${groundedThreshold}%`;
            await aircraft.save();
        }

        return NextResponse.json({
            health: aircraft.condition,
            status: aircraft.status,
            grounded: isGrounded,
            groundedReason: isGrounded ? (aircraft.grounded_reason || `Aircraft health ${aircraft.condition}% is below ${groundedThreshold}% threshold`) : null,
            totalHours: aircraft.total_hours,
            flightCount: aircraft.flight_count,
            lastService: aircraft.last_service,
        }, { headers: corsHeaders() });
    } catch (error: any) {
        console.error('[ACARS AircraftHealth]', error);
        return NextResponse.json({ health: 100, status: 'Available', grounded: false }, { headers: corsHeaders() });
    }
}
