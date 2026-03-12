# Railway Deployment Guide

This application is configured to deploy on Railway.app instead of Vercel.

## Quick Start

1. **Connect to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign in with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select this repository

2. **Environment Variables**
   Set these in Railway dashboard (Settings → Variables):
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NEXTAUTH_SECRET=your_nextauth_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   DISCORD_CLIENT_ID=your_discord_client_id
   DISCORD_CLIENT_SECRET=your_discord_client_secret
   DISCORD_BOT_TOKEN=your_discord_bot_token
   DISCORD_GUILD_ID=your_discord_guild_id
   PUSHER_APP_ID=your_pusher_app_id
   PUSHER_KEY=your_pusher_key
   PUSHER_SECRET=your_pusher_secret
   PUSHER_CLUSTER=your_pusher_cluster
   SMTP_HOST=your_smtp_host
   SMTP_PORT=your_smtp_port
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_password
   NEXT_PUBLIC_API_URL=https://your-railway-domain.railway.app
   NODE_ENV=production
   ```

3. **Deploy**
   - Railway will automatically deploy on every push to `main` branch
   - Build command: `npm run build`
   - Start command: `npm start`

## Cron Jobs

Railway doesn't have built-in cron jobs like Vercel. Use external services:

### Option 1: cron-job.org (Recommended)
1. Go to [cron-job.org](https://cron-job.org)
2. Create free account
3. Add these cron jobs:

   **Daily Tax/Operations** (00:00 UTC daily)
   - URL: `https://your-app.railway.app/api/cron/weekly-tax`
   - Schedule: `0 0 * * *`

   **Weekly Salary** (Monday 00:00 UTC)
   - URL: `https://your-app.railway.app/api/cron/weekly-salary`
   - Schedule: `0 0 * * 1`

   **Cleanup** (Every 2 minutes)
   - URL: `https://your-app.railway.app/api/cron/cleanup`
   - Schedule: `*/2 * * * *`

### Option 2: GitHub Actions
See `.github/workflows/cron.yml` for automated cron jobs via GitHub Actions.

## Differences from Vercel

### IP Geolocation Headers
- **Vercel:** `x-vercel-ip-country`
- **Railway:** `cf-ipcountry` (Cloudflare headers)
- Code has been updated to use Railway/Cloudflare headers

### CORS Headers
- Configured in `next.config.js` instead of `vercel.json`
- Railway respects Next.js native header configuration

### Build Configuration
- Uses `nixpacks.toml` for build configuration
- Uses `Procfile` for start command
- Uses `railway.json` for Railway-specific settings

## Monitoring

Railway provides:
- Real-time logs in dashboard
- Metrics (CPU, Memory, Network)
- Deployment history
- Automatic HTTPS

## Custom Domain

1. Go to Railway dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_API_URL` environment variable

## Troubleshooting

### Build Fails
- Check Railway logs in dashboard
- Verify all environment variables are set
- Ensure `package.json` has correct Node version

### App Crashes
- Check Railway logs for errors
- Verify MongoDB connection string
- Check memory usage (upgrade plan if needed)

### Cron Jobs Not Working
- Verify external cron service is configured
- Check cron job URLs are correct
- Test endpoints manually first

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
