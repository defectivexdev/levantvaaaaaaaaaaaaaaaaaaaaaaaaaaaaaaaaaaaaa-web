import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/database';
import Pilot from '@/models/Pilot';
import { checkAndUpgradeRank } from '@/lib/ranks';

export async function POST(request: NextRequest) {
    const session = await verifyAuth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const pilot = await Pilot.findById(session.id);
    if (!pilot || pilot.role !== 'Admin') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    try {
        await connectDB();
        
        // Get all active pilots
        const allPilots = await Pilot.find({ status: 'Active' });
        
        const results = {
            total: allPilots.length,
            promoted: [] as Array<{ pilotId: string, name: string, oldRank: string, newRank: string }>,
            unchanged: 0,
            errors: [] as Array<{ pilotId: string, error: string }>
        };

        console.log(`[Bulk Rank Check] Checking ${allPilots.length} pilots...`);

        for (const pilot of allPilots) {
            try {
                const oldRank = pilot.rank;
                const newRank = await checkAndUpgradeRank(pilot._id.toString());
                
                if (newRank && newRank !== oldRank) {
                    results.promoted.push({
                        pilotId: pilot.pilot_id,
                        name: `${pilot.first_name} ${pilot.last_name}`,
                        oldRank,
                        newRank
                    });
                    console.log(`[Bulk Rank Check] ✅ Promoted ${pilot.pilot_id} from ${oldRank} to ${newRank}`);
                } else {
                    results.unchanged++;
                }
            } catch (error: any) {
                results.errors.push({
                    pilotId: pilot.pilot_id,
                    error: error.message
                });
                console.error(`[Bulk Rank Check] Error for ${pilot.pilot_id}:`, error);
            }
        }

        console.log(`[Bulk Rank Check] Complete: ${results.promoted.length} promoted, ${results.unchanged} unchanged, ${results.errors.length} errors`);

        return NextResponse.json({
            success: true,
            message: `Bulk rank check complete: ${results.promoted.length} pilots promoted`,
            results
        });
    } catch (error: any) {
        console.error('[Bulk Rank Check] Fatal error:', error);
        return NextResponse.json({
            error: 'Failed to perform bulk rank check',
            details: error.message
        }, { status: 500 });
    }
}
