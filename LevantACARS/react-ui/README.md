# Levant ACARS - Web UI

A modern, clean web interface for Levant ACARS flight tracking system.

## Features (Planned)

- **Live Pilot Map** - Real-time aircraft tracking on interactive map
- **VATSIM-Style Aircraft Icons** - Professional aircraft markers
- **Flight Route Lines** - Visual flight path display
- **Aircraft Tags** - Information labels beside aircraft
- **Live Pilot List Panel** - Active pilots overview
- **Altitude Color Layers** - Visual altitude differentiation
- **Flight Status Updates** - Real-time status tracking

## Project Structure

```
/src
  /components    - Reusable UI components
  /layouts       - Page layout components
  /pages         - Main application pages
  /styles        - Global styles and Tailwind CSS
  /services      - API and data services
  /utils         - Utility functions
  /types         - TypeScript type definitions
/public
  /assets        - Static assets (images, icons, etc.)
```

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Leaflet** - Interactive maps
- **React Leaflet** - React bindings for Leaflet
- **Lucide React** - Icon library

## Development

This is a clean slate implementation. All legacy code has been removed to prepare for a completely new UI design focused on live flight tracking and modern UX.
