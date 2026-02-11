"use client";

import { useState, useCallback } from "react";
import { ChatWindow } from "./components/ChatWindow";
import { MapWidget, NewsMarker } from "./components/MapWidget";

export default function Home() {
  const [markers, setMarkers] = useState<NewsMarker[]>([]);
  const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: 39.8283, lng: -98.5795 });
  const [zoom, setZoom] = useState(4);

  const handleMapView = useCallback((c: { lat: number; lng: number }, z: number) => {
    setCenter(c);
    setZoom(z);
  }, []);

  return (
    <div className="flex h-screen flex-col bg-zinc-50 dark:bg-zinc-950 md:flex-row">
      <div className="h-1/2 w-full border-r border-zinc-200 dark:border-zinc-800 md:h-full md:w-2/5">
        <ChatWindow onMarkers={setMarkers} onMapView={handleMapView} />
      </div>
      <div className="h-1/2 w-full md:h-full md:w-3/5">
        <MapWidget markers={markers} center={center} zoom={zoom} />
      </div>
    </div>
  );
}