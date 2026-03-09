const LOGO = 'https://levant-va.com/img/logo.png';
const FOOTER_MAIN = 'Levant Virtual Airlines';
const BANNER = 'https://levant-va.com/img/discord-banner.png';

const DISCORD_WEBHOOKS: Record<DiscordEvent, string> = {
    takeoff:      process.env.DISCORD_WEBHOOK_TAKEOFF       || '',
    landing:      process.env.DISCORD_WEBHOOK_LANDING       || '',
    rankPromote:  process.env.DISCORD_WEBHOOK_RANK_PROMOTE  || '',
    award:        process.env.DISCORD_WEBHOOK_AWARD         || process.env.DISCORD_WEBHOOK_RANK_PROMOTE || '',
    moderation:   process.env.DISCORD_MOD_WEBHOOK           || '',
};

type DiscordEvent = 'takeoff' | 'landing' | 'rankPromote' | 'award' | 'moderation';

interface DiscordEmbed {
    title?: string;
    description?: string;
    color?: number;
    fields?: { name: string; value: string; inline?: boolean }[];
    thumbnail?: { url: string };
    footer?: { text: string; icon_url?: string };
    timestamp?: string;
    image?: { url: string };
    author?: { name: string; icon_url?: string; url?: string };
}

export async function sendDiscordNotification(content: string, embeds?: DiscordEmbed[], event: DiscordEvent = 'moderation') {
    const webhookUrl = DISCORD_WEBHOOKS[event];
    if (!webhookUrl) return;

    try {
        const res = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, embeds, username: 'Levant Operations', avatar_url: LOGO }),
        });
        if (!res.ok) console.error(`Discord [${event}] failed:`, res.status, await res.text());
    } catch (err) {
        console.error(`Discord [${event}] error:`, err);
    }
}

export async function sendGroupFlightAnnouncement(event: any) {
    const webhookUrl = process.env.DISCORD_GROUP_FLIGHTS_WEBHOOK;
    if (!webhookUrl) {
        console.warn('DISCORD_GROUP_FLIGHTS_WEBHOOK not configured');
        return;
    }

    const date = new Date(event.startTime);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hoursRemaining = Math.floor(diff / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    let timeRemainStr = '';
    if (hoursRemaining > 24) {
        const days = Math.floor(hoursRemaining / 24);
        timeRemainStr = `${days} day${days > 1 ? 's' : ''}`;
    } else if (hoursRemaining > 0) {
        timeRemainStr = `${hoursRemaining}h ${minutesRemaining}m`;
    } else if (minutesRemaining > 0) {
        timeRemainStr = `${minutesRemaining} minutes`;
    } else {
        timeRemainStr = 'STARTING NOW';
    }

    const color = hoursRemaining > 24 ? 0x3498DB : hoursRemaining > 6 ? 0xF1C40F : 0xE67E22;

    try {
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                content: `<@&1478600173784404129> **New Group Flight Announced! | إعلان رحلة جماعية جديدة!**`,
                embeds: [{
                    author: { 
                        name: 'GROUP FLIGHT ANNOUNCEMENT | إعلان رحلة جماعية', 
                        icon_url: LOGO 
                    },
                    title: `\u{1F310} ${event.departureIcao} \u2192 ${event.arrivalIcao}`,
                    description: `Join us for a group flight from **${event.departureAirport || event.departureIcao}** to **${event.arrivalAirport || event.arrivalIcao}**!\nانضم إلينا في رحلة جماعية من **${event.departureAirport || event.departureIcao}** إلى **${event.arrivalAirport || event.arrivalIcao}**!`,
                    color,
                    fields: [
                        {
                            name: '\u{1F4C5} Date & Time | التاريخ والوقت',
                            value: `**${date.toISOString().replace('T', ' ').substring(0, 16)}Z**`,
                            inline: false
                        },
                        {
                            name: '\u{1F6EB} Departure | المغادرة',
                            value: `**${event.departureIcao}**\n${event.departureAirport || 'N/A'}`,
                            inline: true
                        },
                        {
                            name: '\u{1F6EC} Arrival | الوصول',
                            value: `**${event.arrivalIcao}**\n${event.arrivalAirport || 'N/A'}`,
                            inline: true
                        },
                        {
                            name: '\u{2708}\uFE0F Flight Time | مدة الرحلة',
                            value: event.estimatedFlightTime || 'TBD',
                            inline: true
                        },
                        {
                            name: '\u{1F4CD} Route | المسار',
                            value: event.route || '*Direct | مباشر*',
                            inline: false
                        },
                        {
                            name: '\u200B',
                            value: '\u200B',
                            inline: false
                        },
                        {
                            name: '\u26A0\uFE0F Important Notes | ملاحظات مهمة',
                            value: `\u{1F551} Arrive **${event.reminderMinutes || 15} minutes early** for briefing | الحضور قبل **${event.reminderMinutes || 15} دقيقة** للإحاطة\n\u{1F4B0} Attend this group flight automatically receive **1000 Credits** | احضر هذه الرحلة الجماعية واحصل تلقائياً على **1000 رصيد**`,
                            inline: false
                        }
                    ],
                    thumbnail: { url: LOGO },
                    footer: { 
                        text: 'Levant Virtual Airlines • Group Flights', 
                        icon_url: LOGO 
                    },
                    timestamp: date.toISOString()
                }],
                username: 'Levant VA Group Flights',
                avatar_url: LOGO,
                allowed_mentions: {
                    roles: ['1478600173784404129']
                }
            }),
        });
    } catch (error) {
        console.error('Discord group flight webhook error:', error);
        throw error;
    }
}

