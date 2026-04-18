# NEXUS Map Agent

A location-aware intelligence platform with an AI-powered command panel, interactive Google Maps, and a live global signal feed. Live entertainment events, breaking headlines, and population data are layered directly on the map.

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

### Command Autocomplete

As you type, a dropdown suggests available commands filtered by what you've entered. Use `↑` / `↓` to navigate, `Enter` to select, `Escape` to close. Clicking a suggestion fills the input.

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
| `★ ENTERTAINMENT ON` | Show/hide live entertainment event pins (yellow stars) |
| `◎ DENSITY OFF` | Show/hide NJ population density heatmap |

---

## Map Legend

A persistent legend panel in the bottom-right corner of the map identifies all marker types.

| Shape | Color | Meaning |
|-------|-------|---------|
| ★ Star | Yellow | Live entertainment — concerts, theater, dance. Click to open story viewer. |
| ⬡ Hexagon | Red | Active conflict — battle zones, war updates |
| ⬡ Hexagon | Purple | Political turmoil — legal battles, civil unrest |
| ⬡ Hexagon | Orange | Breaking news |
| ⬡ Hexagon | Green | Sports — matches, championships |
| ◆ Diamond | Blue | Command pin — placed via chat |

---

## Signal Feed

The **// SIGNAL FEED** panel (left side) shows breaking headlines and upcoming events. Click any item to fly the map to that location.

Use the filter chips at the top to show only **CONCERT**, **DANCE**, or other event categories.

---

## Story Viewer

Click any **yellow star** on the map to open a full-screen story reel for that event. Navigate slides with arrow keys or by tapping the left/right edges. Press `Escape` to close.

---

## News Ticker

Clicking **any marker** on the map triggers a scrolling news ticker that appears between the map panels and the status bar at the bottom of the screen.

- The ticker badge shows the **marker's title** (event or headline name)
- The ticker text scrolls continuously from right to left in a seamless loop
- Click **✕** on the right edge to dismiss the ticker

---

## Project structure

```
src/app/
  api/chat/route.ts          # AI streaming endpoint (GPT-4o-mini) with tool definitions
  components/
    ChatWindow.tsx            # // COMMAND right panel — chat UI, autocomplete, tool output
    EventFeed.tsx             # // SIGNAL FEED left panel — headlines + events list
    MapWidget.tsx             # Google Maps with dark style, marker types, legend, layer toggles
    NJPopulationLayer.tsx     # Heatmap overlay for NJ county population density
    StoryViewer.tsx           # Full-screen story reel triggered by entertainment pin click
    NewsTicker.tsx            # Scrolling bottom ticker shown on marker click
  data/
    events.ts                 # Event type + hardcoded NJ entertainment events
    headlines.ts              # Headline type + hardcoded global breaking news (10 headlines)
  types/
    story.ts                  # StoryMarker type (extends NewsMarker)
  page.tsx                    # Three-panel layout: feed | map | command
  layout.tsx                  # Root layout + metadata
  globals.css                 # Tailwind entry point + ticker animation keyframes
public/assets/                # SVG illustrations used in story viewer slides
scripts/
  rss-reader.ts               # CLI RSS feed reader (BBC, NYT, NPR, Reuters)
  rss-helpers.ts              # RSS fetch/parse/format helpers
```
