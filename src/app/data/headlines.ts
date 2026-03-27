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
  {
    id: "g7-iran-war-2026",
    text: "G7 meets on the Iran war as Rubio tries to sell US strategy to skeptical allies insulted by Trump",
    source: "Reuters",
    category: "politics",
    location: "Paris, France",
    lat: 48.8566,
    lng: 2.3522,
    age: "1h ago",
  },
  {
    id: "zelensky-saudi-2026",
    text: "Zelensky arrives in Saudi Arabia on surprise visit for 'important meetings'",
    source: "BBC News",
    category: "politics",
    location: "Riyadh, Saudi Arabia",
    lat: 24.7136,
    lng: 46.6753,
    age: "2h ago",
  },
  {
    id: "aircanada-laguardia-2026",
    text: "Air Canada plane collides with fire truck at LaGuardia Airport in New York",
    source: "AP News",
    category: "breaking",
    location: "LaGuardia Airport, New York",
    lat: 40.7769,
    lng: -73.8740,
    age: "45m ago",
  },
  {
    id: "maduro-nyc-court-2026",
    text: "Former Venezuelan President Nicolás Maduro appears in New York City court",
    source: "New York Times",
    category: "politics",
    location: "New York City, NY",
    lat: 40.7128,
    lng: -74.0060,
    age: "3h ago",
  },
  {
    id: "kauai-helicopter-2026",
    text: "Three killed as tourist helicopter crashes on Hawaiian island of Kauai",
    source: "CNN",
    category: "breaking",
    location: "Kauai, Hawaii",
    lat: 22.0964,
    lng: -159.5261,
    age: "5h ago",
  },
  {
    id: "kremlin-war-funding-2026",
    text: "Moscow Kremlin denies Putin asked businessmen to fund Russian war effort",
    source: "Reuters",
    category: "conflict",
    location: "Moscow, Russia",
    lat: 55.7558,
    lng: 37.6173,
    age: "6h ago",
  },
  {
    id: "nepal-pm-shah-2026",
    text: "Ex-rapper Shah sworn in as Nepal prime minister after sweeping election win",
    source: "BBC News",
    category: "politics",
    location: "Kathmandu, Nepal",
    lat: 27.7172,
    lng: 85.3240,
    age: "8h ago",
  },
];

export function headlineToMarker(h: Headline): NewsMarker {
  return {
    id: h.id,
    position: { lat: h.lat, lng: h.lng },
    title: h.text,
    description: `${h.source} · ${h.age}\n◉ ${h.location}`,
    accentColor: HEADLINE_ACCENT[h.category],
    markerType: h.category,
  };
}
