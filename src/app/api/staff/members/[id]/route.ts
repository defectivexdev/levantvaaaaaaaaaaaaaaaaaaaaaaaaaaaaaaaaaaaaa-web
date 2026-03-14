import { NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import StaffMember from '@/models/StaffMember';
import StaffRole from '@/models/StaffRole';

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

// PUT: Update staff member
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await dbConnect();
    try {
        const { roleTitle, name, email, discord } = await req.json();

        let finalRoleId;

        // Find or Create Role based on title only
        if (roleTitle) {
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

        // Fetch Discord avatar if discord ID provided
        let picture = null;
        if (discord) {
            picture = await fetchDiscordAvatar(discord);
        }

        const member = await StaffMember.findByIdAndUpdate(id, {
            role_id: finalRoleId,
            name,
            email,
            discord,
            ...(picture && { picture })
        }, { new: true }).populate(['pilot_id', 'role_id']);

        return NextResponse.json({ success: true, member });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE: Remove staff member
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await dbConnect();
    try {
        await StaffMember.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
