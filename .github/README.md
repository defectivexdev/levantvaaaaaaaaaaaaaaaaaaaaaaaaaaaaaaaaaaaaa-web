# GitHub Actions Workflows

## 📋 Overview

โปรเจคนี้มี 2 workflows หลัก:

### 1. **LevantACARS** → Build `.msi` และ upload ไปที่ GitHub Releases
- **Location:** `LevantACARS/.github/workflows/`
- **Trigger:** Tag `acars-v*.*.*` หรือ manual dispatch
- **Output:** ไฟล์ `.msi` installer

### 2. **Website** → Deploy ไปที่ Vercel
- **Location:** `.github/workflows/deploy-vercel.yml`
- **Trigger:** Push to `main` branch (ยกเว้น LevantACARS และ LevantBots)
- **Output:** Deploy to Vercel production

## 🚀 การใช้งาน

### Deploy Website
```bash
git add .
git commit -m "feat: update website"
git push
```
→ Auto deploy to Vercel

### Release LevantACARS
```bash
cd LevantACARS
.\scripts\update-version.ps1 -Version "1.5.9"
git add .
git commit -m "chore(acars): bump version to 1.5.9"
git tag acars-v1.5.9
git push && git push --tags
```
→ Auto build `.msi` และสร้าง GitHub Release

## 🔐 Required Secrets

### For Vercel Deployment
- `VERCEL_TOKEN` - Vercel authentication token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID

### For GitHub Releases
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions

## 📝 Tag Naming Convention

- **Website:** ไม่ต้องใช้ tag (auto deploy on push)
- **LevantACARS:** `acars-v1.5.9`
- **LevantBots:** (ถ้ามี) `bot-v1.0.0`
