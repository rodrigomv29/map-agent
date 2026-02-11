"use client";

import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { useState, useCallback } from "react";

export interface NewsMarker {
  id: string;
  position: { lat: number; lng: number };
  title: string;
  description?: string;
}

interface MapWidgetProps {
  markers?: NewsMarker[];
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

export function MapWidget({
  markers = [],
  center = defaultCenter,
  zoom = 4,
}: MapWidgetProps) {
  const [selectedMarker, setSelectedMarker] = useState<NewsMarker | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const onMarkerClick = useCallback((marker: NewsMarker) => {
    setSelectedMarker(marker);
  }, []);

  const onInfoWindowClose = useCallback(() => {
    setSelectedMarker(null);
  }, []);

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
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      }}
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={marker.position}
          title={marker.title}
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
              <p className="mt-1 text-sm text-zinc-600">
                {selectedMarker.description}
              </p>
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}