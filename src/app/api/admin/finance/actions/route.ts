import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import AirlineFinance from '@/models/AirlineFinance';
import FinanceLog from '@/models/FinanceLog';
import { PilotModel } from '@/models';
import { verifyAuth } from '@/lib/auth';

// Handle Deposit, Withdraw, and Pilot Bonus actions
export async function POST(request: NextRequest) {
    const session = await verifyAuth();
    if (!session || !session.isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await connectDB();
        const body = await request.json();
        const { action, amount, reason, pilotId, item } = body;

        if (!action || !amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
        }

        let finance = await AirlineFinance.findOne();
        if (!finance) {
            finance = await AirlineFinance.create({ balance: 1000000 });
        }

        const adminUser = await PilotModel.findById(session.id);
        const adminName = adminUser ? `${adminUser.first_name} ${adminUser.last_name}` : 'Admin';

        switch (action) {
            case 'deposit':
                finance.balance += amount;
                finance.total_revenue += amount;
                
                await FinanceLog.create({
                    pilot_id: adminUser?._id || session.id,
                    type: 'Admin Deposit',
                    amount: amount,
                    description: `${reason || 'Manual deposit by admin'} (${adminName})`
                });
                break;

            case 'withdraw':
                if (finance.balance < amount) {
                    return NextResponse.json({ error: 'Insufficient vault funds' }, { status: 400 });
                }
                
                finance.balance -= amount;
                finance.total_expenses += amount;
                
                await FinanceLog.create({
                    pilot_id: adminUser?._id || session.id,
                    type: 'Admin Withdrawal',
                    amount: -amount,
                    description: `${reason || 'Manual withdrawal by admin'} (${adminName})`
                });
                break;

            case 'purchase':
                if (finance.balance < amount) {
                    return NextResponse.json({ error: 'Insufficient vault funds for this purchase' }, { status: 400 });
                }

                finance.balance -= amount;
                finance.total_expenses += amount;

                let itemName = 'Supplies';
                if (item === 'fuel') itemName = 'Jet A1 Fuel';
                if (item === 'catering') itemName = 'Catering Food';

                await FinanceLog.create({
                    pilot_id: adminUser?._id || session.id,
                    type: 'Procurement',
                    amount: -amount,
                    description: `Purchased ${itemName} for ${amount.toLocaleString()} Cr. ${reason || ''} (${adminName})`
                });
                break;

            case 'bonus':
                if (!pilotId) {
                    return NextResponse.json({ error: 'Pilot ID is required for a bonus' }, { status: 400 });
                }

                if (finance.balance < amount) {
                    return NextResponse.json({ error: 'Insufficient vault funds for this bonus' }, { status: 400 });
                }

                const pilot = await PilotModel.findOne({ pilot_id: pilotId });
                if (!pilot) {
                    return NextResponse.json({ error: 'Pilot not found' }, { status: 404 });
                }

                // Deduct from Vault
                finance.balance -= amount;
                finance.total_expenses += amount;

                // Give to Pilot
                pilot.balance = (pilot.balance || 0) + amount;
                pilot.total_credits = (pilot.total_credits || 0) + amount;
                await pilot.save();

                await FinanceLog.create({
                    pilot_id: pilot._id,
                    type: 'Pilot Bonus',
                    amount: -amount,
                    description: `Bonus awarded to ${pilot.first_name} ${pilot.last_name} (${pilot.pilot_id}): ${reason || 'Admin Award'}`
                });
                break;

            default:
                return NextResponse.json({ error: 'Invalid action type' }, { status: 400 });
        }

        finance.last_updated = new Date();
        await finance.save();

        return NextResponse.json({ success: true, newBalance: finance.balance });

    } catch (error: any) {
        console.error('[Admin Finance POST Error]:', error);
        return NextResponse.json({ error: 'Failed to process transaction' }, { status: 500 });
    }
}
