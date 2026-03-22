"use client";

import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { useState, useCallback } from "react";
import { NJPopulationLayer, NJ_COUNTY_LIST } from "./NJPopulationLayer";
import { StoryViewer } from "./StoryViewer";
import { isStoryMarker, type StoryMarker } from "../types/story";

export interface NewsMarker {
  id: string;
  position: { lat: number; lng: number };
  title: string;
  description?: string;
  /** Hex color string — drives the hexagon stroke/fill for headline markers */
  accentColor?: string;
}

interface MapWidgetProps {
  markers?: NewsMarker[];
  eventMarkers?: NewsMarker[];
  headlineMarkers?: NewsMarker[];
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

// Flat-top hexagon — matches the screenshot's marker style
const EVENT_MARKER_ICON = {
  path: "M 1,0 L 0.5,0.866 L -0.5,0.866 L -1,0 L -0.5,-0.866 L 0.5,-0.866 Z",
  fillColor: "#22d3ee",
  fillOpacity: 0.15,
  strokeColor: "#22d3ee",
  strokeWeight: 1.5,
  scale: 12,
};

// Cyan diamond for chat-placed markers
const CHAT_MARKER_ICON = {
  path: "M 0,-1.2 L 0.85,0 L 0,1.2 L -0.85,0 Z",
  fillColor: "#60a5fa",
  fillOpacity: 0.2,
  strokeColor: "#60a5fa",
  strokeWeight: 1.5,
  scale: 10,
};

// Dark map style
const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry",            stylers: [{ color: "#0b0d12" }] },
  { elementType: "labels.icon",         stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill",    stylers: [{ color: "#3a4455" }] },
  { elementType: "labels.text.stroke",  stylers: [{ color: "#0b0d12" }] },
  { featureType: "administrative",      elementType: "geometry",           stylers: [{ color: "#151a24" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#4a6070" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#3a5060" }] },
  { featureType: "landscape",           stylers: [{ color: "#0d1018" }] },
  { featureType: "poi",                 elementType: "geometry",           stylers: [{ color: "#0d1018" }] },
  { featureType: "poi.park",            elementType: "geometry",           stylers: [{ color: "#0a1218" }] },
  { featureType: "road",                elementType: "geometry",           stylers: [{ color: "#1c2535" }] },
  { featureType: "road",                elementType: "geometry.stroke",    stylers: [{ color: "#121822" }] },
  { featureType: "road",                elementType: "labels.text.fill",   stylers: [{ color: "#384858" }] },
  { featureType: "road.highway",        elementType: "geometry",           stylers: [{ color: "#233040" }] },
  { featureType: "road.highway",        elementType: "labels.text.fill",   stylers: [{ color: "#425565" }] },
  { featureType: "transit",             elementType: "geometry",           stylers: [{ color: "#151a26" }] },
  { featureType: "water",               elementType: "geometry",           stylers: [{ color: "#060910" }] },
  { featureType: "water",               elementType: "labels.text.fill",   stylers: [{ color: "#2a4050" }] },
];

export function MapWidget({
  markers = [],
  eventMarkers = [],
  headlineMarkers = [],
  center = defaultCenter,
  zoom = 4,
}: MapWidgetProps) {
  const [selectedMarker, setSelectedMarker] = useState<NewsMarker | null>(null);
  const [selectedStoryMarker, setSelectedStoryMarker] = useState<StoryMarker | null>(null);
  const [showEventLayer, setShowEventLayer] = useState(true);
  const [showNJLayer, setShowNJLayer] = useState(false);
  const [njView, setNjView] = useState(false);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: LIBRARIES,
  });

  const onMarkerClick = useCallback((marker: NewsMarker) => {
    if (isStoryMarker(marker)) {
      setSelectedStoryMarker(marker);
    } else {
      setSelectedMarker(marker);
    }
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
      <div className="flex h-full items-center justify-center bg-[#0b0d12]">
        <p className="font-mono text-xs tracking-widest text-red-500">ERR · map failed to load</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0b0d12]">
        <p className="animate-pulse font-mono text-xs tracking-widest text-cyan-700">initializing map...</p>
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
          fullscreenControl: false,
          styles: DARK_MAP_STYLES,
        }}
      >
        {/* Chat-placed markers — blue diamond */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            title={marker.title}
            icon={CHAT_MARKER_ICON}
            onClick={() => onMarkerClick(marker)}
          />
        ))}

        {/* Event markers — cyan hexagon, togglable */}
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

        {/* Headline markers — colored hexagon per category accent */}
        {headlineMarkers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            title={marker.title}
            icon={{
              path: "M 1,0 L 0.5,0.866 L -0.5,0.866 L -1,0 L -0.5,-0.866 L 0.5,-0.866 Z",
              fillColor: marker.accentColor ?? "#ef4444",
              fillOpacity: 0.2,
              strokeColor: marker.accentColor ?? "#ef4444",
              strokeWeight: 1.5,
              scale: 12,
            }}
            onClick={() => onMarkerClick(marker)}
          />
        ))}

        {selectedMarker && (
          <InfoWindow
            position={selectedMarker.position}
            onCloseClick={onInfoWindowClose}
          >
            <div className="max-w-xs p-1" style={{ background: "#0b0d12", borderRadius: 4 }}>
              <p style={{ color: "#22d3ee", fontSize: 11, fontWeight: 600, fontFamily: "monospace" }}>
                {selectedMarker.title}
              </p>
              {selectedMarker.description && (
                <p style={{ color: "#6b7280", fontSize: 10, marginTop: 4, whiteSpace: "pre-line", fontFamily: "monospace" }}>
                  {selectedMarker.description}
                </p>
              )}
            </div>
          </InfoWindow>
        )}

        <NJPopulationLayer visible={showNJLayer} />
      </GoogleMap>

      {selectedStoryMarker && (
        <StoryViewer
          marker={selectedStoryMarker}
          onClose={() => setSelectedStoryMarker(null)}
        />
      )}

      {/* Layer controls — terminal style */}
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5 font-mono">
        <button
          onClick={() => setShowEventLayer((v) => !v)}
          className={`rounded border px-2.5 py-1 text-[10px] tracking-widest shadow transition-colors ${
            showEventLayer
              ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-400"
              : "border-zinc-700 bg-[#0b0d12]/80 text-zinc-600 hover:border-zinc-500 hover:text-zinc-400"
          }`}
        >
          {showEventLayer ? "◉ EVENTS ON" : "◎ EVENTS OFF"}
        </button>

        <button
          onClick={handleToggleNJ}
          className={`rounded border px-2.5 py-1 text-[10px] tracking-widest shadow transition-colors ${
            showNJLayer
              ? "border-orange-500/60 bg-orange-500/10 text-orange-400"
              : "border-zinc-700 bg-[#0b0d12]/80 text-zinc-600 hover:border-zinc-500 hover:text-zinc-400"
          }`}
        >
          {showNJLayer ? "◉ DENSITY ON" : "◎ DENSITY OFF"}
        </button>
      </div>

      {/* Legend — dark terminal style */}
      {showNJLayer && (
        <div className="absolute bottom-4 left-3 z-10 rounded border border-cyan-500/20 bg-[#0b0d12]/90 p-3 font-mono backdrop-blur-sm">
          <p className="mb-1 text-[10px] tracking-[0.15em] text-cyan-400">// NJ DENSITY</p>
          <p className="mb-2 text-[9px] text-zinc-600">people / sq mi · 2020 census</p>

          {/* Color ramp */}
          <div className="mb-1 flex h-2 w-32 overflow-hidden rounded-sm">
            <div className="flex-1" style={{ background: "rgba(255,255,0,0.5)" }} />
            <div className="flex-1" style={{ background: "rgba(255,200,0,0.7)" }} />
            <div className="flex-1" style={{ background: "rgba(255,140,0,0.85)" }} />
            <div className="flex-1" style={{ background: "rgba(255,60,0,0.9)" }} />
            <div className="flex-1" style={{ background: "rgba(180,0,0,1)" }} />
          </div>
          <div className="mb-2 flex justify-between text-[9px] text-zinc-600">
            <span>LOW</span><span>HIGH</span>
          </div>

          {/* Top 5 counties */}
          <div className="space-y-0.5">
            {NJ_COUNTY_LIST.sort((a, b) => b.density - a.density)
              .slice(0, 5)
              .map((c) => (
                <div key={c.name} className="flex justify-between gap-4 text-[9px]">
                  <span className="text-zinc-500">{c.name}</span>
                  <span className="text-cyan-700">{c.density.toLocaleString()}</span>
                </div>
              ))}
            <div className="mt-1 text-[9px] text-zinc-700">+ 16 more counties</div>
          </div>
        </div>
      )}
    </div>
  );
}
