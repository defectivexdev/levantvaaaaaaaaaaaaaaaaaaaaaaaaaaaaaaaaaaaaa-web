import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import Airport from '@/models/Airport';

// GET /api/airports?icao=XXXX - Get airport by ICAO code
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const icao = searchParams.get('icao');

        if (!icao) {
            return NextResponse.json(
                { success: false, error: 'ICAO code required' },
                { status: 400 }
            );
        }

        await dbConnect();
        
        const airport = await Airport.findOne({ icao: icao.toUpperCase() }).lean();
        
        if (!airport) {
            return NextResponse.json(
                { success: false, error: 'Airport not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json({
            success: true,
            airport: {
                icao: airport.icao,
                name: airport.name,
                city: airport.city,
                country: airport.country,
            }
        });
    } catch (error: any) {
        console.error('Error fetching airport:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch airport' },
            { status: 500 }
        );
    }
}
