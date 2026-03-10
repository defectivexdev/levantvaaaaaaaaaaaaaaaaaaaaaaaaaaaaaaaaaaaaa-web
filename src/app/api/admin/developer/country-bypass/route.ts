import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/database';
import CountryBlacklistBypass from '@/models/CountryBlacklistBypass';
import Pilot from '@/models/Pilot';

// GET - Fetch all bypass entries
export async function GET() {
    const session = await verifyAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    try {
        await connectDB();
        
        const pilot = await Pilot.findById(session.id);
        if (!pilot?.is_admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const bypasses = await CountryBlacklistBypass.find().sort({ created_at: -1 });

        return NextResponse.json({ bypasses });
    } catch (error: any) {
        console.error('Error fetching bypass list:', error);
        return NextResponse.json({ error: 'Failed to fetch bypass list' }, { status: 500 });
    }
}

// POST - Add pilot to bypass list
export async function POST(request: NextRequest) {
    const session = await verifyAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    try {
        await connectDB();
        
        const pilot = await Pilot.findById(session.id);
        if (!pilot?.is_admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { pilot_id, country_code, reason } = await request.json();

        if (!pilot_id) {
            return NextResponse.json({ error: 'Pilot ID is required' }, { status: 400 });
        }

        // Check if pilot exists
        const targetPilot = await Pilot.findOne({ pilot_id: pilot_id.toUpperCase() });
        if (!targetPilot) {
            return NextResponse.json({ error: 'Pilot not found' }, { status: 404 });
        }

        // Check if already bypassed
        const existing = await CountryBlacklistBypass.findOne({ pilot_id: pilot_id.toUpperCase() });
        if (existing) {
            return NextResponse.json({ error: 'Pilot already in bypass list' }, { status: 400 });
        }

        const bypassEntry = await CountryBlacklistBypass.create({
            pilot_id: pilot_id.toUpperCase(),
            country_code: country_code ? country_code.toUpperCase() : '',
            reason: reason || '',
            added_by: session.pilotId || session.email || 'Admin',
        });

        console.log(`[CountryBypass] Added ${pilot_id} (${country_code}) by ${session.pilotId}`);

        return NextResponse.json({ success: true, entry: bypassEntry });
    } catch (error: any) {
        console.error('Error adding pilot to bypass list:', error);
        return NextResponse.json({ error: 'Failed to add pilot' }, { status: 500 });
    }
}

// DELETE - Remove pilot from bypass list
export async function DELETE(request: NextRequest) {
    const session = await verifyAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    try {
        await connectDB();
        
        const pilot = await Pilot.findById(session.id);
        if (!pilot?.is_admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { pilot_id } = await request.json();

        if (!pilot_id) {
            return NextResponse.json({ error: 'Pilot ID is required' }, { status: 400 });
        }

        const result = await CountryBlacklistBypass.findOneAndDelete({ pilot_id: pilot_id.toUpperCase() });

        if (!result) {
            return NextResponse.json({ error: 'Pilot not found in bypass list' }, { status: 404 });
        }

        console.log(`[CountryBypass] Removed ${pilot_id} by ${session.pilotId}`);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error removing pilot from bypass list:', error);
        return NextResponse.json({ error: 'Failed to remove pilot' }, { status: 500 });
    }
}
