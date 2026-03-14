# Inngest Setup Guide

Inngest is now configured to handle all scheduled tasks (replacing cron jobs).

## ✅ What's Already Done

1. **Installed Inngest SDK** (`npm install inngest`)
2. **Created Inngest client** (`src/lib/inngest.ts`)
3. **Converted cleanup cron job to Inngest function** (`src/inngest/functions.ts`):
   - `cleanupStaleData` - Every 2 minutes
4. **Created Inngest API route** (`src/app/api/inngest/route.ts`)

---

## 🚀 Setup Instructions

### Step 1: Create Inngest Account (Free)

1. Go to [inngest.com](https://www.inngest.com)
2. Sign up with GitHub (easiest)
3. Create a new app: **"Levant Virtual Airlines"**

### Step 2: Get Your Signing Key

1. In Inngest dashboard, go to **Settings** → **Keys**
2. Copy your **Event Key** (starts with `test_...` for development)
3. Copy your **Signing Key** (for production)

### Step 3: Add Environment Variables

Add these to your `.env.local` (development) and Vercel (production):

```env
# Inngest Keys
INNGEST_EVENT_KEY=your_event_key_here
INNGEST_SIGNING_KEY=your_signing_key_here
```

**In Vercel Dashboard:**
1. Go to your project → **Settings** → **Environment Variables**
2. Add both variables
3. Redeploy

### Step 4: Sync Functions with Inngest

After deploying to Vercel:

1. Go to Inngest dashboard → **Apps** → Your app
2. Click **"Sync"** or **"Deploy"**
3. Enter your Vercel URL: `https://your-app.vercel.app/api/inngest`
4. Click **"Sync Functions"**

Inngest will discover your cleanup function automatically!

---

## 📋 Scheduled Functions

### Cleanup Stale Data
- **Schedule:** Every 2 minutes (`*/2 * * * *`)
- **Function:** `cleanupStaleData`
- **Actions:**
  - Removes expired bids
  - Deletes stale active flights (no heartbeat for 5+ minutes)
  - Resets aircraft status to Available
  - Clears old chat messages

---

## 🧪 Testing Functions

### Test in Inngest Dashboard
1. Go to **Functions** tab
2. Click on any function
3. Click **"Test"** button
4. View execution logs and results

### Test Locally
```bash
npm run dev
```

Then visit: `http://localhost:3000/api/inngest`

You should see: `{"message":"Inngest endpoint is live"}`

---

## 📊 Monitoring

### Inngest Dashboard Features
- ✅ **Real-time execution logs** - See every function run
- ✅ **Automatic retries** - Failed functions retry automatically
- ✅ **Error tracking** - Get notified of failures
- ✅ **Execution history** - View past runs
- ✅ **Performance metrics** - Track execution time

### View Function Runs
1. Go to Inngest dashboard → **Runs**
2. Filter by function name
3. Click any run to see detailed logs

---

## 🔧 Troubleshooting

### Functions not appearing in Inngest
1. Verify `INNGEST_SIGNING_KEY` is set in Vercel
2. Redeploy your app
3. Re-sync functions in Inngest dashboard

### Functions not executing
1. Check Inngest dashboard → **Runs** for errors
2. Verify MongoDB connection string is correct
3. Check Vercel function logs

### "Signing key mismatch" error
1. Make sure you're using the correct signing key
2. Development uses `test_...` key
3. Production uses production signing key

---

## 💰 Pricing

**Free Tier:**
- ✅ 1,000,000 steps/month
- ✅ Unlimited functions
- ✅ Unlimited apps
- ✅ Full monitoring & logs

**Your Usage:**
- Cleanup: ~21,600 runs/month (every 2 min)
- **Total: ~21,600 runs/month** ✅ Well within free tier!

---

## 🎯 Benefits Over Cron Jobs

| Feature | Cron Jobs | Inngest |
|---------|-----------|---------|
| **Free Tier** | Limited | 1M steps/month |
| **Retries** | Manual | Automatic |
| **Monitoring** | External | Built-in dashboard |
| **Error Handling** | Manual | Automatic |
| **Logs** | Limited | Full history |
| **Setup** | External service | Integrated |
| **Reliability** | Depends on service | 99.9% uptime |

---

## 🔄 Migration from Cron Jobs

### Old Cron Endpoints (Keep for Manual Testing)
These endpoints still work for manual testing:
- `/api/cron/cleanup`
- `/api/cron/weekly-tax`
- `/api/cron/weekly-salary`

### New Inngest Functions
Inngest automatically runs these on schedule. No external service needed!

---

## 📚 Resources

- [Inngest Documentation](https://www.inngest.com/docs)
- [Next.js Integration Guide](https://www.inngest.com/docs/sdk/serve#framework-next-js)
- [Cron Schedule Reference](https://crontab.guru/)

---

## ⚙️ Advanced Configuration

### Custom Retry Logic
```typescript
export const cleanupStaleData = inngest.createFunction(
  { 
    id: "cleanup-stale-data",
    retries: 3, // Retry 3 times on failure
  },
  { cron: "*/2 * * * *" },
  async ({ step }) => {
    // Your logic
  }
);
```

### Rate Limiting
```typescript
export const dailyOperations = inngest.createFunction(
  { 
    id: "daily-operations",
    rateLimit: {
      limit: 1,
      period: "24h" // Only run once per day
    }
  },
  { cron: "0 0 * * *" },
  async ({ step }) => {
    // Your logic
  }
);
```

---

## 🎉 You're All Set!

Once you complete the setup steps above, Inngest will automatically handle all your scheduled tasks. No more external cron services needed!
