# NEXUS Map Agent

A location-aware event discovery platform for New Jersey with an AI-powered command panel, interactive Google Maps, and a live signal feed. Events, breaking headlines, and population data are layered directly on the map.

## Prerequisites

- Node.js 21+
- npm
- API keys for: OpenAI, Google Maps

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.local.example .env.local
```

3. Fill in your API keys in `.env.local`:

```
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## Running locally

```bash
npm run dev
```

Open http://localhost:3000.

---

## Command Panel

The **// COMMAND** panel (right side) is an AI chat interface powered by **GPT-4o-mini**. Type natural language commands in the `>` input field.

### Available Commands

#### Navigate to a location
Pan and zoom the map to any city, country, landmark, or region.

```
Show me Tokyo
Zoom into Newark, NJ
Navigate to the Eiffel Tower
Take me to the Strait of Hormuz
```

#### Place a marker
Drop one or more labeled pins anywhere on the map.

```
Place a marker in Paris
Pin Cape Canaveral
Drop markers in London, Berlin, and Rome
Place a marker at Wembley Stadium
```

#### Clear markers
Remove all chat-placed pins from the map and reset the view.

```
Clear the map
Remove all markers
Reset
```

### Command output format

When the AI executes a tool you will see a terminal-style confirmation in the chat:

| Output | Meaning |
|--------|---------|
| `▶ flyTo(Tokyo, zoom=10)` | Map navigated to that location |
| `▶ pin(3 locations)` | Markers were placed |
| `✕ clearMarkers()` | All markers removed |

---

## Map Layers

Toggle layers using the buttons in the top-left corner of the map.

| Button | What it does |
|--------|-------------|
| `◉ EVENTS ON` | Show/hide NJ event pins (cyan hexagons) |
| `◎ DENSITY OFF` | Show/hide NJ population density heatmap |

### Marker types

| Shape | Color | Meaning |
|-------|-------|---------|
| Hexagon | Cyan | NJ event — click to open story viewer |
| Hexagon | Red | Conflict/breaking news headline |
| Hexagon | Green | Sports headline |
| Diamond | Blue | Chat-placed marker |

---

## Signal Feed

The **// SIGNAL FEED** panel (left side) shows breaking headlines and upcoming NJ events. Click any item to fly the map to that location.

Use the filter chips at the top to show only **CONCERT**, **DANCE**, or other event categories.

---

## Story Viewer

Click any **cyan event hexagon** on the map to open a full-screen story reel for that event. Navigate slides with arrow keys or by tapping the left/right edges. Press `Escape` to close.

---

## News Ticker

Clicking **any marker** on the map triggers a scrolling news ticker that appears between the map panels and the status bar at the bottom of the screen.

- The ticker badge label shows the **marker's title** (e.g. the event or headline name)
- The ticker text scrolls continuously from right to left in a seamless loop
- Click **✕** on the right edge to dismiss the ticker

The ticker is styled in the NEXUS terminal aesthetic — dark background, red BREAKING badge, and a pulsing live indicator dot.

---

## Project structure

```
src/app/
  api/chat/route.ts          # AI streaming endpoint (GPT-4o-mini) with tool definitions
  components/
    ChatWindow.tsx            # // COMMAND right panel — chat UI + tool output
    EventFeed.tsx             # // SIGNAL FEED left panel — headlines + events list
    MapWidget.tsx             # Google Maps with dark style, hexagon markers, layer toggles
    NJPopulationLayer.tsx     # Heatmap overlay for NJ county population density
    StoryViewer.tsx           # Full-screen story reel triggered by event pin click
    NewsTicker.tsx            # Scrolling bottom ticker shown on marker click
  data/
    events.ts                 # Event type + hardcoded NJ events
    headlines.ts              # Headline type + hardcoded breaking news stories
  types/
    story.ts                  # StoryMarker type (extends NewsMarker)
  page.tsx                    # Three-panel layout: feed | map | command
  layout.tsx                  # Root layout
  globals.css                 # Tailwind entry point
public/assets/                # SVG illustrations used in story viewer slides
scripts/
  rss-reader.ts               # CLI RSS feed reader
  rss-helpers.ts              # RSS fetch/parse/format helpers
```
