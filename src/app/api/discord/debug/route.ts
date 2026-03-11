import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const debugInfo = {
        timestamp: new Date().toISOString(),
        environment: {
            hasClientId: !!process.env.DISCORD_CLIENT_ID,
            hasClientSecret: !!process.env.DISCORD_CLIENT_SECRET,
            hasBotToken: !!process.env.DISCORD_BOT_TOKEN,
            hasGuildId: !!process.env.DISCORD_GUILD_ID,
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecretPrefix: process.env.DISCORD_CLIENT_SECRET?.substring(0, 15) + '...',
            botTokenPrefix: process.env.DISCORD_BOT_TOKEN?.substring(0, 30) + '...',
            guildId: process.env.DISCORD_GUILD_ID,
        },
        roles: {
            levantMembers: process.env.ROLE_LEVANT_MEMBERS_ID,
            as1: process.env.ROLE_AS1_ID,
            as2: process.env.ROLE_AS2_ID,
            as3: process.env.ROLE_AS3_ID,
            adc: process.env.ROLE_ADC_ID,
            sec: process.env.ROLE_SEC_ID,
            sai: process.env.ROLE_SAI_ID,
            cai: process.env.ROLE_CAI_ID,
            pp: process.env.ROLE_PP_ID,
            sfi: process.env.ROLE_SFI_ID,
            cfi: process.env.ROLE_CFI_ID,
        }
    };

    return NextResponse.json(debugInfo, { status: 200 });
}
