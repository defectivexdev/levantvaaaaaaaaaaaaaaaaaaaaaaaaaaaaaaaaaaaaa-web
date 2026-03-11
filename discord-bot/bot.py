import discord
from discord import app_commands
from discord.ext import commands, tasks
import asyncio
import aiohttp
import config
from utils import connect_database, get_database, assign_roles_to_member, get_rating_name, fetch_web_config

intents = discord.Intents.default()
intents.members = True
intents.guilds = True

bot = commands.Bot(command_prefix='!', intents=intents)

async def get_live_pilots() -> int:
    """Fetch live pilot count from ACARS API"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f'{config.WEB_API_URL}/api/acars/online',
                timeout=aiohttp.ClientTimeout(total=5)
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get('online', 0)
    except Exception as e:
        print(f'Error fetching live pilots: {e}')
    return 0

@tasks.loop(minutes=2)
async def update_status():
    """Update bot status with live pilot count every 2 minutes"""
    try:
        pilot_count = await get_live_pilots()
        activity_text = f'{pilot_count} pilot{"s" if pilot_count != 1 else ""} flying'
        await bot.change_presence(
            activity=discord.Activity(
                type=discord.ActivityType.watching,
                name=activity_text
            ),
            status=discord.Status.online
        )
        print(f'Updated status: {activity_text}')
    except Exception as e:
        print(f'Error updating status: {e}')

@bot.event
async def on_ready():
    """Bot ready event"""
    print(f'Logged in as {bot.user.name} ({bot.user.id})')
    
    try:
        # Fetch web config
        web_config = await fetch_web_config()
        print(f'Web API URL: {web_config["web_api_url"]}')
        
        # Connect to database
        connect_database()
        print('Bot is ready and connected to database!')
        
        # Sync commands
        guild = discord.Object(id=config.GUILD_ID)
        bot.tree.copy_global_to(guild=guild)
        await bot.tree.sync(guild=guild)
        print(f'Synced commands to guild {config.GUILD_ID}')
        
        # Start status update task
        if not update_status.is_running():
            update_status.start()
            print('Started live pilot count status updates')
    except Exception as e:
        print(f'Error during bot initialization: {e}')

@bot.tree.command(name='verify', description='Verify your IVAO account and get roles')
@app_commands.describe(pilot_id='Your Levant VA Pilot ID (e.g., LVA001)')
async def verify(interaction: discord.Interaction, pilot_id: str):
    """Verify IVAO account and assign roles"""
    await interaction.response.defer(ephemeral=True)
    
    try:
        pilot_id = pilot_id.upper()
        discord_id = str(interaction.user.id)
        discord_username = f'{interaction.user.name}#{interaction.user.discriminator}'
        
        db = get_database()
        pilots = db['pilots']
        verifications = db['ivaoverifications']
        
        # Find pilot
        pilot = pilots.find_one({'pilot_id': pilot_id})
        if not pilot:
            await interaction.followup.send('❌ Pilot ID not found. Please check your Pilot ID and try again.', ephemeral=True)
            return
        
        # Check IVAO verification
        if not pilot.get('ivao_verified') or not pilot.get('ivao_vid'):
            await interaction.followup.send('❌ You have not linked your IVAO account yet. Please link your IVAO account on the Levant VA profile page first.', ephemeral=True)
            return
        
        # Update pilot with Discord info
        pilots.update_one(
            {'pilot_id': pilot_id},
            {'$set': {
                'discord_id': discord_id,
                'discord_username': discord_username
            }}
        )
        
        # Get verification data
        verification = verifications.find_one({'pilot_id': pilot_id})
        if not verification:
            await interaction.followup.send('❌ IVAO verification data not found. Please re-link your IVAO account on the profile page.', ephemeral=True)
            return
        
        # Assign roles
        atc_rating = verification.get('atc_rating', 1)
        pilot_rating = verification.get('pilot_rating', 2)
        
        member = interaction.user
        role_result = await assign_roles_to_member(member, atc_rating, pilot_rating)
        
        if not role_result['success']:
            await interaction.followup.send(f'❌ Failed to assign roles: {role_result.get("error")}', ephemeral=True)
            return
        
        # Update verification
        verifications.update_one(
            {'pilot_id': pilot_id},
            {'$set': {'discord_roles_assigned': True}}
        )
        
        # Create embed
        embed = discord.Embed(
            title='✅ IVAO Verification Successful',
            description=f'Welcome to Levant Virtual Airlines, {pilot["first_name"]} {pilot["last_name"]}!',
            color=discord.Color.green()
        )
        embed.add_field(name='Pilot ID', value=pilot_id, inline=True)
        embed.add_field(name='IVAO VID', value=verification['ivao_vid'], inline=True)
        embed.add_field(name='\u200b', value='\u200b', inline=False)
        embed.add_field(name='ATC Rating', value=get_rating_name('atc', atc_rating), inline=True)
        embed.add_field(name='Pilot Rating', value=get_rating_name('pilot', pilot_rating), inline=True)
        embed.add_field(name='Roles Assigned', value=f'{role_result["roles_assigned"]} role(s)' if role_result["roles_assigned"] > 0 else 'No new roles', inline=True)
        embed.set_footer(text='Levant Virtual Airlines')
        embed.timestamp = discord.utils.utcnow()
        
        await interaction.followup.send(embed=embed, ephemeral=True)
    except Exception as e:
        print(f'Verification error: {e}')
        await interaction.followup.send('❌ An error occurred during verification. Please try again later.', ephemeral=True)

@bot.tree.command(name='sync', description='Sync your IVAO ratings and update Discord roles')
async def sync(interaction: discord.Interaction):
    """Sync IVAO ratings and update roles"""
    await interaction.response.defer(ephemeral=True)
    
    try:
        discord_id = str(interaction.user.id)
        
        db = get_database()
        pilots = db['pilots']
        verifications = db['ivaoverifications']
        
        # Find pilot by Discord ID
        pilot = pilots.find_one({'discord_id': discord_id})
        if not pilot:
            await interaction.followup.send('❌ Your Discord account is not linked. Please use `/verify` first.', ephemeral=True)
            return
        
        # Check IVAO verification
        if not pilot.get('ivao_verified') or not pilot.get('ivao_vid'):
            await interaction.followup.send('❌ You have not linked your IVAO account yet. Please link your IVAO account on the Levant VA profile page first.', ephemeral=True)
            return
        
        # Get verification data
        verification = verifications.find_one({'pilot_id': pilot['pilot_id']})
        if not verification:
            await interaction.followup.send('❌ IVAO verification data not found.', ephemeral=True)
            return
        
        # Assign roles
        atc_rating = verification.get('atc_rating', 1)
        pilot_rating = verification.get('pilot_rating', 2)
        
        member = interaction.user
        role_result = await assign_roles_to_member(member, atc_rating, pilot_rating)
        
        if not role_result['success']:
            await interaction.followup.send(f'❌ Failed to update roles: {role_result.get("error")}', ephemeral=True)
            return
        
        # Create embed
        embed = discord.Embed(
            title='🔄 IVAO Sync Successful',
            description='Your IVAO ratings and Discord roles have been synchronized.',
            color=discord.Color.blue()
        )
        embed.add_field(name='Pilot ID', value=pilot['pilot_id'], inline=True)
        embed.add_field(name='IVAO VID', value=verification['ivao_vid'], inline=True)
        embed.add_field(name='\u200b', value='\u200b', inline=False)
        embed.add_field(name='ATC Rating', value=get_rating_name('atc', atc_rating), inline=True)
        embed.add_field(name='Pilot Rating', value=get_rating_name('pilot', pilot_rating), inline=True)
        embed.add_field(name='Roles Updated', value=f'{role_result["roles_assigned"]} new role(s)' if role_result["roles_assigned"] > 0 else 'All roles up to date', inline=True)
        embed.set_footer(text='Levant Virtual Airlines')
        embed.timestamp = discord.utils.utcnow()
        
        await interaction.followup.send(embed=embed, ephemeral=True)
    except Exception as e:
        print(f'Sync error: {e}')
        await interaction.followup.send('❌ An error occurred during sync. Please try again later.', ephemeral=True)

@bot.tree.command(name='ivao', description='Check your IVAO verification status')
async def ivao(interaction: discord.Interaction):
    """Check IVAO verification status"""
    await interaction.response.defer(ephemeral=True)
    
    try:
        discord_id = str(interaction.user.id)
        
        db = get_database()
        pilots = db['pilots']
        verifications = db['ivaoverifications']
        
        # Find pilot by Discord ID
        pilot = pilots.find_one({'discord_id': discord_id})
        if not pilot:
            await interaction.followup.send('❌ Your Discord account is not linked. Please use `/verify` first with your Pilot ID.', ephemeral=True)
            return
        
        # Get verification data
        verification = verifications.find_one({'pilot_id': pilot['pilot_id']})
        
        if not pilot.get('ivao_verified') or not verification:
            embed = discord.Embed(
                title='❌ IVAO Not Verified',
                description='You have not linked your IVAO account yet.',
                color=discord.Color.red()
            )
            embed.add_field(name='Pilot ID', value=pilot['pilot_id'], inline=True)
            embed.add_field(name='Status', value='Not Verified', inline=True)
            embed.add_field(name='\u200b', value='\u200b', inline=False)
            embed.add_field(
                name='Next Steps',
                value='1. Go to your Levant VA profile page\n2. Enter your IVAO VID\n3. Click "Verify IVAO Account"\n4. Return here and use `/sync`',
                inline=False
            )
            embed.set_footer(text='Levant Virtual Airlines')
            embed.timestamp = discord.utils.utcnow()
            
            await interaction.followup.send(embed=embed, ephemeral=True)
            return
        
        # Create verified embed
        atc_rating = verification.get('atc_rating', 1)
        pilot_rating = verification.get('pilot_rating', 2)
        
        embed = discord.Embed(
            title='✅ IVAO Verification Status',
            description=f'Account verified and linked to {pilot["first_name"]} {pilot["last_name"]}',
            color=discord.Color.green()
        )
        embed.add_field(name='Pilot ID', value=pilot['pilot_id'], inline=True)
        embed.add_field(name='IVAO VID', value=verification['ivao_vid'], inline=True)
        embed.add_field(name='\u200b', value='\u200b', inline=False)
        embed.add_field(name='ATC Rating', value=get_rating_name('atc', atc_rating), inline=True)
        embed.add_field(name='Pilot Rating', value=get_rating_name('pilot', pilot_rating), inline=True)
        embed.add_field(
            name='Discord Roles',
            value='✅ Assigned' if verification.get('discord_roles_assigned') else '❌ Not Assigned',
            inline=True
        )
        
        if verification.get('last_sync'):
            from datetime import datetime
            last_sync = verification['last_sync']
            if isinstance(last_sync, str):
                last_sync = datetime.fromisoformat(last_sync.replace('Z', '+00:00'))
            embed.add_field(name='\u200b', value='\u200b', inline=False)
            embed.add_field(name='Last Sync', value=last_sync.strftime('%Y-%m-%d %H:%M:%S UTC'), inline=False)
        
        embed.set_footer(text='Levant Virtual Airlines')
        embed.timestamp = discord.utils.utcnow()
        
        await interaction.followup.send(embed=embed, ephemeral=True)
    except Exception as e:
        print(f'IVAO status check error: {e}')
        await interaction.followup.send('❌ An error occurred while checking your status. Please try again later.', ephemeral=True)

@bot.event
async def on_error(event, *args, **kwargs):
    """Handle errors"""
    print(f'Discord client error in {event}')
    import traceback
    traceback.print_exc()

if __name__ == '__main__':
    bot.run(config.TOKEN)
