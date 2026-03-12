import { inngest } from "@/lib/inngest";
import connectDB from "@/lib/database";
import Bid from "@/models/Bid";
import { ActiveFlightModel } from "@/models";
import Fleet from "@/models/Fleet";
import ChatMessage from "@/models/ChatMessage";
import AirlineFinance from "@/models/AirlineFinance";
import FinanceLog from "@/models/FinanceLog";
import GlobalConfig from "@/models/GlobalConfig";
import Pilot from "@/models/Pilot";
import { sendDiscordNotification } from "@/lib/discord";

function rand(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRankSalaryKey(rank: string): string {
    const map: Record<string, string> = {
        'Cadet': 'salary_cadet',
        'Second Officer': 'salary_second_officer',
        'First Officer': 'salary_first_officer',
        'Senior First Officer': 'salary_senior_first_officer',
        'Captain': 'salary_captain',
        'Senior Captain': 'salary_senior_captain',
        'Check Airman': 'salary_check_airman',
    };
    return map[rank] || 'salary_cadet';
}

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

export const dailyOperations = inngest.createFunction(
  { id: "daily-operations" },
  { cron: "0 0 * * *" },
  async ({ step }) => {
    await connectDB();

    const finance = await AirlineFinance.findOne();
    if (!finance || finance.balance <= 0) {
        return { success: true, message: 'No balance to deduct', deducted: 0 };
    }

    const fuelBarrels = rand(80, 300);
    const fuelPricePerBarrel = rand(45, 85);
    const fuelCost = fuelBarrels * fuelPricePerBarrel;

    const mealSets = rand(50, 200);
    const mealPrice = rand(8, 25);
    const cateringCost = mealSets * mealPrice;

    const waterBottles = rand(100, 500);
    const waterPrice = rand(1, 3);
    const waterCost = waterBottles * waterPrice;

    const snackPacks = rand(30, 150);
    const snackPrice = rand(3, 10);
    const snackCost = snackPacks * snackPrice;

    const totalCost = fuelCost + cateringCost + waterCost + snackCost;

    finance.balance -= totalCost;
    await finance.save();

    await FinanceLog.create({
        type: 'expense',
        category: 'operations',
        amount: totalCost,
        description: `Daily Operations: Fuel (${fuelBarrels} barrels @ $${fuelPricePerBarrel}), Catering (${mealSets} meals @ $${mealPrice}), Water (${waterBottles} bottles @ $${waterPrice}), Snacks (${snackPacks} packs @ $${snackPrice})`,
        balance_after: finance.balance,
        timestamp: new Date()
    });

    await sendDiscordNotification(
        `💸 **Daily Operations Cost**\n` +
        `⛽ Fuel: $${fuelCost.toLocaleString()} (${fuelBarrels} barrels)\n` +
        `🍽️ Catering: $${cateringCost.toLocaleString()} (${mealSets} meals)\n` +
        `💧 Water: $${waterCost.toLocaleString()} (${waterBottles} bottles)\n` +
        `🍿 Snacks: $${snackCost.toLocaleString()} (${snackPacks} packs)\n` +
        `**Total: $${totalCost.toLocaleString()}**\n` +
        `Balance: $${finance.balance.toLocaleString()}`
    );

    return {
      success: true,
      deducted: totalCost,
      balance: finance.balance
    };
  }
);

export const weeklySalary = inngest.createFunction(
  { id: "weekly-salary" },
  { cron: "0 0 * * 1" },
  async ({ step }) => {
    await connectDB();

    const config = await GlobalConfig.findOne({ key: 'LVT_MAIN' });
    if (!config || !config.salary_enabled) {
        return { success: true, message: 'Salary system disabled', paid: 0 };
    }

    const pilots = await Pilot.find({ status: 'Active' });
    let totalPaid = 0;
    let pilotsPaid = 0;

    for (const pilot of pilots) {
        const salaryKey = getRankSalaryKey(pilot.rank);
        const salary = (config as any)[salaryKey] || 0;

        if (salary > 0) {
            pilot.balance += salary;
            await pilot.save();

            await FinanceLog.create({
                type: 'income',
                category: 'salary',
                amount: salary,
                description: `Weekly salary for ${pilot.first_name} ${pilot.last_name} (${pilot.rank})`,
                pilot_id: pilot._id,
                balance_after: pilot.balance,
                timestamp: new Date()
            });

            totalPaid += salary;
            pilotsPaid++;
        }
    }

    await sendDiscordNotification(
        `💰 **Weekly Salary Payment**\n` +
        `Paid ${pilotsPaid} pilots\n` +
        `Total: $${totalPaid.toLocaleString()}`
    );

    return {
      success: true,
      pilotsPaid,
      totalPaid
    };
  }
);
