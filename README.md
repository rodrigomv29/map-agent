# Map Agent

A news chat app with an interactive Google Maps widget. Ask about news topics and see related locations pinned on the map. You can also navigate to specific cities and clear markers via chat commands.

## Prerequisites

- Node.js 21+
- npm
- API keys for: OpenAI, Google Maps, NewsAPI

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
NEWS_API_KEY=your_news_api_key_here
```

## Running locally

```bash
npm run dev
```

Open http://localhost:3000.

## RSS reader (terminal)

A standalone script for reading news via RSS feeds, no browser needed:

```bash
# CNN top stories (default)
npx tsx scripts/rss-reader.ts

# Other built-in feeds
npx tsx scripts/rss-reader.ts cnn-world
npx tsx scripts/rss-reader.ts cnn-tech

# Any RSS URL
npx tsx scripts/rss-reader.ts https://feeds.bbci.co.uk/news/rss.xml
```

## Project structure

```
src/app/
  api/chat/route.ts       # AI streaming endpoint with tool definitions
  components/
    ChatWindow.tsx         # Chat UI with message rendering
    MapWidget.tsx          # Google Maps with markers and info windows
    NewsArticleCard.tsx    # News article card component
  page.tsx                 # Split-pane layout (chat + map)
  layout.tsx               # Root layout
  globals.css              # Tailwind entry point
scripts/
  rss-reader.ts            # CLI RSS feed reader
  rss-helpers.ts           # RSS fetch/parse/format helpers
```
