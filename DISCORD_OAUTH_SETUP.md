# Discord OAuth2 Verification Setup Guide

This guide explains how to set up Discord OAuth2 for automatic role assignment without requiring slash commands.

## Overview

Users can now link their Discord account directly from the Levant VA profile page. When they click "Link Discord Account", they will:

1. Be redirected to Discord to authorize the application
2. Automatically join the Levant VA Discord server
3. Receive the **Levant Members** role immediately
4. Receive IVAO-based roles if they have verified their IVAO account

**No Discord commands needed!** Everything happens automatically through the web interface.

## Setup Steps

### 1. Get Discord OAuth2 Credentials

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your bot application (ID: `1440362476028952737`)
3. Go to **OAuth2** → **General**
4. Copy the **Client Secret**
5. Add this redirect URL:
   ```
   https://levant-va.com/api/discord/oauth/callback
   ```
   (For development, also add: `http://localhost:3000/api/discord/oauth/callback`)

### 2. Update Environment Variables

Edit `.env` and replace `YOUR_DISCORD_CLIENT_SECRET_HERE` with your actual client secret:

```env
DISCORD_CLIENT_SECRET=your_actual_client_secret_here
```

All other Discord OAuth2 variables are already configured:
- ✅ `DISCORD_CLIENT_ID=1440362476028952737`
- ✅ `DISCORD_GUILD_ID=1292816415866359869`
- ✅ `DISCORD_BOT_TOKEN=MTQ0...` (already set)
- ✅ All role IDs configured

### 3. Bot Permissions

Ensure your bot has these permissions in the Discord server:
- ✅ **Manage Roles** - To assign roles to members
- ✅ **Create Instant Invite** - To add members via OAuth2
- ✅ **View Channels** - Basic permission
- ✅ **Send Messages** - For notifications (optional)

**Important**: The bot's role must be **higher** in the role hierarchy than all the roles it assigns.

### 4. OAuth2 Scopes

The application requests these scopes:
- `identify` - Get user's Discord ID and username
- `guilds.join` - Add user to the Discord server automatically

## How It Works

### User Flow

1. **Profile Page**: User clicks "Link Discord Account" button
2. **Authorization**: Redirected to Discord OAuth2 page
3. **Approval**: User approves the connection
4. **Callback**: Discord redirects back to `/api/discord/oauth/callback`
5. **Processing**: 
   - User's Discord ID and username saved to database
   - User added to Discord server (if not already a member)
   - Levant Members role assigned immediately
   - IVAO roles assigned if account is verified
6. **Redirect**: User returned to profile page with success message

### Role Assignment Logic

**Always Assigned:**
- Levant Members role (ID: `1293262463940427869`)

**IVAO-Based Roles (if verified):**

| IVAO Rating | Role Assigned |
|-------------|---------------|
| ATC 4-6 (ADC/APC/ACC) | Assistant Director |
| ATC 7-9 (SEC/SAI/CAI) | Director |
| Pilot 5-6 (PP/SPP) | Assistant Web Master |
| Pilot 7-8 (CP/ATP) | Web Master |
| Pilot 9 (SFI) | Flight Manager |
| Pilot 10 (CFI) | Assistant Flight Manager |

## API Endpoints

### `GET /api/discord/verify-link`
Generates Discord OAuth2 authorization URL.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "authUrl": "https://discord.com/api/oauth2/authorize?..."
}
```

### `GET /api/discord/oauth/callback`
Handles Discord OAuth2 callback.

**Query Parameters:**
- `code` - Authorization code from Discord
- `state` - Base64-encoded pilot ID

**Actions:**
1. Exchanges code for access token
2. Fetches Discord user info
3. Updates pilot record with Discord ID
4. Adds user to Discord server
5. Assigns roles based on IVAO verification
6. Redirects to profile page

## Testing

### Test the OAuth Flow

1. Log into Levant VA portal
2. Go to Profile page
3. Scroll to "IVAO Verification" section
4. Click "Link Discord Account"
5. Approve the Discord authorization
6. Verify you're redirected back to profile
7. Check Discord server - you should be a member with Levant Members role

### Test IVAO Role Assignment

1. First, verify your IVAO account on the profile page
2. Then click "Link Discord Account"
3. Check Discord - you should have both Levant Members role and IVAO-based roles

### Re-linking

Users can re-link their Discord account anytime by clicking the button again. This is useful if:
- They left and rejoined the server
- Roles were manually removed
- IVAO ratings changed and they want to update roles

## Troubleshooting

### "Invalid OAuth2 redirect URI"
- Ensure the redirect URI is added in Discord Developer Portal
- Check that the URL matches exactly (including https://)

### User not added to server
- Verify bot has "Create Instant Invite" permission
- Check that `DISCORD_GUILD_ID` is correct
- Ensure bot is in the server

### Roles not assigned
- Bot's role must be higher than roles it assigns
- Verify role IDs in `.env` are correct
- Check bot has "Manage Roles" permission

### "Client secret is invalid"
- Get a new client secret from Discord Developer Portal
- Update `DISCORD_CLIENT_SECRET` in `.env`
- Restart the application

## Security Notes

- ✅ OAuth2 state parameter prevents CSRF attacks (contains pilot ID)
- ✅ JWT token required to generate auth URL
- ✅ Access tokens are used once and not stored
- ✅ Bot token kept secure in environment variables
- ✅ Client secret never exposed to frontend

## Comparison: OAuth2 vs Slash Commands

### OAuth2 Method (New - Automatic)
✅ No commands needed
✅ Automatic server join
✅ Immediate role assignment
✅ Better user experience
✅ Works from web interface

### Slash Commands (Old - Manual)
❌ Requires `/verify` command
❌ User must already be in server
❌ Manual process
❌ Requires Discord app
✅ Still available as fallback

## Files Created

```
src/
├── app/api/discord/
│   ├── oauth/callback/route.ts    # OAuth2 callback handler
│   └── verify-link/route.ts       # Auth URL generator
└── components/
    └── IVAOVerification.tsx        # Updated with Discord link button
```

## Environment Variables Summary

```env
# Required
DISCORD_CLIENT_ID=1440362476028952737
DISCORD_CLIENT_SECRET=<get from Discord Developer Portal>
DISCORD_GUILD_ID=1292816415866359869
DISCORD_BOT_TOKEN=MTQ0MDM2MjQ3NjAyODk1MjczNw.G7qzfl...
BASE_URL=https://levant-va.com

# Role IDs (already configured)
ROLE_LEVANT_MEMBERS_ID=1293262463940427869
ROLE_ADIR_ID=1440763539794169939
ROLE_DIR_ID=1440763280028336211
ROLE_AWM_ID=1440765576770224230
ROLE_WM_ID=1440764377665110027
ROLE_FM_ID=1440765742491631747
ROLE_AFM_ID=1440765823726915625
```

## Next Steps

1. ✅ Get Discord Client Secret from Developer Portal
2. ✅ Update `DISCORD_CLIENT_SECRET` in `.env`
3. ✅ Add OAuth2 redirect URI in Discord Developer Portal
4. ✅ Verify bot permissions in Discord server
5. ✅ Test the OAuth flow with a pilot account
6. ✅ Monitor logs for any errors

---

**System Version**: 1.0.0  
**Last Updated**: March 2026  
**Maintained by**: Levant VA Development Team
