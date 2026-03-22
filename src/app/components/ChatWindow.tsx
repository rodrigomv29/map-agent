"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useEffect } from "react";
import { NewsMarker } from "./MapWidget";

interface PlaceMarkerOutput {
  title: string;
  description?: string;
  lat: number;
  lng: number;
}

interface ShowLocationOutput {
  name: string;
  lat: number;
  lng: number;
  zoom: number;
}

interface ChatWindowProps {
  onMarkers: (markers: NewsMarker[]) => void;
  onMapView: (center: { lat: number; lng: number }, zoom: number) => void;
}

export function ChatWindow({ onMarkers, onMapView }: ChatWindowProps) {
  const chatApi = process.env.NEXT_PUBLIC_USE_MOCK === "true" ? "/api/chat-mock" : "/api/chat";
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: chatApi }),
  });
  const [input, setInput] = useState("");

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    // Don't override initial markers when there are no chat messages yet
    if (messages.length === 0) return;

    const allMarkers: NewsMarker[] = [];
    let latestView: { center: { lat: number; lng: number }; zoom: number } | null = null;

    for (const message of messages) {
      for (const part of message.parts) {
        if (part.type === "tool-clearMarkers" && part.state === "output-available") {
          allMarkers.length = 0;
          latestView = { center: { lat: 39.8283, lng: -98.5795 }, zoom: 4 };
        }

        if (part.type === "tool-placeMarker" && part.state === "output-available") {
          const markers = part.output as PlaceMarkerOutput[];
          for (const m of markers) {
            allMarkers.push({
              id: `${m.lat}-${m.lng}`,
              position: { lat: m.lat, lng: m.lng },
              title: m.title,
              description: m.description,
            });
          }
        }

        if (part.type === "tool-showLocation" && part.state === "output-available") {
          const loc = part.output as ShowLocationOutput;
          allMarkers.push({
            id: `${loc.lat}-${loc.lng}`,
            position: { lat: loc.lat, lng: loc.lng },
            title: loc.name,
          });
          latestView = { center: { lat: loc.lat, lng: loc.lng }, zoom: loc.zoom };
        }
      }
    }

    onMarkers(allMarkers);
    if (latestView) {
      onMapView(latestView.center, latestView.zoom);
    }
  }, [messages, onMarkers, onMapView]);

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  const renderPart = (
    part: (typeof messages)[number]["parts"][number],
    index: number
  ) => {
    if (part.type === "text") {
      if (!part.text) return null;
      return (
        <p key={index} className="whitespace-pre-wrap text-[11px] leading-relaxed text-zinc-300">
          {part.text}
        </p>
      );
    }

    if (part.type === "tool-showLocation") {
      if (part.state === "output-available") {
        const loc = part.output as ShowLocationOutput;
        return (
          <div key={index} className="mt-1.5 flex items-center gap-1.5 text-[10px] text-cyan-600">
            <span>▶</span>
            <span className="font-mono">flyTo({loc.name}, zoom={loc.zoom})</span>
          </div>
        );
      }
      return null;
    }

    if (part.type === "tool-placeMarker") {
      if (part.state === "output-available") {
        const markers = part.output as PlaceMarkerOutput[];
        return (
          <div key={index} className="mt-1.5 flex items-center gap-1.5 text-[10px] text-cyan-600">
            <span>▶</span>
            <span className="font-mono">pin({markers.length} location{markers.length > 1 ? "s" : ""})</span>
          </div>
        );
      }
      return null;
    }

    if (part.type === "tool-clearMarkers") {
      if (part.state === "output-available") {
        return (
          <div key={index} className="mt-1.5 flex items-center gap-1.5 text-[10px] text-red-500">
            <span>✕</span>
            <span className="font-mono">clearMarkers()</span>
          </div>
        );
      }
      return null;
    }

    return null;
  };

  return (
    <div className="flex h-full flex-col bg-[#0b0d12]">

      {/* Panel header */}
      <div className="border-b border-cyan-500/20 px-4 py-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] tracking-[0.2em] text-cyan-400">// COMMAND</span>

          {/* Sign in with Meta */}
          <button
            type="button"
            className="flex items-center gap-1.5 rounded border border-[#1877F2]/40 bg-[#1877F2]/10 px-2 py-1 text-[10px] text-[#4a9eff] transition-colors hover:bg-[#1877F2]/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-3 w-3 fill-[#4a9eff]" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
            Sign in with Meta
          </button>
        </div>

        <p className="mt-1 text-[10px] text-zinc-700">
          Model: <span className="text-zinc-500">claude-sonnet-4-6</span>
          {"  ·  "}Tools: <span className="text-zinc-500">3 active</span>
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-[11px] tracking-wider text-zinc-700">
              {">"} awaiting command...
            </p>
          </div>
        )}

        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}
            >
              <span className="mb-1 text-[9px] tracking-[0.2em] text-zinc-700">
                {message.role === "user" ? "OPERATOR" : "// NEXUS AI"}
              </span>
              <div
                className={`max-w-[88%] rounded px-3 py-2 ${
                  message.role === "user"
                    ? "border border-cyan-500/30 bg-cyan-500/10 text-cyan-100"
                    : "border border-zinc-700/50 bg-zinc-900/80 text-zinc-300"
                }`}
              >
                {message.parts.map((part, index) => renderPart(part, index))}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex flex-col items-start">
              <span className="mb-1 text-[9px] tracking-[0.2em] text-zinc-700">// NEXUS AI</span>
              <div className="flex gap-1.5 rounded border border-zinc-700/50 bg-zinc-900/80 px-3 py-2">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-500" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-500" style={{ animationDelay: "100ms" }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-500" style={{ animationDelay: "200ms" }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick action buttons */}
      <div className="flex flex-wrap gap-1.5 border-t border-cyan-500/20 px-3 py-2">
        {["◆ PIN", "◉ HEAT", "≡ FILTER", "✕ CLEAR", "↩ UNDO"].map((label) => (
          <button
            key={label}
            className="rounded border border-zinc-700 px-2 py-1 text-[10px] tracking-wider text-zinc-600 transition-colors hover:border-zinc-500 hover:text-zinc-300"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-cyan-500/20 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-cyan-500">{">"}</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter command or question..."
            className="flex-1 bg-transparent text-xs text-zinc-300 placeholder-zinc-700 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded border border-cyan-500/40 bg-cyan-500/10 px-2 py-1 text-[10px] text-cyan-400 transition-colors hover:bg-cyan-500/20 disabled:opacity-30"
          >
            ▶
          </button>
        </div>
      </form>

    </div>
  );
}
