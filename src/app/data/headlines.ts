import type { NewsMarker } from "../components/MapWidget";

export type HeadlineCategory = "conflict" | "politics" | "sports" | "breaking" | "tech";

export interface Headline {
  id: string;
  text: string;
  source: string;
  category: HeadlineCategory;
  location: string;
  lat: number;
  lng: number;
  age: string;
}

export const HEADLINE_ACCENT: Record<HeadlineCategory, string> = {
  conflict:  "#ef4444",
  breaking:  "#f97316",
  politics:  "#a78bfa",
  sports:    "#22c55e",
  tech:      "#22d3ee",
};

export const HEADLINES: Headline[] = [
  {
    id: "iran-war-2026",
    text: "Iran War Live Updates: Trump Threatens to Hit Power Plants Unless Strait Is Reopened, as Tehran Remains Defiant",
    source: "New York Times",
    category: "conflict",
    location: "Tehran, Iran",
    lat: 35.6892,
    lng: 51.3890,
    age: "2h ago",
  },
  {
    id: "middle-east-flights-2026",
    text: "Flights Are Still Taking Off as Missiles Rain Down in the Middle East",
    source: "Reuters",
    category: "conflict",
    location: "Tel Aviv, Israel",
    lat: 32.0853,
    lng: 34.7818,
    age: "3h ago",
  },
  {
    id: "carabao-cup-2026",
    text: "Carabao Cup Final Preview: Arsenal v Man City @ Wembley Stadium",
    source: "Sky Sports",
    category: "sports",
    location: "Wembley Stadium, London",
    lat: 51.5560,
    lng: -0.2796,
    age: "4h ago",
  },
];

export function headlineToMarker(h: Headline): NewsMarker {
  return {
    id: h.id,
    position: { lat: h.lat, lng: h.lng },
    title: h.text,
    description: `${h.source} · ${h.age}\n◉ ${h.location}`,
    accentColor: HEADLINE_ACCENT[h.category],
  };
}
