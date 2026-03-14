# 🚀 Deployment Guide - GitHub & Vercel

## 📋 Quick Deploy Steps

### 1️⃣ Prepare for Deployment

```bash
cd frontend

# Ensure build works
npm run build

# Test production build locally
npm start
```

### 2️⃣ Commit to Git

```bash
# Add all files
git add .

# Commit with message
git commit -m "Release v1.0.0 - Production ready ACARS"

# Create version tag
git tag -a v1.0.0 -m "Version 1.0.0 - Initial production release"

# Push to GitHub
git push origin main
git push origin v1.0.0
```

### 3️⃣ Deploy to Vercel

**Option A: Vercel CLI (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

**Option B: Vercel Dashboard**
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import from GitHub
4. Select your repository
5. Configure:
   - Framework Preset: **Next.js**
   - Root Directory: **frontend**
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. Click "Deploy"

---

## 📦 Detailed Instructions

### Step 1: Prepare Repository

#### Check Git Status
```bash
git status
```

#### Update .gitignore (Already configured)
```gitignore
# dependencies
/node_modules
/.pnp
.pnp.js

# next.js
/.next/
/out/
/dist/

# production
/build

# env files
.env*.local

# vercel
.vercel
```

### Step 2: Commit Changes

#### Stage All Files
```bash
# Add all changes
git add .

# Check what will be committed
git status
```

#### Commit with Descriptive Message
```bash
git commit -m "Release v1.0.0 - Production ready ACARS

Features:
- Migrated from Vite to Next.js 15
- Enhanced UI with modern design
- FSUIPC/XPUIPC integration
- Beautiful glassmorphism effects
- Production build optimized
- ESLint and TypeScript fixes
- Custom MSI installer ready
"
```

### Step 3: Create Git Tag

#### Create Annotated Tag
```bash
# Create tag v1.0.0
git tag -a v1.0.0 -m "Version 1.0.0 - Initial Production Release

Release Notes:
- Complete migration to Next.js 15
- Modern UI with animations
- FSUIPC integration verified
- Production optimized
- Ready for deployment
"

# Verify tag created
git tag -l
```

#### View Tag Details
```bash
git show v1.0.0
```

### Step 4: Push to GitHub

#### Push Code and Tags
```bash
# Push main branch
git push origin main

# Push all tags
git push origin --tags

# Or push specific tag
git push origin v1.0.0
```

#### Verify on GitHub
1. Go to your repository
2. Check "Releases" section
3. Tag v1.0.0 should appear
4. Create GitHub Release from tag (optional)

### Step 5: Deploy to Vercel

#### Method 1: Vercel CLI (Recommended)

**Install Vercel CLI:**
```bash
npm install -g vercel
```

**Login:**
```bash
vercel login
```

**Deploy to Production:**
```bash
# Navigate to frontend folder
cd frontend

# Deploy to production
vercel --prod

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No (first time)
# - Project name? levant-acars
# - Directory? ./
# - Override settings? No
```

**Get Deployment URL:**
```bash
# Your app will be deployed to:
# https://levant-acars.vercel.app
# or custom domain
```

#### Method 2: Vercel Dashboard

**1. Connect GitHub:**
- Go to https://vercel.com/new
- Click "Import Git Repository"
- Authorize Vercel to access GitHub
- Select your repository

**2. Configure Project:**
```
Framework Preset: Next.js
Root Directory: frontend (if not in root)
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Development Command: npm run dev
```

**3. Environment Variables:**
```
# Add if needed (for production)
NEXT_PUBLIC_API_URL=https://levant-va.com/api
NODE_ENV=production
```

**4. Deploy:**
- Click "Deploy"
- Wait for build to complete
- Get deployment URL

---

## 🔧 Vercel Configuration

### vercel.json (Already created)
```json
{
  "version": 2,
  "name": "levant-acars",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

### next.config.mjs (Check settings)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // For static export
  images: {
    unoptimized: true
  }
}

export default nextConfig
```

---

## 🌐 Custom Domain (Optional)

### Add Custom Domain to Vercel

**1. Go to Project Settings:**
- Vercel Dashboard → Your Project → Settings → Domains

**2. Add Domain:**
```
acars.levant-va.com
```

**3. Configure DNS:**
```
Type: CNAME
Name: acars
Value: cname.vercel-dns.com
```

**4. Verify:**
- Wait for DNS propagation (5-30 minutes)
- Vercel will auto-provision SSL certificate

---

## 📊 Deployment Checklist

### Pre-Deployment
- [ ] Build passes locally (`npm run build`)
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] All dependencies installed
- [ ] .gitignore configured
- [ ] Environment variables set

