import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, tool, stepCountIs } from "ai";
import { z } from "zod/v4";
import { MOCK_NEWS_RESPONSE, MOCK_PIN_LOCATIONS } from "./mock-news";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: `You are a helpful news assistant. You can search for current news using the getNews tool.

When a user asks about news, current events, or recent happenings, use the getNews tool to fetch relevant articles. After receiving the results, provide a brief summary and discussion of the key articles.

After summarizing news results, call the pinLocations tool with any articles that have a clearly identifiable, specific location (city, landmark, etc.). For each article, provide the location name and approximate latitude/longitude. If an article does not have a known specific location, set its location to "N/A" and omit it from the pinLocations call.

When a user asks to show, view, or navigate to a specific city or location on the map (e.g. "show me Tokyo", "zoom into Paris"), call the showLocation tool with the location name, its latitude/longitude, and an appropriate zoom level (12 for cities, 6 for regions, 4 for countries).

When a user asks to clear the map, remove pins/markers, or reset the map, call the clearMarkers tool.

Be concise, informative, and helpful.`,
    messages: await convertToModelMessages(messages),
    tools: {
      getNews: tool({
        description:
          "Search for news articles. Use this when users ask about current events, news, or recent happenings.",
        inputSchema: z.object({
          query: z.string().describe("Search query for news articles"),
          category: z
            .enum([
              "business",
              "entertainment",
              "general",
              "health",
              "science",
              "sports",
              "technology",
            ])
            .optional()
            .describe("News category to filter by"),
          country: z
            .string()
            .optional()
            .describe("2-letter ISO country code (e.g. 'us', 'gb')"),
        }),
        execute: async ({ query }) => {
          console.log("[MOCK] getNews called with query:", query);
          return { ...MOCK_NEWS_RESPONSE, query };
        },
      }),
      showLocation: tool({
        description:
          "Show a specific location on the map. Use when the user asks to see, view, or navigate to a city or place.",
        inputSchema: z.object({
          name: z.string().describe("Name of the location (e.g. 'Tokyo, Japan')"),
          lat: z.number().describe("Latitude of the location"),
          lng: z.number().describe("Longitude of the location"),
          zoom: z
            .number()
            .describe("Zoom level: 4 for countries, 6 for regions, 12 for cities"),
        }),
        execute: async (input) => {
          return input;
        },
      }),
      clearMarkers: tool({
        description:
          "Clear all markers from the map and reset the view. Use when the user asks to clear, remove, or reset map pins.",
        inputSchema: z.object({}),
        execute: async () => {
          return { cleared: true };
        },
      }),
      pinLocations: tool({
        description:
          "Pin news article locations on the map. Only include articles with a known specific location.",
        inputSchema: z.object({
          locations: z.array(
            z.object({
              title: z.string().describe("Article title"),
              description: z
                .string()
                .describe("Short description of the article"),
              location: z
                .string()
                .describe(
                  'Location name (e.g. "New York, NY") or "N/A" if unknown'
                ),
              lat: z.number().describe("Latitude of the location"),
              lng: z.number().describe("Longitude of the location"),
            })
          ),
        }),
        execute: async ({ locations }) => {
          console.log("[MOCK] pinLocations called, using mock locations instead");
          return MOCK_PIN_LOCATIONS;
        },
      }),
    },
    stopWhen: stepCountIs(3),
  });

  return result.toUIMessageStreamResponse();
}
