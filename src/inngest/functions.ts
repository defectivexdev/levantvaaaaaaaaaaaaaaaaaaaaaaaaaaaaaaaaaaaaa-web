import { inngest } from "@/lib/inngest";
import connectDB from "@/lib/database";
import Bid from "@/models/Bid";
import { ActiveFlightModel } from "@/models";
import Fleet from "@/models/Fleet";
import ChatMessage from "@/models/ChatMessage";

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

