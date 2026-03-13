import aiohttp
import config

async def fetch_web_config() -> dict:
    """Fetch web API configuration"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f'{config.WEB_API_URL}/api/config/bot',
                headers={'x-bot-secret': config.BOT_SECRET},
                timeout=aiohttp.ClientTimeout(total=5)
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    print('✅ Successfully fetched web API configuration')
                    return {
                        'web_api_url': data.get('web_api_url'),
                        'mongodb_uri': data.get('mongodb_uri')
                    }
    except Exception as e:
        print(f'⚠️ Could not fetch web config, using environment variables: {e}')
    
    return {
        'web_api_url': config.WEB_API_URL,
        'mongodb_uri': config.MONGODB_URI
    }