// Landing quality label
function getLandingGrade(rate: number): string {
    const abs = Math.abs(rate);
    if (abs <= 60) return '\u{1F9C8} Butter!';
    if (abs <= 150) return '\u2705 Smooth';
    if (abs <= 300) return '\u{1F44D} Acceptable';
    if (abs <= 500) return '\u26A0\uFE0F Firm';
    return '\u{1F4A5} Hard Landing';
}

export async function notifyRankPromotion(pilotName: string, pilotId: string, rankName: string, rankImageUrl?: string) {
    await sendDiscordNotification('', [{
        author: { name: 'RANK PROMOTION', icon_url: LOGO },
        title: `\u{1F396}\uFE0F ${pilotName} has been promoted!`,
        description: [
            `> **${pilotName}** (\`${pilotId}\`) has earned a new rank.`,
            '',
            `\u{1F451} **New Rank:** ${rankName}`,
            `\u{1F4CB} **Status:** Active Duty`,
            '',
            '*Congratulations on this achievement!*',
        ].join('\n'),
        color: 0xD4AF37,
        thumbnail: { url: rankImageUrl || 'https://i.pinimg.com/originals/f4/b3/aa/f4b3aaa7400915aa71fd58a2e3ed3bd7.gif' },
        footer: { text: FOOTER_MAIN, icon_url: LOGO },
        timestamp: new Date().toISOString(),
    }], 'rankPromote');
}

export async function notifyTakeoff(pilotName: string, pilotId: string, origin: string, destination: string, aircraft: string, callsign: string) {
    await sendDiscordNotification('', [{
        author: { name: 'FLIGHT DEPARTED', icon_url: LOGO },
        title: `\u{1F6EB} ${callsign} \u2014 Airborne from ${origin}`,
        description: [
            `> **${pilotName}** (\`${pilotId}\`) has departed.`,
            '',
            `\u{1F4CD} **Route:** \`${origin}\` \u2708\uFE0F \`${destination}\``,
            `\u{2708}\uFE0F **Aircraft:** ${aircraft}`,
            `\u{1F4E1} **Callsign:** ${callsign}`,
        ].join('\n'),
        color: 0x3498DB,
        thumbnail: { url: LOGO },
        footer: { text: FOOTER_MAIN, icon_url: LOGO },
        timestamp: new Date().toISOString(),
    }], 'takeoff');
}

export async function notifyLanding(pilotName: string, pilotId: string, destination: string, landingRate: number, score: number, callsign: string) {
    const grade = getLandingGrade(landingRate);
    const color = Math.abs(landingRate) <= 150 ? 0x2ECC71 : Math.abs(landingRate) <= 300 ? 0xF1C40F : Math.abs(landingRate) <= 500 ? 0xE67E22 : 0xE74C3C;

    await sendDiscordNotification('', [{
        author: { name: 'FLIGHT ARRIVED', icon_url: LOGO },
        title: `\u{1F6EC} ${callsign} \u2014 Landed at ${destination}`,
        description: [
            `> **${pilotName}** (\`${pilotId}\`) has completed their flight.`,
            '',
            `\u{1F4C9} **Landing Rate:** ${landingRate} fpm`,
            `\u{1F3AF} **Grade:** ${grade}`,
            `\u{2B50} **Flight Score:** ${score}/100`,
        ].join('\n'),
        color,
        thumbnail: { url: LOGO },
        footer: { text: FOOTER_MAIN, icon_url: LOGO },
        timestamp: new Date().toISOString(),
    }], 'landing');
}

const MOD_COLORS = { blacklist: 0xE74C3C, slew_detect: 0xFF6B35, hard_landing: 0xF39C12, cheat_flag: 0xE74C3C } as const;
const MOD_TITLES = { 
    blacklist: '\u{1F6AB} Pilot Blacklisted', 
    slew_detect: '\u26A0\uFE0F Slew / Teleport Detected', 
    hard_landing: '\u{1F4A5} Hard Landing Flagged', 
    cheat_flag: '\u{1F534} Cheat Flag Raised' 
} as const;

export type ModerationEvent = keyof typeof MOD_COLORS;

export async function notifyModeration(type: ModerationEvent, pilotName: string, pilotId: string, details: string) {
    await sendDiscordNotification('', [{
        author: { name: 'MODERATION ALERT', icon_url: LOGO },
        title: MOD_TITLES[type],
        description: [
            `> **Pilot:** ${pilotName} (\`${pilotId}\`)`,
            '',
            details,
        ].join('\n'),
        color: MOD_COLORS[type],
        footer: { text: `${FOOTER_MAIN} \u2022 Moderation System`, icon_url: LOGO },
        timestamp: new Date().toISOString(),
    }], 'moderation');
}

export async function notifyBlacklist(pilotName: string, pilotId: string, reason: string, adminId: string) {
    await notifyModeration('blacklist', pilotName, pilotId, `\u{1F4DD} **Reason:** ${reason}\n\u{1F6E1}\uFE0F **Blacklisted by:** ${adminId}`);
}

export async function notifyError(errorTitle: string, errorMessage: string, context?: string) {
    // Logging errors directly instead of Discord since errorLog is removed
    console.error(`[SYSTEM ALERT] ${errorTitle}\n${errorMessage}\n${context ? 'Context: ' + context : ''}`);
}
