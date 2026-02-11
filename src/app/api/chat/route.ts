import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, tool, stepCountIs } from "ai";
import { z } from "zod/v4";

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
        execute: async ({ query, category, country }) => {
          const apiKey = process.env.NEWS_API_KEY;
          if (!apiKey) {
            throw new Error("NEWS_API_KEY is not configured");
          }

          // Use top-headlines when category or country is specified
          const useTopHeadlines = !!(category || country);
          const baseUrl = useTopHeadlines
            ? "https://newsapi.org/v2/top-headlines"
            : "https://newsapi.org/v2/everything";

          const params = new URLSearchParams({
            apiKey,
            q: query,
            pageSize: "5",
          });

          if (category) params.set("category", category);
          if (country) params.set("country", country);
          if (category && !country) params.set("country", "us");

          const response = await fetch(`${baseUrl}?${params.toString()}`);
          const data = await response.json();

          if (data.status !== "ok") {
            throw new Error(
              `NewsAPI error: ${data.message || "Unknown error"}`
            );
          }

          const articles = (data.articles ?? []).slice(0, 5).map(
            (article: {
              title: string;
              description: string | null;
              url: string;
              urlToImage: string | null;
              publishedAt: string;
              source: { name: string };
              author: string | null;
            }) => ({
              title: article.title,
              description: article.description,
              url: article.url,
              urlToImage: article.urlToImage,
              publishedAt: article.publishedAt,
              source: article.source?.name ?? "Unknown",
              author: article.author,
            })
          );
          console.log("[A] getNews result:", { query, totalResults: data.totalResults, articleCount: articles.length });

          return { query, totalResults: data.totalResults, articles };
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
          console.log("[B] pinLocations called with:", JSON.stringify(locations, null, 2));
          const filtered = locations.filter((loc) => loc.location !== "N/A");
          console.log("[B] pinLocations returning:", filtered.length, "markers");
          return filtered;
        },
      }),
    },
    stopWhen: stepCountIs(3),
  });

  return result.toUIMessageStreamResponse();
}
