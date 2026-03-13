# ACARS Pilot Rank Images

This directory contains rank insignia images for display in the LevantACARS client.

## Required Images

Copy the same rank images from the web application to this directory:

1. **cadet.png** - Cadet (0-15 hours)
2. **student_pilots.png** - Student Pilots (15-150 hours)
3. **amature_pilots.png** - Amateur Pilots (150-300 hours)
4. **pp_pilots.png** - Private Pilots (300-500 hours)
5. **first_officers.png** - First Officer (500-1000 hours)
6. **senior_firstofficer.png** - Senior First Officer (1000-2500 hours)
7. **captain.png** - Captain (2500-5000 hours)
8. **flight_cap.png** - Flight Captains (5000-7000 hours)
9. **senior_flightcaps.png** - Senior Flight Captains (7000-10000 hours)
10. **CommerCap.png** - Commercial Captain (10000-20000 hours)
11. **Instructor.png** - Instructor (20000+ hours)

## Image Specifications

- **Format:** PNG with transparency
- **Size:** 256x256 pixels (optimized for ACARS UI)
- **Aspect Ratio:** 1:1 (square)
- **Background:** Transparent

## ACARS Integration

These images are displayed in:
- Pilot Dashboard (main pilot card)
- Profile section
- Flight status display

The rank is fetched from the API and updated automatically based on pilot's total flight hours.

## Syncing with Web

To keep images synchronized between web and ACARS:

```bash
# From project root
cp public/img/ranks/*.png LevantACARS/Assets/react-ui/img/ranks/
```
