import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/database';
import Pilot from '@/models/Pilot';
import Rank from '@/models/Rank';

export async function POST(request: NextRequest) {
    const session = await verifyAuth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await connectDB();
        
        const { pilotId } = await request.json();
        
        // Admin check
        const adminPilot = await Pilot.findById(session.id);
        if (!adminPilot || adminPilot.role !== 'Admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        // Get pilot
        const pilot = await Pilot.findOne({ pilot_id: pilotId || '' });
        if (!pilot) {
            return NextResponse.json({ error: 'Pilot not found' }, { status: 404 });
        }

        const totalHours = (pilot.total_hours || 0) + (pilot.transfer_hours || 0);
        const totalFlights = pilot.total_flights || 0;

        console.log(`[Force Rank] Pilot ${pilot.pilot_id}:`, {
            currentRank: pilot.rank,
            totalHours,
            totalFlights
        });

        // Get all ranks
        const allRanks = await Rank.find().sort({ order: 1 });
        
        if (allRanks.length === 0) {
            return NextResponse.json({ 
                error: 'No ranks configured in database',
                suggestion: 'Please configure ranks in admin panel'
            }, { status: 500 });
        }

        // Find current rank
        const currentRank = allRanks.find(r => r.name === pilot.rank);
        const currentOrder = currentRank ? currentRank.order : -1;

        // Find highest eligible rank
        let eligibleRank = null;
        for (const rank of allRanks) {
            const meetsHours = totalHours >= rank.requirement_hours;
            const meetsFlights = totalFlights >= rank.requirement_flights;
            const isHigherRank = rank.order > currentOrder;
            
            console.log(`[Force Rank] Checking ${rank.name}:`, {
                meetsHours,
                meetsFlights,
                isHigherRank,
                auto_promote: rank.auto_promote
            });
            
            if (meetsHours && meetsFlights && isHigherRank) {
                if (!eligibleRank || rank.order > eligibleRank.order) {
                    eligibleRank = rank;
                }
            }
        }

        if (eligibleRank) {
            pilot.rank = eligibleRank.name;
            await pilot.save();
            
            return NextResponse.json({
                success: true,
                message: `Upgraded ${pilot.pilot_id} from ${currentRank?.name || 'Unknown'} to ${eligibleRank.name}`,
                oldRank: currentRank?.name || pilot.rank,
                newRank: eligibleRank.name,
                pilotStats: {
                    totalHours,
                    totalFlights
                }
            });
        }

        return NextResponse.json({
            success: false,
            message: 'No rank upgrade available',
            currentRank: pilot.rank,
            pilotStats: {
                totalHours,
                totalFlights
            },
            availableRanks: allRanks.map(r => ({
                name: r.name,
                requiresHours: r.requirement_hours,
                requiresFlights: r.requirement_flights,
                meetsRequirements: totalHours >= r.requirement_hours && totalFlights >= r.requirement_flights
            }))
        });

    } catch (error: any) {
        console.error('[Force Rank] Error:', error);
        return NextResponse.json({
            error: 'Failed to upgrade rank',
            details: error.message
        }, { status: 500 });
    }
}
