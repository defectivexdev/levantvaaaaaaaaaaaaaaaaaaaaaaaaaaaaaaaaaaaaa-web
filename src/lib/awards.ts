import Pilot from '@/models/Pilot';
import Award, { IAward } from '@/models/Award';
import PilotAward from '@/models/PilotAward';

/**
 * Checks and grants automated awards based on pilot statistics.
 * @param pilotInternalId The MongoDB _id of the pilot
 */
export async function checkAndGrantAwards(pilotInternalId: string) {
    const newlyGranted: IAward[] = [];
    try {
        const pilot = await Pilot.findById(pilotInternalId);
        if (!pilot) return [];

        // Fetch all active automated awards
        const automatedAwards = await Award.find({ 
            active: true, 
            category: { $in: ['Flight Hours', 'Flights', 'Landings'] } 
        });

        for (const award of automatedAwards) {
            let pilotValue = 0;
            
            switch (award.category) {
                case 'Flight Hours':
                    pilotValue = pilot.total_hours;
                    break;
                case 'Flights':
                    pilotValue = pilot.total_flights;
                    break;
                case 'Landings':
                    // Assuming total_flights is total landings for now, or track landings separately
                    pilotValue = pilot.total_flights;
                    break;
            }

            if (award.requiredValue && pilotValue >= award.requiredValue) {
                // Check if pilot already has this award
                const existing = await PilotAward.findOne({ 
                    pilot_id: pilot._id, 
                    award_id: award._id 
                });

                if (!existing) {
                    // Grant the award
                    const newAward = await PilotAward.create({
                        pilot_id: pilot._id,
                        award_id: award._id,
                        earned_at: new Date()
                    });
                    newlyGranted.push(award);

                    // Log award earned
                    if (newAward) {
                        console.log(`[Awards] ${pilot.pilot_id} earned award: ${award.name}`);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error checking automated awards:', error);
    }
    return newlyGranted;
}
