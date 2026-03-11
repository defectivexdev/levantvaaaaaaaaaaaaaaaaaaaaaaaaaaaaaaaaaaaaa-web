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
    'LEVANT_MEMBERS': int(os.getenv('ROLE_LEVANT_MEMBERS_ID', '0')),
    # IVAO ATC Ratings
    'AS1': int(os.getenv('ROLE_AS1_ID', '0')),
    'AS2': int(os.getenv('ROLE_AS2_ID', '0')),
    'AS3': int(os.getenv('ROLE_AS3_ID', '0')),
    'ADC': int(os.getenv('ROLE_ADC_ID', '0')),
    'APC': int(os.getenv('ROLE_APC_ID', '0')),
    'ACC': int(os.getenv('ROLE_ACC_ID', '0')),
    'SAI': int(os.getenv('ROLE_SAI_ID', '0')),
    'CAI': int(os.getenv('ROLE_CAI_ID', '0')),
    # IVAO Pilot Ratings
    'FS1': int(os.getenv('ROLE_FS1_ID', '0')),
    'FS2': int(os.getenv('ROLE_FS2_ID', '0')),
    'FS3': int(os.getenv('ROLE_FS3_ID', '0')),
    'PP': int(os.getenv('ROLE_PP_ID', '0')),
    'SPP': int(os.getenv('ROLE_SPP_ID', '0')),
    'CP': int(os.getenv('ROLE_CP_ID', '0')),
    'ATP': int(os.getenv('ROLE_ATP_ID', '0')),
    'SFI': int(os.getenv('ROLE_SFI_ID', '0')),
    'CFI': int(os.getenv('ROLE_CFI_ID', '0')),
}

ATC_RATINGS = {
    2: {'name': 'AS1', 'role_key': 'AS1'},
    3: {'name': 'AS2', 'role_key': 'AS2'},
    4: {'name': 'AS3', 'role_key': 'AS3'},
    5: {'name': 'ADC', 'role_key': 'ADC'},
    6: {'name': 'APC', 'role_key': 'APC'},
    7: {'name': 'ACC', 'role_key': 'ACC'},
    8: {'name': 'SEC', 'role_key': None},  # SEC not in role list
    9: {'name': 'SAI', 'role_key': 'SAI'},
    10: {'name': 'CAI', 'role_key': 'CAI'},
}

PILOT_RATINGS = {
    2: {'name': 'FS1', 'role_key': 'FS1'},
    3: {'name': 'FS2', 'role_key': 'FS2'},
    4: {'name': 'FS3', 'role_key': 'FS3'},
    5: {'name': 'PP', 'role_key': 'PP'},
    6: {'name': 'SPP', 'role_key': 'SPP'},
    7: {'name': 'CP', 'role_key': 'CP'},
    8: {'name': 'ATP', 'role_key': 'ATP'},
    9: {'name': 'SFI', 'role_key': 'SFI'},
    10: {'name': 'CFI', 'role_key': 'CFI'},
}
