import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, tool, stepCountIs } from "ai";
import { z } from "zod/v4";
import { MOCK_MARKERS } from "./mock-news";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: `You are a map assistant running in mock mode. You control an interactive map and can place markers, navigate to locations, and clear the map.

When a user asks to show, view, navigate to, or zoom into a city or location, call the showLocation tool.

When a user asks to place or drop a marker, call the placeMarker tool. In mock mode, always use the predefined mock markers regardless of what the user asks.

When a user asks to clear, remove, or reset the map markers, call the clearMarkers tool.

Be concise and confirm what you did on the map.`,
    messages: await convertToModelMessages(messages),
    tools: {
      showLocation: tool({
        description:
          "Navigate the map to a location and place a marker.",
        inputSchema: z.object({
          name: z.string(),
          lat: z.number(),
          lng: z.number(),
          zoom: z.number(),
        }),
        execute: async (input) => {
          console.log("[MOCK] showLocation:", input.name);
          return input;
        },
      }),
      placeMarker: tool({
        description: "Place markers on the map.",
        inputSchema: z.object({
          markers: z.array(
            z.object({
              title: z.string(),
              description: z.string().optional(),
              lat: z.number(),
              lng: z.number(),
            })
          ),
        }),
        execute: async () => {
          console.log("[MOCK] placeMarker: returning mock markers");
          return MOCK_MARKERS;
        },
      }),
      clearMarkers: tool({
        description: "Clear all markers from the map.",
        inputSchema: z.object({}),
        execute: async () => {
          return { cleared: true };
        },
      }),
    },
    stopWhen: stepCountIs(2),
  });

  return result.toUIMessageStreamResponse();
}
