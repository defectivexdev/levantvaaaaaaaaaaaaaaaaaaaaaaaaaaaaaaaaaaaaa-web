import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/database';
import Pilot from '@/models/Pilot';
import Flight from '@/models/Flight';

export async function GET() {
    const session = await verifyAuth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await connectDB();

        const pilot = await Pilot.findById(session.id).lean();

        if (!pilot) {
            return NextResponse.json({ error: 'Pilot not found' }, { status: 404 });
        }

        // Get total completed flights
        // Try both pilot_id (string like "LVT7FG") and session.id (ObjectId) for backwards compatibility
        const pilotIdString = session.pilotId || (pilot as any).pilot_id;
        console.log('Stats API - Session pilotId:', session.pilotId);
        console.log('Stats API - Session id (ObjectId):', session.id);
        console.log('Stats API - Pilot DB pilot_id:', (pilot as any).pilot_id);
        
        // Query using both string pilot_id and ObjectId for old records
        const totalFlights = await Flight.countDocuments({ 
            $or: [
                { pilot_id: pilotIdString },
                { pilot_id: session.id }
            ],
            approved_status: 1 
        });
        console.log('Stats API - Total flights found (approved_status=1):', totalFlights);
        
        // Debug: check all flights for this pilot regardless of status
        const allFlights = await Flight.countDocuments({ 
            $or: [
                { pilot_id: pilotIdString },
                { pilot_id: session.id }
            ]
        });
        console.log('Stats API - All flights (any status):', allFlights);
        
        // Debug: check flights by different approved_status values
        const pending = await Flight.countDocuments({ 
            $or: [{ pilot_id: pilotIdString }, { pilot_id: session.id }],
            approved_status: 0 
        });
        const rejected = await Flight.countDocuments({ 
            $or: [{ pilot_id: pilotIdString }, { pilot_id: session.id }],
            approved_status: 2 
        });
        console.log('Stats API - Pending flights (status=0):', pending);
        console.log('Stats API - Rejected flights (status=2):', rejected);

        // Format hours nicely (no decimals for whole numbers)
        const hours = Number(pilot.total_hours) || 0;
        const formattedHours = hours % 1 === 0 ? `${Math.round(hours)}h` : `${hours.toFixed(1)}h`;

        // Format balance with K/M suffix for large numbers
        const balance = Number(pilot.balance) || 0;
        const formattedBalance = balance >= 1000000 
            ? `${(balance / 1000000).toFixed(1)}M` 
            : balance >= 1000 
                ? `${(balance / 1000).toFixed(1)}K` 
                : String(Math.round(balance));


        const stats = [
            { 
                label: 'Current Airport', 
                value: pilot.current_location || 'XXXX', 
                subtext: 'Base Location',
                icon: 'location',
                color: 'blue'
            },
            { 
                label: 'Flight Time', 
                value: formattedHours, 
                subtext: `${totalFlights} Flights`,
                icon: 'clock',
                color: 'emerald'
            },
            { 
                label: 'Total Flights', 
                value: String(totalFlights), 
                subtext: 'Approved PIREPs',
                icon: 'plane',
                color: 'purple'
            },
            { 
                label: 'Balance', 
                value: `${formattedBalance} cr`, 
                subtext: pilot.rank || 'Cadet',
                icon: 'credits',
                color: 'gold'
            },
        ];

        const res = NextResponse.json({ 
            stats,
            debug: {
                totalFlights,
                allFlights,
                pending,
                rejected,
                pilotIdString,
                sessionIdObjectId: session.id
            }
        });
        res.headers.set('Cache-Control', 'private, max-age=15, stale-while-revalidate=30');
        return res;

    } catch (error: any) {
        console.error('Stats API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
