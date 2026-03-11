import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/database';
import { FlightModel } from '@/models';
import mongoose from 'mongoose';

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
        
        // TEMPORARY: Show all flights to diagnose issue
        // Debug: Get sample flights to see actual pilot_id values
        const sampleFlights = await FlightModel.find({}).select('pilot_id pilot_name').limit(5).lean();
        console.log('[Reports API] Sample flights pilot_id values:', sampleFlights.map(f => ({ 
            pilot_id: f.pilot_id, 
            type: typeof f.pilot_id,
            isObjectId: f.pilot_id instanceof mongoose.Types.ObjectId,
            toString: f.pilot_id?.toString?.(),
            pilot_name: f.pilot_name
        })));
        
        console.log('[Reports API] Session info:', { 
            sessionId: session.id, 
            sessionPilotId: session.pilotId,
            sessionIdType: typeof session.id,
            sessionPilotIdType: typeof session.pilotId
        });
        
        // SHOW ALL FLIGHTS FOR NOW - NO PILOT FILTER
        const query: any = { approved_status: { $in: [0, 1, 2] } };
        
        console.log('[Reports API] Query (showing all flights):', JSON.stringify(query));
        
        const flights = await FlightModel.find(query)
            .sort({ submitted_at: -1 })
            .limit(50) // Increase limit to see more
            .lean();
            
        console.log('[Reports API] Found flights:', flights.length);
        console.log('[Reports API] First flight pilot_id:', flights[0]?.pilot_id, 'Type:', typeof flights[0]?.pilot_id);

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

        // Add debug info to response that will show in browser console
        const debugInfo = {
            samplePilotIds: sampleFlights.map(f => ({ 
                pilot_id: f.pilot_id, 
                type: typeof f.pilot_id,
                isObjectId: f.pilot_id instanceof mongoose.Types.ObjectId,
                toString: f.pilot_id?.toString?.(),
                pilot_name: f.pilot_name
            })),
            sessionInfo: { 
                sessionId: session.id, 
                sessionPilotId: session.pilotId,
                sessionIdType: typeof session.id,
                sessionPilotIdType: typeof session.pilotId
            },
            totalFlights: flights.length,
            firstFlightPilotId: flights[0]?.pilot_id,
            firstFlightPilotIdType: typeof flights[0]?.pilot_id
        };

        return NextResponse.json({ 
            flights: formattedReports, 
            reports: formattedReports,
            _debug: debugInfo 
        });

    } catch (error: any) {
        console.error('Recent reports API Error:', error);
        return NextResponse.json({ 
            error: 'Failed to fetch reports',
            details: error.message,
            reports: [] 
        }, { status: 500 });
    }
}
