# LevantACARS Dashboard UI Redesign Plan

## Current State Analysis

The existing Dashboard.tsx contains the main pilot interface but needs:
- Modern, clean aviation-focused design
- Rank and tier badge integration
- Better component organization
- Improved responsiveness
- Clear status indicators
- Removal of duplicate components

## New Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Header: LevantACARS | Connection Status | Settings         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐  ┌────────────────────────────────┐  │
│  │  Pilot Card      │  │  Flight Status Panel            │  │
│  │  ┌────┐          │  │  ● Connected / ○ Disconnected   │  │
│  │  │Rank│ Name     │  │  Aircraft: B737-800             │  │
│  │  │Img │ 💎 Elite │  │  Flight: LVT123                 │  │
│  │  └────┘          │  │  Route: KJFK → EGLL             │  │
│  │  1,234 hrs       │  └────────────────────────────────┘  │
│  └──────────────────┘                                        │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Flight Information                                  │   │
│  │  Departure: KJFK | Arrival: EGLL                    │   │
│  │  Block Time: 7h 15m | ETA: 14:30 UTC               │   │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 45%  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────┐  ┌────────────────────────────────┐  │
│  │  Recent Flights  │  │  Dispatch Panel                 │  │
│  │  • LVT123 KJFK   │  │  Route: KJFK..EGLL             │  │
│  │  • LVT456 EGLL   │  │  Fuel: 12,500 lbs              │  │
│  │  • LVT789 LFPG   │  │  Payload: 145 PAX              │  │
│  └──────────────────┘  └────────────────────────────────┘  │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Notifications & Achievements                        │   │
│  │  🏆 New badge earned: Butter Landing!               │   │
│  │  🎉 Rank promotion: Captain                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Component Structure

### New Components to Create

1. **PilotCard.tsx**
   - Display pilot name
   - Show current rank with image
   - Display tier badge (Bronze/Silver/Gold/Diamond)
   - Show total flight hours
   - Rank progress bar

2. **FlightStatusPanel.tsx**
   - Connection status indicator (Connected/Disconnected/Tracking)
   - Current aircraft type
   - Flight number
   - Route (departure → arrival)
   - Real-time tracking status

3. **FlightInfoPanel.tsx**
   - Departure/Arrival airports
   - Block time and ETA
   - Flight progress bar
   - Distance and fuel remaining

4. **RecentFlightsWidget.tsx**
   - Last 5-10 flights
   - Flight number, route, date
   - Landing rate and score
   - Quick stats

5. **DispatchWidget.tsx**
   - Route information
   - Fuel planning
   - Payload details
   - Weather briefing link

6. **NotificationsWidget.tsx**
   - Recent achievements
   - Rank promotions
   - System messages
   - Badge unlocks

### Components to Refactor

1. **Dashboard.tsx** - Simplify to layout container
2. **Header.tsx** - Add connection status
3. **StatusBar.tsx** - Modernize design
4. **FlightDataPanel.tsx** - Split into smaller widgets

### Components to Remove/Merge

- Duplicate flight display components
- Redundant status indicators
- Unused legacy components

## Design System

### Colors

```typescript
const colors = {
  // Status
  connected: '#10b981',      // Green
  disconnected: '#ef4444',   // Red
  tracking: '#3b82f6',       // Blue
  
  // Tiers
  bronze: '#cd7f32',
  silver: '#c0c0c0',
  gold: '#ffd700',
  diamond: '#00d4ff',
  
  // UI
  background: '#0a0a0a',
  card: '#1a1a1a',
  border: 'rgba(255,255,255,0.06)',
  text: '#ffffff',
  textMuted: '#9ca3af',
}
```

### Typography

- **Headings**: Inter, Bold, 18-24px
- **Body**: Inter, Regular, 14px
- **Monospace**: JetBrains Mono (for flight numbers, times)
- **Small**: Inter, Regular, 12px

### Spacing

- Card padding: 24px
- Gap between cards: 16px
- Section margins: 32px

## Status Indicators

### Connection Status
- **Connected**: Green dot + "Connected"
- **Disconnected**: Red dot + "Disconnected"
- **Tracking**: Blue pulsing dot + "Tracking Flight"

### Flight Phase
- Pre-flight
- Taxi Out
- Takeoff
- Climb
- Cruise
- Descent
- Approach
- Landing
- Taxi In
- Completed

## Rank Integration

### Rank Display
- Rank image (256x256px from `/Assets/react-ui/img/ranks/`)
- Rank name
- Tier badge emoji
- Total hours
- Progress bar to next rank

### API Integration
```typescript
// Fetch rank info from API
const rankInfo = await fetch('/api/pilot/rank');
// Display in PilotCard component
```

## Badge Integration

### Badge Display
- Show recently earned badges
- Badge notification toast
- Link to full badge collection
- Progress indicators for locked badges

## Responsive Design

### Desktop (1920x1080)
- 3-column layout
- Full sidebar
- All widgets visible

### Tablet (1024x768)
- 2-column layout
- Collapsible sidebar
- Priority widgets shown

### Mobile (Not primary target but should work)
- Single column
- Stacked widgets
- Hamburger menu

## Implementation Steps

### Phase 1: Core Components (Priority)
1. Create PilotCard with rank display
2. Create FlightStatusPanel with status indicators
3. Create FlightInfoPanel with progress tracking
4. Update Dashboard.tsx to use new components

### Phase 2: Widgets
1. Create RecentFlightsWidget
2. Create DispatchWidget
3. Create NotificationsWidget
4. Integrate with existing data sources

### Phase 3: Polish
1. Add animations and transitions
2. Improve loading states
3. Add error handling
4. Optimize performance

### Phase 4: Testing
1. Test all flight phases
2. Test connection states
3. Test rank updates
4. Test badge notifications

## File Structure

```
src/
├── components/
│   ├── dashboard/
│   │   ├── PilotCard.tsx
│   │   ├── FlightStatusPanel.tsx
│   │   ├── FlightInfoPanel.tsx
│   │   ├── RecentFlightsWidget.tsx
│   │   ├── DispatchWidget.tsx
│   │   └── NotificationsWidget.tsx
│   ├── shared/
│   │   ├── StatusIndicator.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── RankBadge.tsx
│   │   └── TierBadge.tsx
│   └── Dashboard.tsx
├── hooks/
│   ├── useRankInfo.ts
│   ├── useBadges.ts
│   └── useFlightStatus.ts
└── types/
    ├── rank.ts
    ├── badge.ts
    └── flight.ts
```

## API Endpoints Required

- `GET /api/pilot/rank` - Rank information
- `GET /api/pilot/badges` - Badge collection
- `GET /api/acars/status` - ACARS connection status
- `GET /api/flights/recent` - Recent flights

## Success Criteria

✅ Clean, modern aviation-focused design
✅ Rank and tier badges prominently displayed
✅ Clear connection status indicators
✅ No duplicate components
✅ Responsive layout
✅ Smooth animations
✅ Fast performance
✅ Easy to maintain
