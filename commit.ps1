param (
    [Parameter(Mandatory=$true)]
    [string]$Type,
    
    [Parameter(Mandatory=$true)]
    [string]$Message
)

# Validate commit type
$ValidTypes = @("feat", "fix", "docs", "style", "refactor", "perf", "test", "chore")
if ($ValidTypes -notcontains $Type) {
    Write-Host "Error: Invalid commit type. Must be one of: $($ValidTypes -join ', ')" -ForegroundColor Red
    Write-Host "Usage: .\commit.ps1 -Type <type> -Message <message>"
    exit 1
}

# Run TypeScript check first
Write-Host "Running TypeScript validation..." -ForegroundColor Cyan
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Host "TypeScript validation failed! Please fix errors before committing." -ForegroundColor Red
    exit 1
}

# Format the commit message
$CommitMessage = "$Type: $Message"

Write-Host "Staging all changes..." -ForegroundColor Cyan
git add .

Write-Host "Committing with message: '$CommitMessage'" -ForegroundColor Cyan
git commit -m $CommitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
        Write-Host "🚀 The CI/CD pipeline will now automatically:" -ForegroundColor Green
        Write-Host "   1. Run validations"
        Write-Host "   2. Generate a semantic version (e.g. v1.2.3)"
        Write-Host "   3. Update CHANGELOG.md"
        Write-Host "   4. Create a GitHub Release"
        Write-Host "   5. Deploy to Vercel"
    } else {
        Write-Host "❌ Failed to push to GitHub." -ForegroundColor Red
    }
} else {
    Write-Host "❌ Commit failed or no changes to commit." -ForegroundColor Yellow
}
