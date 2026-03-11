# Levant Virtual Airlines - IVAO Discord Bot (Python)

This Discord bot handles IVAO verification and automatic role assignment for Levant Virtual Airlines members.

## Features

- **IVAO Verification**: Link Discord accounts with IVAO accounts
- **Automatic Role Assignment**: Assigns Discord roles based on IVAO ATC and Pilot ratings
- **Role Sync**: Update roles when IVAO ratings change
- **Status Check**: View current IVAO verification status
- **OAuth2 Integration**: Works seamlessly with web-based Discord linking

## Setup Instructions

### 1. Install Python Dependencies

Make sure you have Python 3.8+ installed, then:

```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Edit the `.env` file and update the following:

- `DISCORD_GUILD_ID`: Your Discord server ID
- `MONGODB_URI`: Your MongoDB connection string (same as the web app)
- `WEB_API_URL`: URL of your Levant VA web application (e.g., `http://localhost:3000` for development)
- `DISCORD_BOT_SECRET`: A secret key for API communication (generate a random string)

**Important**: Add the same `DISCORD_BOT_SECRET` to your web application's `.env` file.

### 3. Bot Permissions

Make sure your Discord bot has the following permissions:
- Manage Roles
- View Channels
- Send Messages
- Use Slash Commands

The bot's role must be higher in the hierarchy than the roles it needs to assign.

### 4. Start the Bot

```bash
python bot.py
```

Or on Windows:
```bash
py bot.py
```

## Available Commands

### `/verify <pilot_id>`
Link your Discord account with your Levant VA account and receive roles based on your IVAO ratings.

**Example**: `/verify LVA001`

### `/sync`
Sync your IVAO ratings and update your Discord roles. Use this after your IVAO ratings change.

### `/ivao`
Check your current IVAO verification status and role assignment.

## Role Assignment Logic

### ATC Ratings
- **ADC (4), APC (5), ACC (6)** → Assistant Director role
- **SEC (7), SAI (8), CAI (9)** → Director role

### Pilot Ratings
- **PP (5), SPP (6)** → Assistant Web Master role
- **CP (7), ATP (8)** → Web Master role
- **SFI (9)** → Flight Manager role
- **CFI (10)** → Assistant Flight Manager role

### All Verified Members
- **Levant Members** role (assigned to all verified users)

## How It Works

1. User links their IVAO account on the Levant VA profile page
2. User runs `/verify <pilot_id>` in Discord
3. Bot fetches verification data from the database
4. Bot assigns appropriate roles based on IVAO ratings
5. User can run `/sync` anytime to update roles after rating changes

## Troubleshooting

### Bot not responding to commands
- Check if the bot is online
- Verify the bot has proper permissions
- Check console logs for errors

### Roles not being assigned
- Ensure the bot's role is higher than the roles it's trying to assign
- Check that role IDs in `.env` are correct
- Verify the bot has "Manage Roles" permission

### Database connection issues
- Verify `MONGODB_URI` is correct
- Ensure the database is accessible from the bot's network
- Check MongoDB connection logs
- Install `dnspython` for MongoDB SRV connections: `pip install dnspython`

### Python-specific issues
- Make sure Python 3.8+ is installed: `python --version`
- Install dependencies: `pip install -r requirements.txt`
- Check for module import errors in console

## File Structure

```
discord-bot/
├── bot.py                    # Main bot file
├── config.py                 # Configuration and environment variables
├── requirements.txt          # Python dependencies
├── .env                      # Environment variables
├── utils/
│   ├── __init__.py          # Utils package init
│   ├── database.py          # MongoDB connection
│   ├── role_manager.py      # Role assignment logic
│   └── config_fetcher.py    # Web API config fetcher
└── README.md                # This file
```

## Support

For issues or questions, contact the Levant VA development team.
