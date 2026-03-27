import type { NewsMarker } from "../components/MapWidget";
import type { Story, StoryMarker } from "../types/story";

// ─── Event type ─────────────────────────────────────────────────────────────

export type EventCategory =
  | "concert"
  | "theater"
  | "dance"
  | "comedy"
  | "sports"
  | "festival"
  | "other";

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  category: EventCategory;
  stories?: Story[];
  url?: string;
}

// ─── Hardcoded NJ events ─────────────────────────────────────────────────────

export const NJ_EVENTS: Event[] = [
  {
    id: "fetty-wap-2026-04-04",
    title: "Fetty Wap Official Welcome Home Concert",
    date: "Sat Apr 04, 2026",
    time: "8:00 PM",
    venue: "The Wellmont Theater",
    city: "Montclair",
    state: "NJ",
    lat: 40.8245,
    lng: -74.2096,
    category: "concert",
    stories: [
      {
        id: "fetty-1",
        imageUrl: "/assets/hip-hop-stage.svg",
        caption: "Official Welcome Home Concert",
        duration: 5000,
      },
      {
        id: "fetty-2",
        imageUrl: "/assets/venue-exterior.svg",
        caption: "The Wellmont Theater · Montclair, NJ",
        duration: 4000,
      },
    ],
  },
  {
    id: "maddox-batson-2026-03-01",
    title: "Maddox Batson: Live Worldwide Tour",
    date: "Sun Mar 01, 2026",
    time: "7:00 PM",
    venue: "The Wellmont Theater",
    city: "Montclair",
    state: "NJ",
    lat: 40.8248,
    lng: -74.2093,
    category: "concert",
    stories: [
      {
        id: "maddox-1",
        imageUrl: "/assets/intimate-venue.svg",
        caption: "Live Worldwide Tour",
        duration: 5000,
      },
      {
        id: "maddox-2",
        imageUrl: "/assets/venue-exterior.svg",
        caption: "The Wellmont Theater · Montclair, NJ",
        duration: 4000,
      },
    ],
  },
  {
    id: "pilobolus-2026-02-28",
    title: "Pilobolus",
    date: "Sat Feb 28, 2026",
    time: "8:00 PM",
    venue: "New Jersey Performing Arts Center",
    city: "Newark",
    state: "NJ",
    lat: 40.7357,
    lng: -74.1724,
    category: "dance",
    stories: [
      {
        id: "pilobolus-1",
        imageUrl: "/assets/dance-theater.svg",
        caption: "An Evening of Dance",
        duration: 6000,
      },
      {
        id: "pilobolus-2",
        imageUrl: "/assets/intimate-venue.svg",
        caption: "New Jersey Performing Arts Center · Newark, NJ",
        duration: 4000,
      },
    ],
  },
  {
    id: "miguel-2026-03-27",
    title: "Miguel: CAOS Tour",
    date: "Fri Mar 27, 2026",
    time: "8:00 PM",
    venue: "The Wellmont Theater",
    city: "Montclair",
    state: "NJ",
    lat: 40.8246,
    lng: -74.2094,
    category: "concert",
    stories: [
      {
        id: "miguel-1",
        imageUrl: "/assets/intimate-venue.svg",
        caption: "CAOS Tour",
        duration: 5000,
      },
      {
        id: "miguel-2",
        imageUrl: "/assets/venue-exterior.svg",
        caption: "The Wellmont Theater · Montclair, NJ",
        duration: 4000,
      },
    ],
  },
  {
    id: "mgk-2026-06-09",
    title: "MGK: Lost Americana Tour",
    date: "Tue Jun 09, 2026",
    time: "7:00 PM",
    venue: "PNC Bank Arts Center",
    city: "Holmdel",
    state: "NJ",
    lat: 40.3579,
    lng: -74.1846,
    category: "concert",
    stories: [
      {
        id: "mgk-1",
        imageUrl: "/assets/outdoor-amphitheater.svg",
        caption: "Lost Americana Tour",
        duration: 5000,
      },
      {
        id: "mgk-2",
        imageUrl: "/assets/hip-hop-stage.svg",
        caption: "PNC Bank Arts Center · Holmdel, NJ",
        duration: 4000,
      },
    ],
  },
];

// ─── Converter ───────────────────────────────────────────────────────────────
// Returns a StoryMarker when the event has stories, NewsMarker otherwise.

export function eventToMarker(event: Event): StoryMarker | NewsMarker {
  const base: NewsMarker = {
    id: event.id,
    position: { lat: event.lat, lng: event.lng },
    title: event.title,
    description: `${event.date} · ${event.time}\n${event.venue}, ${event.city}, ${event.state}`,
    markerType: "entertainment",
  };

  if (event.stories && event.stories.length > 0) {
    return { ...base, stories: event.stories } satisfies StoryMarker;
  }

  return base;
}
