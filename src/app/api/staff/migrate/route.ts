import { NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import StaffMember from '@/models/StaffMember';
import Pilot from '@/models/Pilot';
import mongoose from 'mongoose';

/**
 * Migration endpoint to fix existing staff members
 * Converts string pilot_id to ObjectId reference
 * 
 * Call this once: GET /api/staff/migrate
 */
export async function GET() {
    await dbConnect();
    
    try {
        // Find all staff members
        const staffMembers = await StaffMember.find({}).lean();
        
        let migrated = 0;
        let failed = 0;
        const errors: string[] = [];
        
        for (const member of staffMembers) {
            try {
                // Check if pilot_id is already an ObjectId
                if (mongoose.Types.ObjectId.isValid(member.pilot_id) && 
                    member.pilot_id instanceof mongoose.Types.ObjectId) {
                    console.log(`Member ${member._id} already migrated`);
                    continue;
                }
                
                // If pilot_id is a string, find the pilot and convert
                const pilotIdString = String(member.pilot_id);
                const pilot = await Pilot.findOne({ pilot_id: pilotIdString });
                
                if (!pilot) {
                    errors.push(`Pilot not found for pilot_id: ${pilotIdString}`);
                    failed++;
                    continue;
                }
                
                // Update the staff member with ObjectId reference
                await StaffMember.updateOne(
                    { _id: member._id },
                    { $set: { pilot_id: pilot._id } }
                );
                
                migrated++;
                console.log(`Migrated member ${member._id}: ${pilotIdString} -> ${pilot._id}`);
                
            } catch (error: any) {
                errors.push(`Error migrating ${member._id}: ${error.message}`);
                failed++;
            }
        }
        
        return NextResponse.json({
            success: true,
            message: 'Migration completed',
            stats: {
                total: staffMembers.length,
                migrated,
                failed,
                errors
            }
        });
        
    } catch (error: any) {
        console.error('Migration error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