### Git & GitHub
- [ ] All changes committed
- [ ] Tag v1.0.0 created
- [ ] Pushed to GitHub
- [ ] Tag visible on GitHub
- [ ] GitHub Release created (optional)

### Vercel
- [ ] Vercel account created
- [ ] Repository connected
- [ ] Build configuration correct
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] Site accessible
- [ ] SSL certificate active

### Post-Deployment
- [ ] Test all features
- [ ] Check performance
- [ ] Verify API connections
- [ ] Test on different devices
- [ ] Monitor error logs

---

## 🎯 Git Commands Reference

### Basic Workflow
```bash
# Check status
git status

# Add files
git add .
git add <specific-file>

# Commit
git commit -m "message"

# Push
git push origin main

# Create tag
git tag -a v1.0.0 -m "message"

# Push tag
git push origin v1.0.0
git push origin --tags

# View tags
git tag -l

# Delete tag (if needed)
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0
```

### Version Tagging
```bash
# Semantic versioning: v{major}.{minor}.{patch}

# Major release (breaking changes)
git tag -a v2.0.0 -m "Major release"

# Minor release (new features)
git tag -a v1.1.0 -m "New features"

# Patch release (bug fixes)
git tag -a v1.0.1 -m "Bug fixes"
```

---

## 🚀 Vercel Commands Reference

### CLI Commands
```bash
# Install
npm i -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# List deployments
vercel ls

# Get deployment info
vercel inspect <url>

# Remove deployment
vercel rm <deployment-id>

# Link to project
vercel link

# Pull environment variables
vercel env pull

# Add environment variable
vercel env add
```

---

## 🔍 Troubleshooting

### Build Fails on Vercel

**Check build logs:**
- Vercel Dashboard → Deployments → Click deployment → View logs

**Common issues:**
```bash
# Missing dependencies
npm install

# TypeScript errors
npm run build  # Fix locally first

# Environment variables
# Add in Vercel Dashboard → Settings → Environment Variables
```

### Tag Already Exists

```bash
# Delete local tag
git tag -d v1.0.0

# Delete remote tag
git push origin :refs/tags/v1.0.0

# Create new tag
git tag -a v1.0.0 -m "message"
git push origin v1.0.0
```

### Deployment URL Not Working

```bash
# Check deployment status
vercel ls

# Check logs
vercel logs <url>

# Redeploy
vercel --prod --force
```

---

## 📝 Notes

### Important
- **This is a desktop app** - Vercel deployment is for UI preview only
- **FSUIPC won't work** in browser (requires C# backend)
- **WebView2 bridge** won't work in browser
- Use Vercel for **UI showcase/demo** only

### For Production Desktop App
- Build MSI installer (see INSTALLER_GUIDE.md)
- Distribute via GitHub Releases
- Users install locally with C# backend

### Vercel Use Cases
- ✅ UI preview and showcase
- ✅ Design review
- ✅ Component testing
- ✅ Marketing/demo site
- ❌ Full ACARS functionality (needs desktop)

---

## 🎉 Success!

After deployment:
- **GitHub:** https://github.com/yourusername/levant-acars
- **Vercel:** https://levant-acars.vercel.app
- **Tag:** v1.0.0 visible in releases

**Next Steps:**
1. Create GitHub Release from tag
2. Add release notes
3. Attach MSI installer (when ready)
4. Share with users!

---

## 📚 Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Git Tagging:** https://git-scm.com/book/en/v2/Git-Basics-Tagging
- **Semantic Versioning:** https://semver.org/

**Ready to deploy!** 🚀✈️
