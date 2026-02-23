"use client";

import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { useState, useCallback } from "react";
import { NJPopulationLayer, NJ_COUNTY_LIST } from "./NJPopulationLayer";

export interface NewsMarker {
  id: string;
  position: { lat: number; lng: number };
  title: string;
  description?: string;
}

interface MapWidgetProps {
  markers?: NewsMarker[];
  eventMarkers?: NewsMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
}

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 39.8283,
  lng: -98.5795,
};

const NJ_CENTER = { lat: 40.0583, lng: -74.4057 };
const NJ_ZOOM = 8;

// Must be stable (outside component) to avoid Google Maps warning
const LIBRARIES: ("visualization")[] = ["visualization"];

// Purple pin icon for event markers — distinct from default red chat markers
const EVENT_MARKER_ICON = {
  path: "M 0,-1 C -0.55,-1 -1,-0.55 -1,0 C -1,0.55 0,2 0,2 C 0,2 1,0.55 1,0 C 1,-0.55 0.55,-1 0,-1 Z",
  fillColor: "#7c3aed",
  fillOpacity: 1,
  strokeColor: "#ffffff",
  strokeWeight: 0.5,
  scale: 14,
};

export function MapWidget({
  markers = [],
  eventMarkers = [],
  center = defaultCenter,
  zoom = 4,
}: MapWidgetProps) {
  const [selectedMarker, setSelectedMarker] = useState<NewsMarker | null>(null);
  const [showEventLayer, setShowEventLayer] = useState(true);
  const [showNJLayer, setShowNJLayer] = useState(false);
  const [njView, setNjView] = useState(false);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: LIBRARIES,
  });

  const onMarkerClick = useCallback((marker: NewsMarker) => {
    setSelectedMarker(marker);
  }, []);

  const onInfoWindowClose = useCallback(() => {
    setSelectedMarker(null);
  }, []);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMapRef(map);
  }, []);

  const handleToggleNJ = useCallback(() => {
    setShowNJLayer((prev) => {
      const next = !prev;
      if (next && mapRef) {
        mapRef.panTo(NJ_CENTER);
        mapRef.setZoom(NJ_ZOOM);
        setNjView(true);
      } else if (!next && njView && mapRef) {
        mapRef.panTo(defaultCenter);
        mapRef.setZoom(4);
        setNjView(false);
      }
      return next;
    });
  }, [mapRef, njView]);

  if (loadError) {
    return (
      <div className="flex h-full items-center justify-center bg-zinc-100 dark:bg-zinc-800">
        <div className="text-center">
          <p className="text-zinc-600 dark:text-zinc-400">Failed to load map</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            Please check your API key
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center bg-zinc-100 dark:bg-zinc-800">
        <div className="text-center">
          <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-blue-600" />
          <p className="text-zinc-600 dark:text-zinc-400">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onLoad={onMapLoad}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        }}
      >
        {/* Chat-placed markers — default red Google pin */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            title={marker.title}
            onClick={() => onMarkerClick(marker)}
          />
        ))}

        {/* Event markers — purple pin, togglable */}
        {showEventLayer &&
          eventMarkers.map((marker) => (
            <Marker
              key={marker.id}
              position={marker.position}
              title={marker.title}
              icon={EVENT_MARKER_ICON}
              onClick={() => onMarkerClick(marker)}
            />
          ))}

        {selectedMarker && (
          <InfoWindow
            position={selectedMarker.position}
            onCloseClick={onInfoWindowClose}
          >
            <div className="max-w-xs p-1">
              <h3 className="font-semibold text-zinc-900">{selectedMarker.title}</h3>
              {selectedMarker.description && (
                <p className="mt-1 whitespace-pre-line text-sm text-zinc-600">
                  {selectedMarker.description}
                </p>
              )}
            </div>
          </InfoWindow>
        )}

        {showNJLayer && <NJPopulationLayer />}
      </GoogleMap>

      {/* Layer controls — top-left */}
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
        <button
          onClick={() => setShowEventLayer((v) => !v)}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold shadow-md transition-colors ${
            showEventLayer
              ? "bg-violet-600 text-white hover:bg-violet-700"
              : "bg-white text-zinc-800 hover:bg-zinc-100"
          }`}
        >
          {showEventLayer ? "Hide Events" : "Show Events"}
        </button>

        <button
          onClick={handleToggleNJ}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold shadow-md transition-colors ${
            showNJLayer
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-white text-zinc-800 hover:bg-zinc-100"
          }`}
        >
          {showNJLayer ? "Hide NJ Density" : "NJ Population Density"}
        </button>
      </div>

      {/* Legend — visible only when NJ density layer is on */}
      {showNJLayer && (
        <div className="absolute bottom-8 left-3 z-10 rounded-md bg-white/90 p-3 shadow-md backdrop-blur-sm">
          <p className="mb-1.5 text-xs font-bold text-zinc-700">
            NJ Population Density
          </p>
          <p className="mb-2 text-[10px] text-zinc-500">people / sq mi (2020)</p>

          {/* Color ramp */}
          <div className="mb-2 flex h-3 w-36 overflow-hidden rounded-sm">
            <div className="flex-1" style={{ background: "rgba(255,255,0,0.5)" }} />
            <div className="flex-1" style={{ background: "rgba(255,200,0,0.7)" }} />
            <div className="flex-1" style={{ background: "rgba(255,140,0,0.85)" }} />
            <div className="flex-1" style={{ background: "rgba(255,60,0,0.9)" }} />
            <div className="flex-1" style={{ background: "rgba(180,0,0,1)" }} />
          </div>
          <div className="flex justify-between text-[10px] text-zinc-500">
            <span>Low</span>
            <span>High</span>
          </div>

          {/* Top 5 counties */}
          <div className="mt-2 space-y-0.5">
            {NJ_COUNTY_LIST.sort((a, b) => b.density - a.density)
              .slice(0, 5)
              .map((c) => (
                <div key={c.name} className="flex justify-between gap-4 text-[10px]">
                  <span className="text-zinc-600">{c.name}</span>
                  <span className="font-mono text-zinc-800">
                    {c.density.toLocaleString()}
                  </span>
                </div>
              ))}
            <div className="mt-0.5 text-[10px] text-zinc-400">+ 16 more counties</div>
          </div>
        </div>
      )}
    </div>
  );
}
