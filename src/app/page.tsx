"use client";

import { useState, useCallback, useEffect } from "react";
import { ChatWindow } from "./components/ChatWindow";
import { MapWidget, NewsMarker } from "./components/MapWidget";
import { EventFeed } from "./components/EventFeed";
import { NewsTicker } from "./components/NewsTicker";
import { NJ_EVENTS, eventToMarker } from "./data/events";
import { HEADLINES, headlineToMarker } from "./data/headlines";

const EVENT_MARKERS: NewsMarker[] = NJ_EVENTS.map(eventToMarker);
const HEADLINE_MARKERS: NewsMarker[] = HEADLINES.map(headlineToMarker);

export default function Home() {
  const [chatMarkers, setChatMarkers] = useState<NewsMarker[]>([]);
  const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: 40.0583, lng: -74.4057 });
  const [zoom, setZoom] = useState(8);
  const [utcTime, setUtcTime] = useState("");
  const [activeTab, setActiveTab] = useState<"feed" | "layers" | "cmd" | "sat">("cmd");
  const [tickerVisible, setTickerVisible] = useState(false);
  const [tickerLabel, setTickerLabel] = useState("BREAKING");

  const handleMarkerSelect = useCallback((marker: NewsMarker) => {
    setTickerLabel(marker.title ?? "BREAKING");
    setTickerVisible(true);
  }, []);

  useEffect(() => {
    const tick = () => setUtcTime(new Date().toISOString().slice(11, 19));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleMapView = useCallback((c: { lat: number; lng: number }, z: number) => {
    setCenter(c);
    setZoom(z);
  }, []);

  const handleEventClick = useCallback((lat: number, lng: number) => {
    setCenter({ lat, lng });
    setZoom(14);
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0b0d12] font-mono text-white">

      {/* ── Header bar ─────────────────────────────────────────── */}
      <header className="flex h-10 shrink-0 items-center gap-5 border-b border-cyan-500/20 px-4">
        <span className="text-sm font-bold tracking-[0.25em] text-cyan-400">NEXUS</span>

        <span className="flex items-center gap-1.5 text-[11px]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
          <span className="tracking-widest text-green-400">LIVE</span>
        </span>

        <span className="text-[11px] tracking-wider text-zinc-600">
          FEEDS <span className="text-zinc-400">{NJ_EVENTS.length}</span>
        </span>
        <span className="text-[11px] tracking-wider text-zinc-600">
          PINS <span className="text-zinc-400">{chatMarkers.length}</span>
        </span>
        <span className="text-[11px] tracking-wider text-zinc-600">
          HEATMAP <span className="text-zinc-700">OFFLINE</span>
        </span>

        {/* Nav tabs */}
        <div className="ml-auto flex items-center gap-1.5">
          {(["FEED", "LAYERS", "CMD", "SAT"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase() as typeof activeTab)}
              className={`rounded border px-3 py-1 text-[10px] tracking-widest transition-colors ${
                activeTab === tab.toLowerCase()
                  ? "border-cyan-400/70 bg-cyan-400/10 text-cyan-400"
                  : "border-zinc-700 text-zinc-600 hover:border-zinc-500 hover:text-zinc-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* ── Three-panel content ─────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left — signal feed */}
        <div className="flex w-72 shrink-0 flex-col overflow-hidden border-r border-cyan-500/20">
          <EventFeed events={NJ_EVENTS} headlines={HEADLINES} onItemClick={handleEventClick} />
        </div>

        {/* Center — map */}
        <div className="flex-1 overflow-hidden">
          <MapWidget
            markers={chatMarkers}
            eventMarkers={EVENT_MARKERS}
            headlineMarkers={HEADLINE_MARKERS}
            center={center}
            zoom={zoom}
            onMarkerSelect={handleMarkerSelect}
          />
        </div>

        {/* Right — command */}
        <div className="flex w-80 shrink-0 flex-col overflow-hidden border-l border-cyan-500/20">
          <ChatWindow onMarkers={setChatMarkers} onMapView={handleMapView} />
        </div>

      </div>

      {/* ── News ticker ─────────────────────────────────────────── */}
      <NewsTicker
        visible={tickerVisible}
        label={tickerLabel}
        onClose={() => setTickerVisible(false)}
      />

      {/* ── Status bar ──────────────────────────────────────────── */}
      <footer className="flex h-7 shrink-0 items-center gap-6 border-t border-cyan-500/20 px-4 text-[10px] tracking-wider text-zinc-700">
        <span>UTC {utcTime}</span>
        <span>PINS <span className="text-zinc-500">{chatMarkers.length}</span></span>
        <span>HEATMAP <span className="text-zinc-600">OFFLINE</span></span>
        <span>FEEDS <span className="text-zinc-500">{NJ_EVENTS.length} ACTIVE</span></span>
        <span className="ml-auto">
          MAP AGENT v1.0{"  "}<span className="text-green-700">OPERATIONAL</span>
        </span>
      </footer>

    </div>
  );
}
