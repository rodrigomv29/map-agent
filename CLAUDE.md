# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server at http://localhost:3000 (Turbopack)
npm run build      # Production build
npm run lint       # ESLint with Next.js core-web-vitals + TypeScript rules
npx tsc --noEmit   # Type-check without emitting files
```

No test suite is configured. Type checking (`npx tsc --noEmit`) is the primary correctness verification step.

To run the RSS CLI tool:
```bash
npx tsx scripts/rss-reader.ts              # BBC top stories (default)
npx tsx scripts/rss-reader.ts nyt-world    # NYT world feed
npx tsx scripts/rss-reader.ts --help       # List all built-in feeds
```

## Environment variables

Required in `.env.local`:
```
OPENAI_API_KEY=                        # Powers the /api/chat endpoint (GPT-4o-mini)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=       # Client-side Google Maps — must be NEXT_PUBLIC_
NEXT_PUBLIC_USE_MOCK=true|false        # Routes ChatWindow to /api/chat-mock instead of /api/chat
```

Unused/legacy keys also present in `.env.local`: `NEWS_API_KEY`, `ACCESS_TOKEN`, `DISCORD_TOKEN`, `LLM_API_DOT_COM`, `OPENROUTER_API_KEY`.

## Architecture

### Data flow

```
page.tsx
  ├── EventFeed      ← reads NJ_EVENTS + HEADLINES directly (no props for data)
  ├── MapWidget      ← receives chatMarkers, EVENT_MARKERS, HEADLINE_MARKERS, center, zoom, onMarkerSelect
  └── ChatWindow     ← receives onMarkers, onMapView callbacks; drives chatMarkers + map position
```

`page.tsx` is the single source of truth for map state. `ChatWindow` calls `onMarkers` / `onMapView` to lift state up; `MapWidget` renders whatever it receives. Event and headline markers are stable module-level constants computed once at import time from `NJ_EVENTS` / `HEADLINES`.

### AI tool loop

`ChatWindow` uses Vercel AI SDK v6 (`useChat` + `DefaultChatTransport`). The hook streams responses from `/api/chat`, which runs `streamText` with three tools: `showLocation`, `placeMarker`, `clearMarkers`. Tool outputs arrive as typed `part` objects on each message. The `useEffect` in `ChatWindow` replays all messages on every update to rebuild marker state from scratch — this is intentional so chat and map stay in sync.

### Marker type system

`NewsMarker` (defined in `MapWidget.tsx`) is the base type for all map pins. It carries an optional `markerType` field (`"entertainment" | "conflict" | "politics" | "sports" | "tech" | "breaking" | "chat"`) and optional `accentColor` (hex string). `StoryMarker` extends `NewsMarker` with a `stories` array — use the `isStoryMarker()` type guard to branch between InfoWindow and StoryViewer behavior.

Entertainment events use a star icon; all headline categories use a hexagon with `accentColor` from `HEADLINE_ACCENT`. Chat-placed markers use a diamond.

### Key constraints

- **`HeatmapLayer` removed**: Google Maps JS API v3.65 dropped it. `NJPopulationLayer` now renders `Circle` components instead. Do not re-introduce `HeatmapLayer` or the `"visualization"` library.
- **`LIBRARIES` array must be stable**: defined outside the component to avoid a Google Maps reload warning.
- **`NJPopulationLayer` conditionally renders**: unmounting `Circle` components is safe. The old opacity-toggle workaround was only needed for `HeatmapLayer`.
- **InfoWindow styling must use inline `style` props**: Tailwind classes do not apply inside Google Maps' own DOM context.
- **`useEffect` early return on empty messages**: without `if (messages.length === 0) return`, the effect fires on mount and wipes the pre-loaded event markers.

### Mock API

`/api/chat-mock` always returns hardcoded markers regardless of input. It exists for development without an OpenAI key. Set `NEXT_PUBLIC_USE_MOCK=true` in `.env.local` to activate it. The mock route is not referenced in the README and should not be promoted to users.

## Stack

- **Next.js 16** (App Router, Turbopack, React Compiler enabled)
- **Vercel AI SDK v6** — `useChat`, `streamText`, `tool()`, `stepCountIs`
- **Zod v4** — `z.object()` schemas for tool inputs (import from `"zod/v4"`, not `"zod"`)
- **`@react-google-maps/api`** — `GoogleMap`, `Marker`, `Circle`, `InfoWindow`
- **Tailwind CSS v4** — configured via PostCSS; `@import "tailwindcss"` in `globals.css`
- **TypeScript strict mode**
