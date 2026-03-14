# LevantACARS

ACARS (Aircraft Communications Addressing and Reporting System) application for Levant Virtual Airlines.

## 📁 โครงสร้างโปรเจค

```
LevantACARS/
│
├── 📂 src/                          # Source Code
│   └── LevantACARS.App/             # Main Application (WPF/Blazor Hybrid)
│       ├── Assets/                  # Resources (Icons, Images)
│       ├── Components/              # Blazor Components
│       ├── Converters/              # Value Converters
│       ├── Models/                  # Data Models
│       ├── Services/                # Business Logic & Services
│       ├── Themes/                  # UI Themes
│       ├── ViewModels/              # MVVM ViewModels
│       ├── Views/                   # UI Views
│       ├── wwwroot/                 # Web Resources
│       ├── App.xaml                 # Application Entry
│       ├── Program.cs               # Main Program
│       └── LevantACARS.csproj       # Project File
│
├── 📂 config/                       # Configuration Files
│   ├── Bridge/                      # Flight Simulator Bridge
│   │   ├── Profiles/                # Aircraft Profiles
│   │   ├── ACARS_Master.lua         # FlyWithLua Script
│   │   ├── Install-Bridge.ps1       # Installation Script
│   │   └── XPUIPCOffsets.cfg        # XPUIPC Configuration
│   └── config.json                  # App Configuration Template
│
├── 📂 build/                        # Build & Deployment
│   └── installer/                   # WiX Installer Project
│       ├── Package.wxs              # Installer Definition
│       ├── License.rtf              # License Agreement
│       └── LevantACARS.Installer.wixproj
│
├── 📂 tools/                        # Development Tools
│   ├── gen_icon.py                  # Icon Generator
│   └── gen_logo.py                  # Logo Generator
│
├── 📄 LevantACARS.sln               # Visual Studio Solution
├── 📄 .gitignore                    # Git Ignore Rules
├── 📄 .gitattributes                # Git Attributes
├── 📄 .editorconfig                 # Editor Configuration
└── 📄 README.md                     # This File
```

## 🗂️ คำอธิบายโฟลเดอร์

### `/src` - Source Code
โค้ดหลักของแอปพลิเคชัน ACARS ทั้งหมด รวมถึง UI, Business Logic, และ Services

### `/config` - Configuration
- **Bridge/** - ไฟล์เชื่อมต่อกับ Flight Simulator (X-Plane, MSFS)
- **config.json** - ไฟล์ตั้งค่าตัวอย่างสำหรับแอปพลิเคชัน

### `/build` - Build & Deployment
ไฟล์สำหรับสร้าง Windows Installer และ deployment

### `/tools` - Development Tools
Python scripts และเครื่องมือช่วยพัฒนา

## 🚀 Getting Started

1. เปิด `LevantACARS.sln` ด้วย Visual Studio 2022
2. Build solution
3. Run application

## 📦 Building Installer

### Local Build
ใช้ WiX Toolset เพื่อสร้าง installer จากไฟล์ใน `/build/installer`

### Automated Build (CI/CD)

#### วิธีที่ 1: Push Tag
```bash
# อัพเดต version ด้วย script
.\scripts\update-version.ps1 -Version "1.5.9"

# Commit และ push
git add .
git commit -m "chore(acars): bump version to 1.5.9"
git tag acars-v1.5.9
git push && git push --tags
```

**หมายเหตุ:** ใช้ tag format `acars-v*.*.*` เพื่อแยกจาก website releases

#### วิธีที่ 2: Manual Workflow
1. ไปที่ GitHub Actions
2. เลือก "Manual Build" workflow
3. กด "Run workflow"
4. ใส่ version number (เช่น 1.5.9)
5. เลือกว่าจะสร้าง GitHub Release หรือไม่

### Features
- ✅ อัพเดต version ใน `.csproj` อัตโนมัติ
- ✅ อัพเดต version ใน `Package.wxs` อัตโนมัติ
- ✅ สร้างไฟล์ `.msi` พร้อม version ที่ถูกต้อง
- ✅ สร้าง GitHub Release อัตโนมัติ
- ✅ เก็บ artifacts ไว้ 90 วัน
