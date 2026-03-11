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
        const pilotId = searchParams.get('pilotId');
        const limit = parseInt(searchParams.get('limit') || '10', 10);

        console.log('[Reports API] Session:', { id: session.id, pilotId: session.pilotId });
        console.log('[Reports API] Query pilotId param:', pilotId);
        
        const query: any = { approved_status: { $in: [0, 1, 2] } };
        if (pilotId) {
            // Query using both string pilot_id and ObjectId for backwards compatibility
            query.$or = [
                { pilot_id: session.pilotId },
                { pilot_id: session.id }
            ];
        }

        console.log('[Reports API] Query:', JSON.stringify(query));
        
        const flights = await FlightModel.find(query)
            .sort({ submitted_at: -1 })
            .limit(limit)
            .lean();
            
        console.log('[Reports API] Found flights:', flights.length);
        
        // Debug: check what pilot_id format exists in database
        const sampleFlight = await FlightModel.findOne({}).select('pilot_id').lean();
        console.log('[Reports API] Sample flight pilot_id:', sampleFlight?.pilot_id, 'Type:', typeof sampleFlight?.pilot_id);
        
        // Debug: try querying without pilot filter to see if ANY flights exist
        const allFlightsCount = await FlightModel.countDocuments({});
        console.log('[Reports API] Total flights in database:', allFlightsCount);

        const formattedReports = flights.map((f: any) => {
            console.log('Flight aircraft_type:', f.aircraft_type, 'for flight:', f.flight_number);
            // pilot_id is now a string (e.g., "LVT7FG"), not an ObjectId
            // pilot data is stored directly in pilot_name field
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

        return NextResponse.json({ flights: formattedReports, reports: formattedReports });

    } catch (error: any) {
        console.error('Recent reports API Error:', error);
        return NextResponse.json({ 
            error: 'Failed to fetch reports',
            details: error.message,
            reports: [] 
        }, { status: 500 });
    }
}
