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
        <p key={index} className="whitespace-pre-wrap text-sm">
          {part.text}
        </p>
      );
    }

    if (part.type === "tool-showLocation") {
      if (part.state === "output-available") {
        const loc = part.output as ShowLocationOutput;
        return (
          <div key={index} className="my-2 text-xs text-zinc-400">
            Navigated to {loc.name}
          </div>
        );
      }
      return null;
    }

    if (part.type === "tool-placeMarker") {
      if (part.state === "output-available") {
        const markers = part.output as PlaceMarkerOutput[];
        return (
          <div key={index} className="my-2 text-xs text-zinc-400">
            Placed {markers.length} marker{markers.length > 1 ? "s" : ""} on the map
          </div>
        );
      }
      return null;
    }

    if (part.type === "tool-clearMarkers") {
      if (part.state === "output-available") {
        return (
          <div key={index} className="my-2 text-xs text-zinc-400">
            Cleared all markers
          </div>
        );
      }
      return null;
    }

    return null;
  };

  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-900">
      <div className="border-b border-zinc-200 p-4 dark:border-zinc-700">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Map Chat
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Ask to navigate, place markers, or clear the map
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-zinc-400 dark:text-zinc-500">
              Try: "Show me Tokyo" or "Place a marker in Paris"
            </p>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                }`}
              >
                {message.parts.map((part, index) => renderPart(part, index))}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-zinc-100 px-4 py-2 dark:bg-zinc-800">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:0.1s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:0.2s]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-zinc-200 p-4 dark:border-zinc-700"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Show me Tokyo, place a marker in Paris..."
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
