import type { NewsMarker } from "../components/MapWidget";

export interface Story {
  id: string;
  imageUrl: string;
  caption?: string;
  /** Auto-advance duration in ms. Defaults to 5000. */
  duration?: number;
}

/** A map marker that carries a story reel. Inherits all NewsMarker fields. */
export interface StoryMarker extends NewsMarker {
  stories: Story[];
}

/** Type guard — narrows NewsMarker to StoryMarker at runtime. */
export function isStoryMarker(marker: NewsMarker): marker is StoryMarker {
  return "stories" in marker && Array.isArray((marker as StoryMarker).stories);
}
