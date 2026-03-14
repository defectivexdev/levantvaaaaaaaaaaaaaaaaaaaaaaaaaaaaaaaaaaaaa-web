# 🚀 Automated CI/CD Pipeline Documentation

## Overview

This project uses a **fully automated CI/CD pipeline** that handles version management, building, testing, deployment, and releases without any manual intervention.

---

## 🎯 Features

### ✅ **Automatic Version Management**
- **Auto-increments** patch version on every push to `main`
- Updates version in:
  - Root `package.json`
  - `LevantACARS/react-ui/package.json`
  - MSI installer metadata
- Creates and pushes git tags automatically
- Example: `v1.0.0` → `v1.0.1` → `v1.0.2`

### ✅ **Continuous Integration**
- ESLint validation with auto-fix on failure
- TypeScript type checking
- Dependency analysis (unused packages detection)
- Build verification for both web and desktop apps

### ✅ **Desktop Application Build**
- Builds LevantACARS React UI
- Compiles .NET 8 desktop application
- Generates Windows MSI installer
- Creates portable ZIP archive
- Version-stamped artifacts

### ✅ **Automatic Deployment**
- **Vercel Production**: Auto-deploys web app on every push to `main`
- **Vercel Preview**: Auto-deploys preview for pull requests
- Deployment URLs automatically commented on PRs

### ✅ **GitHub Releases**
- Automatically creates GitHub releases
- Attaches MSI and ZIP files
- Generates release notes from commit history
- Tags releases with version number

### ✅ **Smart Workflow Behavior**
- No manual confirmation required
- Self-healing (auto-fixes lint issues)
- Runs on every push to `main`
- Skips version bump on `[skip ci]` commits

---

## 🔧 Required GitHub Secrets

Add these secrets in your GitHub repository settings (`Settings` → `Secrets and variables` → `Actions`):

### **Vercel Deployment**
```
VERCEL_TOKEN          # Vercel API token
VERCEL_ORG_ID         # Your Vercel organization ID
VERCEL_PROJECT_ID     # Your Vercel project ID
```

### **Application Configuration**
```
BASE_URL              # API base URL (e.g., https://your-domain.com)
APP_KEY               # Application encryption key
IVAO_CLIENT_ID        # IVAO OAuth client ID
IVAO_CLIENT_SECRET    # IVAO OAuth client secret
DISCORD_CLIENT_ID     # Discord OAuth client ID
CLOUDINARY_CLOUD_NAME # Cloudinary cloud name
AIRPORTDB             # AirportDB API token
```

### **GitHub Access**
```
GH_PAT_TOKEN          # Personal Access Token with repo and workflow permissions
                      # (Optional - falls back to GITHUB_TOKEN if not set)
```

---

## 📋 Workflow Jobs

### **1. version-bump**
- Runs first on every push to `main`
- Increments patch version automatically
- Updates `package.json` files
- Creates and pushes version tag
- Commits changes with `[skip ci]` to prevent loops

### **2. validate**
- Runs after version bump
- Installs dependencies
- Runs ESLint (auto-fixes on failure)
- Checks TypeScript types
- Analyzes unused dependencies

### **3. build-acars**
- Builds React UI for desktop app
- Compiles .NET application
- Creates Windows MSI installer
- Generates ZIP archive
- Uploads versioned artifacts

### **4. create-release**
- Downloads build artifacts
- Generates release notes from commits
- Creates GitHub release
- Attaches MSI and ZIP files

### **5. deploy-production**
- Deploys to Vercel production
- Updates deployment summary
- Runs in parallel with release creation

### **6. deploy-preview** (PR only)
- Deploys preview to Vercel
- Comments deployment URL on PR

---

## 🔄 Workflow Triggers

### **Automatic Triggers**
```yaml
on:
  push:
    branches: [main]      # Auto-runs on every push to main
  pull_request:
    branches: [main]      # Auto-runs on PRs
  workflow_dispatch:      # Manual trigger available
```

### **Skip CI**
To skip the workflow, include `[skip ci]` in your commit message:
```bash
git commit -m "docs: update README [skip ci]"
```

---

## 📦 Artifact Outputs

### **Build Artifacts**
- `LevantACARS-v{version}.msi` - Windows installer
- `LevantACARS-v{version}.zip` - Portable archive
- Retained for 90 days

### **Deployment Outputs**
- Production URL: Auto-deployed to Vercel
- Preview URL: Posted as PR comment

---

## 🎨 Version Progression Example

```
Push #1: v1.0.0 → v1.0.1
├─ Bump version
├─ Build MSI (LevantACARS-v1.0.1.msi)
├─ Create release (v1.0.1)
└─ Deploy to Vercel

Push #2: v1.0.1 → v1.0.2
├─ Bump version
├─ Build MSI (LevantACARS-v1.0.2.msi)
├─ Create release (v1.0.2)
└─ Deploy to Vercel

Push #3: v1.0.2 → v1.0.3
└─ ... (continues automatically)
```

---

## 🛠️ Local Development

### **Test Build Locally**
```bash
# Web application
npm ci --legacy-peer-deps
npm run build

# React UI for desktop
cd LevantACARS/react-ui
npm ci --legacy-peer-deps
npm run build
```

### **Lint Locally**
```bash
npm run lint
npm run lint -- --fix  # Auto-fix issues
```

---

## 🔍 Monitoring

### **Check Workflow Status**
1. Go to `Actions` tab in GitHub
2. View latest workflow run
3. Check job logs for details

### **View Deployments**
- **Production**: Check Vercel dashboard
- **Releases**: Check GitHub Releases page
- **Artifacts**: Download from workflow run

---

## ⚡ Performance Optimizations

- **Dependency Caching**: npm packages cached between runs
- **Parallel Jobs**: Deployment and release run simultaneously
- **Conditional Execution**: Jobs skip when not needed
- **Artifact Retention**: 90 days (configurable)

---

## 🚨 Troubleshooting

### **Version Bump Failed**
- Check if `GH_PAT_TOKEN` has correct permissions
- Ensure token has `repo` and `workflow` scopes

### **MSI Build Failed**
- Check WiX Toolset installation logs
- Verify .NET SDK version (8.0.x required)
- Check publish directory exists

### **Deployment Failed**
- Verify Vercel secrets are correct
- Check Vercel project settings
- Review deployment logs in Vercel dashboard

### **Release Creation Failed**
- Ensure artifacts were uploaded successfully
- Check GitHub token permissions
- Verify tag was created

---

## 📝 Notes

- **No Manual Steps**: Everything runs automatically
- **Version Control**: All versions tracked in git tags
- **Rollback**: Use previous release tags to rollback
- **Customization**: Edit `.github/workflows/ci-cd.yml` as needed

---

## 🎯 Best Practices

1. **Commit Messages**: Use conventional commits for better release notes
   ```
   feat: add new feature
   fix: resolve bug
   chore: update dependencies
   docs: update documentation
   ```

2. **Pull Requests**: Always create PRs for review before merging to `main`

3. **Testing**: Test locally before pushing to ensure CI passes

4. **Secrets Management**: Never commit secrets to repository

---

**Last Updated**: Auto-generated by CI/CD pipeline
**Workflow Version**: 2.0 (Fully Automated)
