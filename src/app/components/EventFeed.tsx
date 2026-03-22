"use client";

import { useState } from "react";
import type { Event, EventCategory } from "../data/events";
import type { Headline } from "../data/headlines";
import { HEADLINE_ACCENT } from "../data/headlines";

const CATEGORY_COLOR: Record<EventCategory, string> = {
  concert:  "border-cyan-500   text-cyan-400",
  dance:    "border-purple-500 text-purple-400",
  theater:  "border-amber-500  text-amber-400",
  comedy:   "border-yellow-500 text-yellow-400",
  sports:   "border-green-500  text-green-400",
  festival: "border-pink-500   text-pink-400",
  other:    "border-zinc-500   text-zinc-400",
};

interface EventFeedProps {
  events: Event[];
  headlines: Headline[];
  onItemClick: (lat: number, lng: number) => void;
}

export function EventFeed({ events, headlines, onItemClick }: EventFeedProps) {
  const [active, setActive] = useState<EventCategory | "all">("all");

  const categories = [...new Set(events.map((e) => e.category))] as EventCategory[];
  const filtered = active === "all" ? events : events.filter((e) => e.category === active);

  return (
    <div className="flex h-full flex-col bg-[#0b0d12]">

      {/* Panel header */}
      <div className="border-b border-cyan-500/20 px-4 py-2.5">
        <span className="text-[11px] tracking-[0.2em] text-cyan-400">// SIGNAL FEED</span>
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-1.5 border-b border-cyan-500/20 px-3 py-2">
        <button
          onClick={() => setActive("all")}
          className={`rounded border px-2 py-0.5 text-[10px] tracking-widest transition-colors ${
            active === "all"
              ? "border-cyan-400/70 bg-cyan-400/10 text-cyan-400"
              : "border-zinc-700 text-zinc-600 hover:border-zinc-500 hover:text-zinc-400"
          }`}
        >
          ALL
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`rounded border px-2 py-0.5 text-[10px] uppercase tracking-widest transition-colors ${
              active === cat
                ? `${CATEGORY_COLOR[cat]} bg-current/5`
                : "border-zinc-700 text-zinc-600 hover:border-zinc-500 hover:text-zinc-400"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* ── Headlines ─────────────────────────────────────── */}
        <div className="border-b border-zinc-800 px-4 py-1.5">
          <span className="text-[9px] tracking-[0.2em] text-zinc-600">BREAKING</span>
        </div>

        {headlines.map((h) => {
          const color = HEADLINE_ACCENT[h.category];
          return (
            <button
              key={h.id}
              onClick={() => onItemClick(h.lat, h.lng)}
              className="group w-full border-b border-zinc-800/60 px-4 py-3 text-left transition-colors hover:bg-red-500/5"
            >
              <div className="mb-1 flex items-start justify-between gap-2">
                <p className="text-[11px] font-semibold leading-snug text-zinc-200 group-hover:text-white">
                  {h.text}
                </p>
                <span
                  className="shrink-0 rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-wider"
                  style={{ borderColor: color + "80", color }}
                >
                  {h.category}
                </span>
              </div>
              <p className="text-[10px] text-zinc-600">{h.source} · {h.age}</p>
              <p className="mt-0.5 flex items-center gap-1 text-[10px] text-zinc-700 group-hover:text-zinc-500">
                <span>◉</span>
                <span>{h.location}</span>
              </p>
            </button>
          );
        })}

        {/* ── Events ────────────────────────────────────────── */}
        <div className="border-b border-zinc-800 px-4 py-1.5">
          <span className="text-[9px] tracking-[0.2em] text-zinc-600">EVENTS</span>
        </div>

        {filtered.map((event) => (
          <button
            key={event.id}
            onClick={() => onItemClick(event.lat, event.lng)}
            className="group w-full border-b border-zinc-800/60 px-4 py-3 text-left transition-colors hover:bg-cyan-500/5"
          >
            <div className="mb-1 flex items-start justify-between gap-2">
              <p className="text-xs font-semibold leading-tight text-zinc-200 group-hover:text-white">
                {event.title}
              </p>
              <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${CATEGORY_COLOR[event.category]}`}>
                {event.category}
              </span>
            </div>
            <p className="text-[10px] text-zinc-600">{event.date} · {event.time}</p>
            <p className="mt-0.5 flex items-center gap-1 text-[10px] text-cyan-700 group-hover:text-cyan-600">
              <span>◉</span>
              <span>{event.venue}, {event.city}, {event.state}</span>
            </p>
          </button>
        ))}

      </div>
    </div>
  );
}
