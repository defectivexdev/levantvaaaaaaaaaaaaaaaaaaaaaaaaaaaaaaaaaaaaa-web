import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/database';
import CountryBlacklist from '@/models/CountryBlacklist';
import Pilot from '@/models/Pilot';

// GET - Fetch all blacklisted countries
export async function GET() {
    const session = await verifyAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    try {
        await connectDB();
        
        const pilot = await Pilot.findById(session.id);
        if (!pilot?.is_admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const blacklist = await CountryBlacklist.find().sort({ created_at: -1 });

        return NextResponse.json({ blacklist });
    } catch (error: any) {
        console.error('Error fetching country blacklist:', error);
        return NextResponse.json({ error: 'Failed to fetch blacklist' }, { status: 500 });
    }
}

// POST - Add country to blacklist
export async function POST(request: NextRequest) {
    const session = await verifyAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    try {
        await connectDB();
        
        const pilot = await Pilot.findById(session.id);
        if (!pilot?.is_admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { country_code, country_name, reason } = await request.json();

        if (!country_code) {
            return NextResponse.json({ error: 'Country code is required' }, { status: 400 });
        }

        // Check if already blacklisted
        const existing = await CountryBlacklist.findOne({ country_code: country_code.toUpperCase() });
        if (existing) {
            return NextResponse.json({ error: 'Country already blacklisted' }, { status: 400 });
        }

        const blacklistEntry = await CountryBlacklist.create({
            country_code: country_code.toUpperCase(),
            country_name: country_name || '',
            reason: reason || '',
            added_by: session.pilotId || session.email || 'Admin',
        });

        console.log(`[CountryBlacklist] Added ${country_name} (${country_code}) by ${session.pilotId}`);

        return NextResponse.json({ success: true, entry: blacklistEntry });
    } catch (error: any) {
        console.error('Error adding country to blacklist:', error);
        return NextResponse.json({ error: 'Failed to add country' }, { status: 500 });
    }
}

// DELETE - Remove country from blacklist
export async function DELETE(request: NextRequest) {
    const session = await verifyAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    try {
        await connectDB();
        
        const pilot = await Pilot.findById(session.id);
        if (!pilot?.is_admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { country_code } = await request.json();

        if (!country_code) {
            return NextResponse.json({ error: 'Country code is required' }, { status: 400 });
        }

        const result = await CountryBlacklist.findOneAndDelete({ country_code: country_code.toUpperCase() });

        if (!result) {
            return NextResponse.json({ error: 'Country not found in blacklist' }, { status: 404 });
        }

        console.log(`[CountryBlacklist] Removed ${result.country_name} (${country_code}) by ${session.pilotId}`);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error removing country from blacklist:', error);
        return NextResponse.json({ error: 'Failed to remove country' }, { status: 500 });
    }
}
