# Installer Assets

## Required Files

Place these files in this folder before building the installer:

### 1. icon.ico
- **Size:** 256x256 pixels (with 16x16, 32x32, 48x48, 128x128 sizes)
- **Format:** ICO file
- **Content:** Levant VA logo
- **Purpose:** Application icon, Start Menu, Desktop shortcut

### 2. Banner.bmp
- **Size:** 493 x 58 pixels
- **Format:** 24-bit BMP
- **Colors:** Levant VA brand colors (Gold #C5A059, Navy #0A192F)
- **Content:** 
  - Small logo on left
  - "Levant ACARS" text in center
  - Subtle gradient background
- **Purpose:** Top banner in all installer dialogs

### 3. Dialog.bmp
- **Size:** 493 x 312 pixels
- **Format:** 24-bit BMP
- **Colors:** Navy blue gradient with gold accents
- **Content:**
  - Large Levant VA logo (left side or centered)
  - Aviation-themed background (subtle)
  - Professional, clean design
- **Purpose:** Welcome and Exit screen background

### 4. License.rtf
- **Format:** Rich Text Format
- **Content:** End User License Agreement
- **Status:** ✅ Already created
- **Purpose:** Legal compliance, license agreement screen

## Design Guidelines

### Color Palette
```
Primary Gold:   #C5A059 (RGB: 197, 160, 89)
Navy Blue:      #0A192F (RGB: 10, 25, 47)
Dark Blue:      #0F2337 (RGB: 15, 35, 55)
Accent Cyan:    #22D3EE (RGB: 34, 211, 238)
```

### Typography
- **Headings:** Bold, 18-24pt
- **Body:** Regular, 10-12pt
- **Font:** Arial, Calibri, or Segoe UI

### Style
- Professional and clean
- Aviation-themed (subtle)
- Modern and minimal
- Consistent branding

## Creating Graphics

### Tools
- **Adobe Photoshop** - Professional design
- **GIMP** - Free alternative
- **Figma** - Web-based design
- **Paint.NET** - Simple edits
- **Canva** - Quick templates

### Templates

#### Banner.bmp Template
```
┌─────────────────────────────────────────────────────┐
│ [Logo]  LEVANT ACARS - Professional Flight Mgmt    │
│  58px   Navy gradient background with gold text    │
└─────────────────────────────────────────────────────┘
     493 pixels wide
```

#### Dialog.bmp Template
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                                                     │
│        ┌─────────┐                                 │
│        │         │                                 │
│        │  LOGO   │                                 │
│        │         │                                 │
│        └─────────┘                                 │
│                                                     │
│      LEVANT VIRTUAL AIRLINES                       │
│      Professional Flight Management                │
│                                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
     493 x 312 pixels
     Navy blue gradient background
```

## Quick Start (Placeholder Graphics)

If you don't have graphics ready, create simple placeholders:

### 1. Banner.bmp (493x58)
```powershell
# Create solid color banner
# Navy background with white text
```

### 2. Dialog.bmp (493x312)
```powershell
# Create gradient background
# Navy to dark blue with logo placeholder
```

### 3. icon.ico
```powershell
# Use existing app icon or create simple one
# Convert PNG to ICO using online tool
```

## Resources

### Icon Converters
- https://convertio.co/png-ico/
- https://www.icoconverter.com/

### Image Editors
- GIMP: https://www.gimp.org/
- Paint.NET: https://www.getpaint.net/
- Figma: https://www.figma.com/

### Design Inspiration
- Look at professional software installers
- Microsoft Office installer
- Adobe Creative Cloud installer
- Professional aviation software

## Checklist

Before building installer:
- [ ] icon.ico created (256x256)
- [ ] Banner.bmp created (493x58)
- [ ] Dialog.bmp created (493x312)
- [ ] License.rtf reviewed
- [ ] All files in correct format
- [ ] Colors match brand guidelines
- [ ] Graphics look professional
- [ ] Test on high-DPI displays

## Notes

- Use high-quality graphics (no pixelation)
- Test on different screen resolutions
- Ensure text is readable
- Maintain consistent branding
- Keep file sizes reasonable (<1MB each)

**Once you have these files, run the build script to create your beautiful installer!** 🎨
