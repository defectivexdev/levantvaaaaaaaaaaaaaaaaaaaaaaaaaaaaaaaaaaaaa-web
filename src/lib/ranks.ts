import Pilot, { IPilot } from '@/models/Pilot';
import Rank, { IRank } from '@/models/Rank';

/**
 * Checks if a pilot is eligible for a rank upgrade and performs it.
 * @param pilotId The database ID of the pilot (String or ObjectId)
 * @returns The new rank name if upgraded, or null if no change.
 */
export async function checkAndUpgradeRank(pilotId: string): Promise<string | null> {
    try {
        const pilot = await Pilot.findById(pilotId);
        if (!pilot) {
            console.log('[Rank Check] Pilot not found:', pilotId);
            return null;
        }

        const currentRankName = pilot.rank;
        // Total stats for rank = Flown Hours + Transfer Hours
        const currentHours = (pilot.total_hours || 0) + (pilot.transfer_hours || 0);
        const currentFlights = pilot.total_flights;

        console.log('[Rank Check] Pilot:', pilot.pilot_id, {
            currentRank: currentRankName,
            totalHours: currentHours,
            totalFlights: currentFlights
        });

        // Fetch all ranks sorted by order
        const allRanks = await Rank.find().sort({ order: 1 });
        console.log('[Rank Check] Found ranks in database:', allRanks.length);
        
        if (allRanks.length === 0) {
            console.log('[Rank Check] No ranks configured in database!');
            return null;
        }

        // Log all ranks for debugging
        allRanks.forEach(r => {
            console.log(`[Rank Check] Rank: ${r.name}, Order: ${r.order}, Hours: ${r.requirement_hours}, Flights: ${r.requirement_flights}, Auto: ${r.auto_promote}`);
        });

        // Find the current rank object to get its order
        const currentRank = allRanks.find(r => r.name === currentRankName);
        const currentOrder = currentRank ? currentRank.order : -1;
        console.log('[Rank Check] Current rank order:', currentOrder);

        // Find the highest rank the pilot is eligible for (must have auto_promote = true)
        let eligibleRank: IRank | null = null;

        for (const rank of allRanks) {
            const meetsHours = currentHours >= rank.requirement_hours;
            const meetsFlights = currentFlights >= rank.requirement_flights;
            const isHigherRank = rank.order > currentOrder;
            
            console.log(`[Rank Check] Checking ${rank.name}: hours=${meetsHours}, flights=${meetsFlights}, higher=${isHigherRank}, auto=${rank.auto_promote}`);
            
            // Only consider for auto-promotion if flag is set and pilot meets requirements
            if (rank.auto_promote && meetsHours && meetsFlights && isHigherRank) {
                if (!eligibleRank || rank.order > eligibleRank.order) {
                    eligibleRank = rank;
                    console.log(`[Rank Check] Eligible for: ${rank.name}`);
                }
            }
        }

        // Only upgrade if we found an eligible higher rank
        if (eligibleRank) {
            console.log(`[Rank Check] ✅ Upgrading Pilot ${pilot.pilot_id} from ${currentRankName} to ${eligibleRank.name}`);
            
            pilot.rank = eligibleRank.name;
            await pilot.save();
            
            return eligibleRank.name;
        }

        console.log('[Rank Check] No promotion available');
        return null;
    } catch (error) {
        console.error('[Rank Check] Error:', error);
        return null;
    }
}
