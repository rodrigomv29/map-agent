"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { StoryMarker } from "../types/story";

interface StoryViewerProps {
  marker: StoryMarker;
  onClose: () => void;
}

export function StoryViewer({ marker, onClose }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentStory = marker.stories[currentIndex];
  const total = marker.stories.length;

  const goNext = useCallback(() => {
    setProgress(0);
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      onClose();
    }
  }, [currentIndex, total, onClose]);

  const goPrev = useCallback(() => {
    setProgress(0);
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  // Auto-advance timer
  useEffect(() => {
    const duration = currentStory.duration ?? 5000;
    const startTime = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = (elapsed / duration) * 100;
      if (pct >= 100) {
        clearInterval(timerRef.current!);
        setProgress(100);
        setTimeout(goNext, 80);
      } else {
        setProgress(pct);
      }
    }, 40);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, currentStory.duration, goNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, goNext, goPrev]);

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Story card — stop propagation so clicks inside don't close */}
      <div
        className="relative flex h-[600px] w-[360px] max-h-[90vh] max-w-[92vw] flex-col overflow-hidden rounded-2xl bg-black shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 px-3 pt-3">
          {marker.stories.map((_, i) => (
            <div
              key={i}
              className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30"
            >
              <div
                className="h-full rounded-full bg-white"
                style={{
                  width:
                    i < currentIndex
                      ? "100%"
                      : i === currentIndex
                      ? `${progress}%`
                      : "0%",
                  transition: i === currentIndex ? "none" : undefined,
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 left-0 right-0 z-20 flex items-start justify-between px-3 pt-2">
          <div className="max-w-[80%]">
            <p className="text-xs font-bold leading-tight text-white drop-shadow-md">
              {marker.title}
            </p>
            {marker.description && (
              <p className="mt-0.5 whitespace-pre-line text-[10px] leading-tight text-white/65">
                {marker.description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Story image */}
        <img
          key={currentStory.id}
          src={currentStory.imageUrl}
          alt={currentStory.caption ?? marker.title}
          className="h-full w-full object-cover"
        />

        {/* Caption gradient + text */}
        {currentStory.caption && (
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-5 pt-12">
            <p className="text-sm font-medium leading-snug text-white drop-shadow">
              {currentStory.caption}
            </p>
          </div>
        )}

        {/* Navigation tap zones */}
        <button
          className="absolute inset-y-0 left-0 z-10 w-1/3 cursor-pointer"
          onClick={goPrev}
          aria-label="Previous story"
        />
        <button
          className="absolute inset-y-0 right-0 z-10 w-1/3 cursor-pointer"
          onClick={goNext}
          aria-label="Next story"
        />

        {/* Story index indicator */}
        <div className="absolute bottom-2 right-3 z-20 text-[10px] text-white/40">
          {currentIndex + 1} / {total}
        </div>
      </div>
    </div>
  );
}
