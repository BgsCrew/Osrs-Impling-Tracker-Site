# Impling Hunter

A real-time impling tracker for Old School RuneScape that monitors and alerts you when rare implings spawn outside of Puro-Puro.

## Features

- **Real-time Monitoring**: Polls impling data every 5 seconds when active
- **Selective Tracking**: Choose which impling types to monitor with checkboxes:
  - Lucky Implings (7233)
  - Dragon Implings (1644, 1654)
  - Ninja Implings (1643, 1653)
  - Magpie Implings (1642, 1652)
  - Crystal Implings (8741-8757)
- **Audio & Visual Alerts**: Screen flashes red and plays sound when new implings are found
- **Map Integration**: Direct links to impling locations on an interactive OSRS map
- **Alert History**: View the last 50 alerts with timestamps, worlds, and map links
- **Smart Filtering**: Automatically ignores Puro-Puro coordinates and previously seen implings

## How to Use

1. Select the impling types you want to track using the checkboxes
2. Click "Activate" to start monitoring for 1 hour
3. When a new impling is found, you'll get an audio alert and the screen will flash red
4. Click the map link to see the exact location
5. Use "Reset Notification" to clear current alerts

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
```bash
git clone https://github.com/yourusername/impling-hunter.git
cd impling-hunter
npm install
```

### Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

## Technology Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Oracle Cloud API** - Real-time impling data source

## Data Source

This app uses a public API that provides real-time impling spawn data for Old School RuneScape. The tracker only monitors implings that spawn outside of Puro-Puro to focus on the most valuable hunting opportunities.
