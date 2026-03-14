import { NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import StaffMember from '@/models/StaffMember';
import StaffRole from '@/models/StaffRole';
import Pilot from '@/models/Pilot';
import mongoose from 'mongoose';

/**
 * Debug endpoint to check staff member data structure
 * GET /api/staff/debug
 */
export async function GET() {
    await dbConnect();
    
    try {
        // Get raw staff members without populate
        const rawMembers = await StaffMember.find({}).lean();
        
        // Get staff members with populate
        const populatedMembers = await StaffMember.find({})
            .populate({ path: 'pilot_id', select: 'first_name last_name rank pilot_id country' })
            .populate({ path: 'role_id', select: 'title category color order' })
            .lean();
        
        // Get all roles
        const allRoles = await StaffRole.find({}).lean();
        
        // Get all pilots
        const allPilots = await Pilot.find({}).lean();
        
        // Detailed analysis
        const analysis = rawMembers.map(member => {
            const pilotIdType = typeof member.pilot_id;
            const roleIdType = typeof member.role_id;
            const isPilotIdObjectId = mongoose.Types.ObjectId.isValid(member.pilot_id);
            const isRoleIdObjectId = mongoose.Types.ObjectId.isValid(member.role_id);
            
            // Try to find the role manually
            const roleMatch = allRoles.find(r => r._id.toString() === member.role_id?.toString());
            const pilotMatch = allPilots.find(p => p._id.toString() === member.pilot_id?.toString());
            
            return {
                memberId: member._id,
                pilot_id: {
                    value: member.pilot_id,
                    type: pilotIdType,
                    isObjectId: isPilotIdObjectId,
                    matchFound: !!pilotMatch,
                    matchedPilot: pilotMatch ? {
                        id: pilotMatch._id,
                        pilot_id: pilotMatch.pilot_id,
                        name: `${pilotMatch.first_name} ${pilotMatch.last_name}`
                    } : null
                },
                role_id: {
                    value: member.role_id,
                    type: roleIdType,
                    isObjectId: isRoleIdObjectId,
                    matchFound: !!roleMatch,
                    matchedRole: roleMatch ? {
                        id: roleMatch._id,
                        name: roleMatch.name,
                        title: roleMatch.title,
                        category: roleMatch.category,
                        color: roleMatch.color
                    } : null
                },
                name: member.name,
                email: member.email,
                discord: member.discord
            };
        });
        
        return NextResponse.json({
            success: true,
            data: {
                totalMembers: rawMembers.length,
                totalRoles: allRoles.length,
                totalPilots: allPilots.length,
                rawMembers,
                populatedMembers,
                allRoles,
                analysis
            }
        });
        
    } catch (error: any) {
        console.error('Debug error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
