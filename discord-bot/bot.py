import discord
from discord.ext import commands, tasks
import aiohttp
import config
from utils import fetch_web_config

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
        
        print('Bot is ready! All verification is handled via web OAuth2.')
        print('No slash commands available - users should link accounts at the profile page.')
        
        # Start status update task
        if not update_status.is_running():
            update_status.start()
            print('Started live pilot count status updates')
    except Exception as e:
        print(f'Error during bot initialization: {e}')

# All slash commands removed - verification handled via web OAuth2 only

@bot.event
async def on_error(event, *args, **kwargs):
    """Handle errors"""
    print(f'Discord client error in {event}')
    import traceback
    traceback.print_exc()

if __name__ == '__main__':
    bot.run(config.TOKEN)
