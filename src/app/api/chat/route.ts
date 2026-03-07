import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, tool, stepCountIs } from "ai";
import { z } from "zod/v4";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: `You are a map assistant. You control an interactive map and can place markers, navigate to locations, and clear the map.

When a user asks to show, view, navigate to, or zoom into a city or location, call the showLocation tool with the name, latitude, longitude, and an appropriate zoom level (4 for countries, 6 for regions, 10 for cities, 14 for neighborhoods or landmarks).

When a user asks to place or drop a marker at a specific location, call the placeMarker tool.

When a user asks to clear, remove, or reset the map markers, call the clearMarkers tool.

Be concise and confirm what you did on the map.`,
    messages: await convertToModelMessages(messages),
    tools: {
      showLocation: tool({
        description:
          "Navigate the map to a location and place a marker. Use when the user asks to show, zoom to, or navigate to a place.",
        inputSchema: z.object({
          name: z.string().describe("Name of the location (e.g. 'Tokyo, Japan')"),
          lat: z.number().describe("Latitude of the location"),
          lng: z.number().describe("Longitude of the location"),
          zoom: z
            .number()
            .describe("Zoom level: 4 countries, 6 regions, 10 cities, 14 landmarks"),
        }),
        execute: async (input) => {
          return input;
        },
      }),
      placeMarker: tool({
        description:
          "Place one or more markers on the map at specific locations.",
        inputSchema: z.object({
          markers: z.array(
            z.object({
              title: z.string().describe("Label for the marker"),
              description: z.string().optional().describe("Optional detail shown in the popup"),
              lat: z.number().describe("Latitude"),
              lng: z.number().describe("Longitude"),
            })
          ),
        }),
        execute: async ({ markers }) => {
          return markers;
        },
      }),
      clearMarkers: tool({
        description:
          "Clear all markers from the map and reset the view.",
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
