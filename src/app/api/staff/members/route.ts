import { NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import StaffMember from '@/models/StaffMember';
import StaffRole from '@/models/StaffRole';
import Pilot from '@/models/Pilot';

// Ensure models are registered
const _ = { StaffRole, Pilot };

// Helper function to fetch Discord avatar
async function fetchDiscordAvatar(userId: string): Promise<string | null> {
    try {
        const response = await fetch(`https://discord.com/api/v10/users/${userId}`, {
            headers: {
                'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`
            }
        });
        
        if (response.ok) {
            const user = await response.json();
            if (user.avatar) {
                return `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.png?size=128`;
            }
        }
    } catch (error) {
        console.error('Failed to fetch Discord avatar:', error);
    }
    return null;
}

// GET: List all staff members
export async function GET() {
    await dbConnect();
    try {
        const members = await StaffMember.find({})
            .populate('pilot_id', 'first_name last_name rank pilot_id country')
            .populate('role_id', 'title category color order')
            .sort('-assigned_at');
        
        // Fetch Discord avatars for members with discord IDs
        const membersWithAvatars = await Promise.all(
            members.map(async (member) => {
                const memberObj = member.toObject();
                if (memberObj.discord && !memberObj.picture) {
                    const avatar = await fetchDiscordAvatar(memberObj.discord);
                    if (avatar) {
                        memberObj.picture = avatar;
                    }
                }
                return memberObj;
            })
        );
            
        return NextResponse.json({ success: true, members: membersWithAvatars });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// Role title to category mapping
const roleTitleToCategoryMap: { [key: string]: { category: string; color: string; order: number } } = {
    'Chief Executive Officer': { category: 'Board of Governor', color: 'text-accent-gold', order: 1 },
    'Chief Operations Officer': { category: 'Board of Governor', color: 'text-accent-gold', order: 1 },
    'Executive Vice President': { category: 'Board of Governor', color: 'text-accent-gold', order: 1 },
    'Operations Director': { category: 'Director', color: 'text-rose-400', order: 2 },
    'Human Resources Director': { category: 'Director', color: 'text-rose-400', order: 2 },
    'Marketing Director': { category: 'Director', color: 'text-rose-400', order: 2 },
    'IT Director': { category: 'Director', color: 'text-rose-400', order: 2 },
    'Events Director': { category: 'Director', color: 'text-rose-400', order: 2 },
    'Chief Pilot Training': { category: 'Chief Pilot', color: 'text-emerald-400', order: 3 },
    'Chief Pilot Recruitment': { category: 'Chief Pilot', color: 'text-emerald-400', order: 3 },
    'Senior Advisor': { category: 'Chief Pilot', color: 'text-emerald-400', order: 3 },
};

// POST: Assign staff member
export async function POST(req: Request) {
    await dbConnect();
    try {
        const { pilotId, roleId, roleTitle, name, callsign, email, discord } = await req.json();
        
        let finalPilotId = pilotId;

        // Always convert pilot_id string to ObjectId
        if (pilotId) {
            const pilot = await Pilot.findOne({ pilot_id: pilotId });
            if (!pilot) {
                return NextResponse.json({ success: false, error: 'Pilot not found with this ID' }, { status: 404 });
            }
            finalPilotId = pilot._id;
        }

        let finalRoleId = roleId;

        // If no roleId, but we have title, Find or Create based on title only
        if (!finalRoleId && roleTitle) {
            // Check if role exists by title only
            let role = await StaffRole.findOne({ 
                $or: [
                    { title: roleTitle },
                    { name: roleTitle }
                ]
            });
            
            if (!role) {
                // Get category, color, and order from mapping
                const roleConfig = roleTitleToCategoryMap[roleTitle];
                if (!roleConfig) {
                    return NextResponse.json({ success: false, error: 'Invalid role title' }, { status: 400 });
                }

                role = await StaffRole.create({
                    name: roleTitle,
                    title: roleTitle,
                    category: roleConfig.category,
                    color: roleConfig.color,
                    order: roleConfig.order
                });
            }
            finalRoleId = role.id;
        }

        if (!finalRoleId) {
            return NextResponse.json({ success: false, error: 'Role ID or Title required' }, { status: 400 });
        }
        
        // Check if exists
        const exists = await StaffMember.findOne({ pilot_id: finalPilotId, role_id: finalRoleId });
        if (exists) {
             return NextResponse.json({ success: false, error: 'Pilot already assigned to this role' }, { status: 400 });
        }

        // Fetch Discord avatar if discord ID provided
        let picture = null;
        if (discord) {
            picture = await fetchDiscordAvatar(discord);
        }

        const member = await StaffMember.create({ 
            pilot_id: finalPilotId, 
            role_id: finalRoleId,
            name,
            callsign,
            email,
            discord,
            picture
        });
        // Populate for immediate return
        await member.populate([
            { path: 'pilot_id', select: 'first_name last_name rank pilot_id country' },
            { path: 'role_id', select: 'title category color order' }
        ]);
        
        return NextResponse.json({ success: true, member });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
