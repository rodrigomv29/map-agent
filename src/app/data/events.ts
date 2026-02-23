import type { NewsMarker } from "../components/MapWidget";

// ─── Event type ─────────────────────────────────────────────────────────────
// Keep category open-ended so future event types (sports, comedy, etc.)
// can be added without changing the base interface.

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
  /** Display date string, e.g. "Sat • Apr 04, 2026" */
  date: string;
  /** Display time string, e.g. "8:00 PM" */
  time: string;
  venue: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  category: EventCategory;
  /** Optional extra detail — ticket URL, performer bio, etc. */
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
  },
  {
    id: "maddox-batson-2026-03-01",
    title: "Maddox Batson: Live Worldwide Tour",
    date: "Sun Mar 01, 2026",
    time: "7:00 PM",
    venue: "The Wellmont Theater",
    city: "Montclair",
    state: "NJ",
    lat: 40.8248,   // offset slightly so it doesn't stack with Fetty Wap pin
    lng: -74.2093,
    category: "concert",
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
  },
];

// ─── Converter ───────────────────────────────────────────────────────────────
// Converts any Event to the MapWidget's NewsMarker shape so no other
// component needs to know about the Event type directly.

export function eventToMarker(event: Event): NewsMarker {
  return {
    id: event.id,
    position: { lat: event.lat, lng: event.lng },
    title: event.title,
    description: `${event.date} · ${event.time}\n${event.venue}, ${event.city}, ${event.state}`,
  };
}
