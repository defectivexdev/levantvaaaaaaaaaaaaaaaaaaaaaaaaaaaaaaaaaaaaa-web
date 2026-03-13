# LevantACARS Folder Reorganization Plan

## Current Structure Issues

Based on analysis, the LevantACARS project has:
- Duplicate folder structures (Assets in multiple locations)
- React UI in separate directory
- Unclear separation between C# WPF and React components
- Potential duplicate assets and components

## Current Structure

```
LevantACARS/
├── Assets/                    # Duplicate?
│   └── react-ui/
├── Bridge/
├── LevantACARS/              # Main C# WPF Application
│   ├── Assets/
│   ├── Components/
│   ├── Converters/
│   ├── LevantACARS/          # Nested duplicate?
│   ├── Models/
│   ├── Services/
│   ├── Themes/
│   ├── ViewModels/
│   └── Views/
├── installer/
├── react-ui/                 # React Dashboard
│   ├── node_modules/
│   ├── public/
│   └── src/
└── scripts/
```

## Proposed Clean Structure

```
LevantACARS/
│
├── WPF/                      # C# WPF Application (renamed from LevantACARS)
│   ├── Assets/
│   │   ├── Images/
│   │   ├── Icons/
│   │   └── Ranks/           # Rank images for WPF
│   ├── Components/
│   ├── Converters/
│   ├── Models/
│   ├── Services/
│   │   ├── ACARS/
│   │   ├── API/
│   │   └── FlightTracking/
│   ├── Themes/
│   ├── ViewModels/
│   └── Views/
│
├── ReactUI/                  # React Dashboard (renamed from react-ui)
│   ├── public/
│   │   └── assets/
│   │       ├── images/
│   │       ├── icons/
│   │       └── ranks/       # Rank images for React
│   └── src/
│       ├── components/
│       │   ├── Dashboard/
│       │   ├── Flight/
│       │   ├── Navigation/
│       │   └── Widgets/
│       ├── pages/
│       │   ├── PilotDashboard/
│       │   ├── FlightCenter/
│       │   ├── Logs/
│       │   └── Settings/
│       ├── services/
│       │   ├── api.ts
│       │   ├── acars.ts
│       │   └── flightTracking.ts
│       ├── hooks/
│       ├── utils/
│       ├── types/
│       └── styles/
│
├── Bridge/                   # Communication bridge between WPF and React
│   └── Profiles/
│
├── Installer/                # MSI Installer project
│
└── Scripts/                  # Build and deployment scripts
```

## Migration Steps

### Phase 1: React UI Reorganization
1. Audit `react-ui/src` for duplicate components
2. Organize components by feature (Dashboard, Flight, Navigation, Widgets)
3. Create proper service layer for API calls
4. Consolidate styles and themes
5. Remove unused dependencies

### Phase 2: Asset Consolidation
1. Identify duplicate assets between WPF and React
2. Create shared asset strategy
3. Move rank images to proper locations
4. Remove duplicate image files

### Phase 3: WPF Structure Cleanup
1. Remove nested `LevantACARS/LevantACARS` duplication
2. Organize services by responsibility
3. Clean up unused components and converters

### Phase 4: Documentation
1. Add README files to each major directory
2. Document component structure
3. Create developer setup guide

## Benefits

- **Clear Separation**: WPF and React code clearly separated
- **No Duplicates**: Single source of truth for assets and components
- **Maintainable**: Logical folder structure by feature
- **Scalable**: Easy to add new components and features
- **Professional**: Industry-standard organization

## Implementation Priority

1. **High Priority**: React UI component organization (affects dashboard redesign)
2. **Medium Priority**: Asset consolidation (affects rank image display)
3. **Low Priority**: WPF structure cleanup (doesn't affect immediate features)

## Next Steps

1. Create new folder structure
2. Migrate React components systematically
3. Update import paths
4. Test thoroughly
5. Remove old structure
6. Update build scripts
