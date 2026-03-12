import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/database';
import { FlightModel } from '@/models';

export async function GET(request: Request) {
    const session = await verifyAuth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '5', 10);

        // Query for ALL pilots' recent flights (not just current user)
        const flights = await FlightModel.find({
            approved_status: { $in: [0, 1, 2] }
        })
            .select('flight_number callsign departure_icao arrival_icao aircraft_type flight_time landing_rate landing_grade score approved_status submitted_at pilot_name pilot_id log')
            .sort({ submitted_at: -1 })
            .limit(limit)
            .lean();

        const formattedReports = flights.map((f: any) => {
            const pilotNameParts = (f.pilot_name || 'Unknown Pilot').split(' ');
            const firstName = pilotNameParts[0] || 'Unknown';
            const lastName = pilotNameParts.slice(1).join(' ') || 'Pilot';
            
            return {
                ...f,
                pilot: { 
                    first_name: firstName, 
                    last_name: lastName, 
                    pilot_id: f.pilot_id || 'N/A' 
                },
                id: `PIREP-${(f._id?.toString() || '').slice(-6).toUpperCase()}`,
                route: `${f.departure_icao} → ${f.arrival_icao}`,
                aircraft: f.aircraft_type,
                date: new Date(f.submitted_at).toLocaleDateString(),
                status: f.approved_status === 1 ? 'Accepted' : f.approved_status === 2 ? 'Rejected' : 'Pending',
                approved_status: f.approved_status,
                log: f.log
            };
        });

        return NextResponse.json({ reports: formattedReports });

    } catch (error: any) {
        console.error('All Recent Reports API Error:', error);
        return NextResponse.json({ 
            error: 'Failed to fetch reports',
            details: error.message,
            reports: [] 
        }, { status: 500 });
    }
}
