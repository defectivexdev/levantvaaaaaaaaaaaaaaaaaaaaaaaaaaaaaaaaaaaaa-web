# ⚡ Quick Deploy - Copy & Paste Commands

## 🚀 Deploy in 5 Minutes

### Step 1: Commit Everything
```bash
cd "c:\Users\Administrator\Desktop\Levant Virtual Airlines\LevantACARS\frontend"

git add .
git commit -m "Release v1.0.0 - Production ready ACARS"
```

### Step 2: Create Tag
```bash
git tag -a v1.0.0 -m "Version 1.0.0 - Initial production release"
```

### Step 3: Push to GitHub
```bash
git push origin main
git push origin v1.0.0
```

### Step 4: Deploy to Vercel
```bash
# Install Vercel CLI (first time only)
npm install -g vercel

# Login (first time only)
vercel login

# Deploy to production
vercel --prod
```

## ✅ Done!

Your ACARS is now:
- ✅ On GitHub with tag v1.0.0
- ✅ Deployed to Vercel
- ✅ Live at: https://levant-acars.vercel.app

---

## 🔧 Alternative: Vercel Dashboard

Don't want CLI? Use the web interface:

1. Go to https://vercel.com/new
2. Import from GitHub
3. Select your repository
4. Click "Deploy"

**That's it!** 🎉

---

## 📝 Quick Commands Reference

```bash
# Check status
git status

# View tags
git tag -l

# View remote
git remote -v

# Check Vercel deployments
vercel ls

# View deployment logs
vercel logs
```

---

## ⚠️ Important Note

**This Vercel deployment is for UI preview only!**

The full ACARS app (with FSUIPC) requires:
- Desktop installation
- C# backend
- MSI installer

Use Vercel for:
- ✅ UI showcase
- ✅ Design preview
- ✅ Demo purposes

For full functionality, distribute the MSI installer! 📦
