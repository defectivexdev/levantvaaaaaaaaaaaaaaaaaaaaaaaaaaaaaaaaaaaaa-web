import { inngest } from "@/lib/inngest";
import connectDB from "@/lib/database";
import Bid from "@/models/Bid";
import { ActiveFlightModel } from "@/models";
import Fleet from "@/models/Fleet";
import ChatMessage from "@/models/ChatMessage";
import Pilot from "@/models/Pilot";
import Rank from "@/models/Rank";

export const cleanupStaleData = inngest.createFunction(
  { id: "cleanup-stale-data" },
  { cron: "*/2 * * * *" },
  async ({ step }) => {
    await connectDB();
    const now = new Date();
    let expiredBids = 0;
    let staleFlights = 0;

    const expiredResult = await Bid.deleteMany(
        { status: 'Active', expires_at: { $lte: now } }
    );
    expiredBids = expiredResult.deletedCount || 0;

    const staleThreshold = new Date(now.getTime() - 5 * 60 * 1000);
    const staleActiveFlights = await ActiveFlightModel.find({
        last_heartbeat: { $lte: staleThreshold }
    });

    for (const flight of staleActiveFlights) {
        await Bid.updateMany(
            { pilot_id: flight.pilot_id, status: 'Active' },
            { $set: { status: 'Cancelled' } }
        );

        if (flight.aircraft_id) {
            await Fleet.findByIdAndUpdate(flight.aircraft_id, {
                status: 'Available'
            });
        }

        await ActiveFlightModel.findByIdAndDelete(flight._id);
        staleFlights++;
    }

    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);
    await ChatMessage.deleteMany({ timestamp: { $lt: startOfToday } });

    return {
      success: true,
      expiredBids,
      staleFlights,
      message: `Cleanup complete: ${expiredBids} expired bids, ${staleFlights} stale flights removed`
    };
  }
);

export const automaticRankCheck = inngest.createFunction(
  { id: "automatic-rank-check" },
  { cron: "0 * * * *" }, // Every hour
  async ({ step }) => {
    await connectDB();
    
    // Get all active pilots
    const allPilots = await Pilot.find({ status: 'Active' });
    
    // Get all ranks
    const allRanks = await Rank.find().sort({ order: 1 });
    
    const results = {
      total: allPilots.length,
      promoted: [] as Array<{ pilotId: string; name: string; oldRank: string; newRank: string; hours: number; flights: number }>,
      unchanged: 0,
      errors: [] as Array<{ pilotId: string; error: string }>
    };

    console.log(`[Auto Rank Check] Checking ${allPilots.length} pilots for rank upgrades...`);

    for (const pilot of allPilots) {
      try {
        const oldRank = pilot.rank;
        const totalHours = (pilot.total_hours || 0) + (pilot.transfer_hours || 0);
        const totalFlights = pilot.total_flights || 0;

        // Find current rank
        const currentRank = allRanks.find((r: any) => r.name === oldRank);
        const currentOrder = currentRank ? currentRank.order : -1;

        // Find highest eligible rank
        let eligibleRank: any = null;
        for (const rank of allRanks) {
          const meetsHours = totalHours >= rank.requirement_hours;
          const meetsFlights = totalFlights >= rank.requirement_flights;
          const isHigherRank = rank.order > currentOrder;
          
          if (rank.auto_promote && meetsHours && meetsFlights && isHigherRank) {
            if (!eligibleRank || rank.order > eligibleRank.order) {
              eligibleRank = rank;
            }
          }
        }

        // Upgrade if eligible
        if (eligibleRank && eligibleRank.name !== oldRank) {
          pilot.rank = eligibleRank.name;
          await pilot.save();
          
          results.promoted.push({
            pilotId: pilot.pilot_id,
            name: `${pilot.first_name} ${pilot.last_name}`,
            oldRank,
            newRank: eligibleRank.name,
            hours: totalHours,
            flights: totalFlights
          });
          
          console.log(`[Auto Rank Check] ✅ Promoted ${pilot.pilot_id} from ${oldRank} to ${eligibleRank.name} (${totalHours}h)`);
        } else {
          results.unchanged++;
        }
      } catch (error) {
        results.errors.push({
          pilotId: pilot.pilot_id,
          error: (error as Error).message || String(error)
        });
        console.error(`[Auto Rank Check] Error for ${pilot.pilot_id}:`, error);
      }
    }

    console.log(`[Auto Rank Check] Complete: ${results.promoted.length} promoted, ${results.unchanged} unchanged, ${results.errors.length} errors`);

    return {
      success: true,
      promoted: results.promoted.length,
      unchanged: results.unchanged,
      errors: results.errors.length,
      details: results.promoted
    };
  }
);

