import os
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv('DISCORD_BOT_TOKEN')
GUILD_ID = int(os.getenv('DISCORD_GUILD_ID', '0'))
MONGODB_URI = os.getenv('MONGODB_URI')
WEB_API_URL = os.getenv('WEB_API_URL', 'https://levant-va.com')
BOT_SECRET = os.getenv('DISCORD_BOT_SECRET')

ROLES = {
    'CEO': int(os.getenv('ROLE_CEO_ID', '0')),
    'PR': int(os.getenv('ROLE_PR_ID', '0')),
    'AFM': int(os.getenv('ROLE_AFM_ID', '0')),
    'FM': int(os.getenv('ROLE_FM_ID', '0')),
    'WM': int(os.getenv('ROLE_WM_ID', '0')),
    'AWM': int(os.getenv('ROLE_AWM_ID', '0')),
    'ADIR': int(os.getenv('ROLE_ADIR_ID', '0')),
    'DIR': int(os.getenv('ROLE_DIR_ID', '0')),
    'LEVANT_MEMBERS': int(os.getenv('ROLE_LEVANT_MEMBERS_ID', '0')),
}

ATC_RATINGS = {
    2: {'name': 'AS1', 'role_key': None},
    3: {'name': 'AS2', 'role_key': None},
    4: {'name': 'AS3', 'role_key': None},
    5: {'name': 'ADC', 'role_key': 'ADIR'},
    6: {'name': 'APC', 'role_key': 'ADIR'},
    7: {'name': 'ACC', 'role_key': 'ADIR'},
    8: {'name': 'SEC', 'role_key': 'DIR'},
    9: {'name': 'SAI', 'role_key': 'DIR'},
    10: {'name': 'CAI', 'role_key': 'DIR'},
}

PILOT_RATINGS = {
    2: {'name': 'FS1', 'role_key': None},
    3: {'name': 'FS2', 'role_key': None},
    4: {'name': 'FS3', 'role_key': None},
    5: {'name': 'PP', 'role_key': 'AWM'},
    6: {'name': 'SPP', 'role_key': 'AWM'},
    7: {'name': 'CP', 'role_key': 'WM'},
    8: {'name': 'ATP', 'role_key': 'WM'},
    9: {'name': 'SFI', 'role_key': 'FM'},
    10: {'name': 'CFI', 'role_key': 'AFM'},
}
