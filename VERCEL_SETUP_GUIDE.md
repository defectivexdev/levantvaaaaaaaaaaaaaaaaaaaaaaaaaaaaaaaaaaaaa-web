# Vercel Deployment Setup Guide

## How to Get Your Vercel Token and Configure GitHub Secrets

### Step 1: Get Your Vercel API Token

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/account/tokens

2. **Create a New Token**
   - Click **"Create Token"** or **"Create"**
   - Give it a name (e.g., "GitHub Actions CI/CD")
   - Select scope: **Full Account** (recommended for CI/CD)
   - Set expiration: **No Expiration** or choose a duration
   - Click **"Create Token"**

3. **Copy the Token**
   - ⚠️ **IMPORTANT:** Copy the token immediately - you won't be able to see it again!
   - Store it securely (you'll need it in the next step)

### Step 2: Get Your Vercel Organization ID and Project ID

#### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Link Your Project**
   ```bash
   cd "c:\Users\Administrator\Desktop\Levant Virtual Airlines"
   vercel link
   ```

4. **Get Your IDs**
   - After linking, check the `.vercel/project.json` file:
   ```bash
   cat .vercel/project.json
   ```
   
   You'll see something like:
   ```json
   {
     "orgId": "team_xxxxxxxxxxxxx",
     "projectId": "prj_xxxxxxxxxxxxx"
   }
   ```

#### Option B: From Vercel Dashboard

1. **Get Organization ID**
   - Go to: https://vercel.com/account
   - Click on your team/organization name
   - Look at the URL: `https://vercel.com/[team-name]/settings`
   - Or check Settings → General → Team ID

2. **Get Project ID**
   - Go to your project: https://vercel.com/[team-name]/[project-name]
   - Click **Settings**
   - Scroll to **General** section
   - Find **Project ID**

### Step 3: Add Secrets to GitHub Repository

1. **Go to Your GitHub Repository**
   - Visit: https://github.com/defectivexdev/levantvaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-web

2. **Navigate to Settings**
   - Click **Settings** tab (top right)
   - Click **Secrets and variables** → **Actions** (left sidebar)

3. **Add Repository Secrets**
   Click **"New repository secret"** for each of these:

   **Secret 1: VERCEL_TOKEN**
   - Name: `VERCEL_TOKEN`
   - Value: [Paste the token you copied from Step 1]
   - Click **"Add secret"**

   **Secret 2: VERCEL_ORG_ID**
   - Name: `VERCEL_ORG_ID`
   - Value: [Your organization ID from Step 2]
   - Click **"Add secret"**

   **Secret 3: VERCEL_PROJECT_ID**
   - Name: `VERCEL_PROJECT_ID`
   - Value: [Your project ID from Step 2]
   - Click **"Add secret"**

### Step 4: Verify Setup

After adding all three secrets, your GitHub Actions workflow will automatically:
- ✅ Deploy preview builds for pull requests
- ✅ Deploy production builds when pushing to main branch

### Troubleshooting

#### "No existing credentials found" Error
- Make sure `VERCEL_TOKEN` is set correctly
- Verify the token hasn't expired
- Ensure the token has proper permissions

#### "Project not found" Error
- Double-check `VERCEL_PROJECT_ID` matches your project
- Verify `VERCEL_ORG_ID` is correct
- Make sure the project exists in your Vercel account

#### Deployment Fails
- Check that your project is properly configured in Vercel
- Verify build settings match your Next.js configuration
- Review Vercel deployment logs for specific errors

### Current Status

Your CI/CD pipeline is configured to:
- Skip Vercel deployment if `VERCEL_TOKEN` is not set (no errors)
- Automatically deploy when all three secrets are configured

### Quick Reference

**Required GitHub Secrets:**
```
VERCEL_TOKEN         - Your Vercel API token
VERCEL_ORG_ID        - Your Vercel organization/team ID
VERCEL_PROJECT_ID    - Your Vercel project ID
```

**Vercel Links:**
- Tokens: https://vercel.com/account/tokens
- Dashboard: https://vercel.com/dashboard
- Documentation: https://vercel.com/docs/cli

---

**Note:** Once you add these secrets, the next push to `main` or pull request will automatically trigger Vercel deployments.
