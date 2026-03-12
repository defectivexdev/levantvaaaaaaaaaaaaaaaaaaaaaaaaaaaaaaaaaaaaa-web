# Cloudflare Pages Deployment Guide (Free Tier)

This application uses **OpenNext adapter** for Cloudflare Pages, enabling full Next.js features (SSR, API routes, ISR) on Cloudflare's free tier.

## 🚀 Quick Start

### 1. Install Dependencies
Already installed:
```bash
npm install -D @opennextjs/cloudflare wrangler
```

### 2. Login to Cloudflare
```bash
npx wrangler login
```

### 3. Deploy to Cloudflare
```bash
npm run deploy
```

That's it! Your app will be deployed to Cloudflare Pages.

---

## 📋 Detailed Setup

### Environment Variables

Set these in Cloudflare Dashboard → Workers & Pages → Your Project → Settings → Environment Variables:

```env
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
NODE_ENV=production
```

---

## ⚙️ Cron Jobs Setup

Cloudflare Workers supports **Cron Triggers** for free!

### Option 1: Cloudflare Cron Triggers (Recommended)

Add to `wrangler.jsonc`:

```jsonc
{
  "name": "levant-virtual-airlines",
  "main": ".open-next/worker.js",
  "compatibility_date": "2024-09-23",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  },
  "triggers": {
    "crons": [
      "*/2 * * * *",    // Cleanup every 2 minutes
      "0 0 * * *",      // Daily tax at 00:00 UTC
      "0 0 * * 1"       // Weekly salary on Monday 00:00 UTC
    ]
  }
}
```

Then create `src/app/api/cron/scheduled/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { cron } = await request.json();
  
  // Route to appropriate cron handler based on schedule
  if (cron === '*/2 * * * *') {
    // Call cleanup
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cron/cleanup`);
  } else if (cron === '0 0 * * *') {
    // Call daily tax
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cron/weekly-tax`);
  } else if (cron === '0 0 * * 1') {
    // Call weekly salary
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cron/weekly-salary`);
  }
  
  return NextResponse.json({ success: true });
}
```

### Option 2: External Cron Service (cron-job.org)

1. Go to [cron-job.org](https://cron-job.org)
2. Create free account
3. Add these cron jobs:

   **Cleanup** (Every 2 minutes)
   - URL: `https://your-app.pages.dev/api/cron/cleanup`
   - Schedule: `*/2 * * * *`

   **Daily Tax** (00:00 UTC daily)
   - URL: `https://your-app.pages.dev/api/cron/weekly-tax`
   - Schedule: `0 0 * * *`

   **Weekly Salary** (Monday 00:00 UTC)
   - URL: `https://your-app.pages.dev/api/cron/weekly-salary`
   - Schedule: `0 0 * * 1`

---

## 🔧 Available Commands

```bash
# Development
npm run dev

# Build for Cloudflare
npm run cf:build

# Deploy to Cloudflare
npm run cf:deploy

# Preview locally with Cloudflare Workers
npm run cf:preview
```

---

## 🌐 Custom Domain

1. Go to Cloudflare Dashboard → Workers & Pages → Your Project
2. Click **Custom Domains** → **Set up a custom domain**
3. Enter your domain (must be on Cloudflare DNS)
4. Cloudflare will automatically configure DNS and SSL

---

## 📊 Cloudflare Free Tier Limits

✅ **Unlimited bandwidth**  
✅ **Unlimited requests** (with fair use)  
✅ **100,000 requests/day** for Workers  
✅ **10ms CPU time per request**  
✅ **Free SSL certificates**  
✅ **Global CDN**  
✅ **Cron Triggers** (up to 3 schedules)

---

## 🔍 IP Geolocation

Cloudflare provides these headers automatically:
- `cf-ipcountry` - Country code (e.g., "US", "GB")
- `cf-connecting-ip` - Client IP address
- `cf-ray` - Request ID

Code has been updated to use Cloudflare headers.

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear Next.js cache
rm -rf .next .open-next

# Rebuild
npm run cf:build
```

### Deployment Fails
```bash
# Re-login to Cloudflare
npx wrangler login

# Try deploying again
npm run cf:deploy
```

### Environment Variables Not Working
- Ensure they're set in Cloudflare Dashboard (not just `.env`)
- Redeploy after adding new variables

### Cron Jobs Not Running
- Check Cloudflare Dashboard → Workers & Pages → Your Project → Logs
- Verify cron triggers are configured in `wrangler.jsonc`
- Test endpoints manually first

---

## 📚 Resources

- [OpenNext Cloudflare Docs](https://opennext.js.org/cloudflare)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)

---

## 🎉 Benefits of Cloudflare

✅ **100% Free** for most use cases  
✅ **Global CDN** - Fast worldwide  
✅ **DDoS Protection** - Built-in  
✅ **Auto SSL** - Free certificates  
✅ **Edge Computing** - Low latency  
✅ **Full Next.js Support** - SSR, API routes, ISR  
✅ **Cron Triggers** - Built-in scheduling  
✅ **Analytics** - Free traffic insights
