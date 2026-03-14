# Update Version Script for LevantACARS
# Usage: .\update-version.ps1 -Version "1.5.9"

param(
    [Parameter(Mandatory=$true)]
    [string]$Version
)

$ErrorActionPreference = "Stop"

Write-Host "🔄 Updating LevantACARS to version $Version..." -ForegroundColor Cyan

# Paths
$csprojPath = "src\LevantACARS.App\LevantACARS.csproj"
$wxsPath = "build\installer\Package.wxs"

# Update .csproj
Write-Host "📝 Updating $csprojPath..." -ForegroundColor Yellow
[xml]$csproj = Get-Content $csprojPath
$versionNode = $csproj.SelectSingleNode("//Version")
if ($versionNode) {
    $versionNode.InnerText = $Version
} else {
    $propertyGroup = $csproj.Project.PropertyGroup | Select-Object -First 1
    $newVersion = $csproj.CreateElement("Version")
    $newVersion.InnerText = $Version
    $propertyGroup.AppendChild($newVersion) | Out-Null
}
$csproj.Save((Resolve-Path $csprojPath).Path)
Write-Host "✅ Updated csproj version" -ForegroundColor Green

# Update Package.wxs
Write-Host "📝 Updating $wxsPath..." -ForegroundColor Yellow
$wxsContent = Get-Content $wxsPath -Raw

# Update Product Version
$wxsContent = $wxsContent -replace 'Version="[\d\.]+"', "Version=`"$Version`""

# Update Registry Version
$wxsContent = $wxsContent -replace '<RegistryValue Name="Version" Type="string" Value="[\d\.]+" />', 
                                   "<RegistryValue Name=`"Version`" Type=`"string`" Value=`"$Version`" />"

Set-Content -Path $wxsPath -Value $wxsContent
Write-Host "✅ Updated Package.wxs version" -ForegroundColor Green

Write-Host ""
Write-Host "✨ Version updated successfully to $Version!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Commit changes: git add . && git commit -m 'chore: bump version to $Version'" -ForegroundColor Gray
Write-Host "  2. Create tag: git tag v$Version" -ForegroundColor Gray
Write-Host "  3. Push: git push && git push --tags" -ForegroundColor Gray
Write-Host "  4. GitHub Actions will automatically build and release" -ForegroundColor Gray
