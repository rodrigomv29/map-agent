import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

export interface NewsArticle {
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: string;
  author: string | null;
}

export interface NewsResult {
  query: string;
  totalResults: number;
  articles: NewsArticle[];
}

export async function fetchNews(opts: {
  query: string;
  category?: string;
  country?: string;
  pageSize?: number;
}): Promise<NewsResult> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    throw new Error("NEWS_API_KEY is not set. Check your .env.local file.");
  }

  const useTopHeadlines = !!(opts.category || opts.country);
  const baseUrl = useTopHeadlines
    ? "https://newsapi.org/v2/top-headlines"
    : "https://newsapi.org/v2/everything";

  const params = new URLSearchParams({
    apiKey,
    q: opts.query,
    pageSize: String(opts.pageSize ?? 5),
  });

  if (opts.category) params.set("category", opts.category);
  if (opts.country) params.set("country", opts.country);
  if (opts.category && !opts.country) params.set("country", "us");

  const response = await fetch(`${baseUrl}?${params.toString()}`);
  const data = await response.json();

  if (data.status !== "ok") {
    throw new Error(`NewsAPI error: ${data.message || "Unknown error"}`);
  }

  const articles: NewsArticle[] = (data.articles ?? [])
    .slice(0, opts.pageSize ?? 5)
    .map(
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

  return { query: opts.query, totalResults: data.totalResults, articles };
}

export function formatNewsArticle(article: NewsArticle, index: number): string {
  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleString()
    : "Unknown date";

  const desc =
    article.description && article.description.length > 200
      ? article.description.slice(0, 200) + "..."
      : article.description;

  return [
    `  [${index + 1}] ${article.title}`,
    `      ${date} | ${article.source}${article.author ? ` | ${article.author}` : ""}`,
    desc ? `      ${desc}` : null,
    `      ${article.url}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function printNewsArticles(result: NewsResult): void {
  if (result.articles.length === 0) {
    console.log(`  No articles found for "${result.query}".`);
    return;
  }

  console.log(
    result.articles.map((a, i) => formatNewsArticle(a, i)).join("\n\n")
  );
  console.log(
    `\n  Total results: ${result.totalResults} (showing ${result.articles.length})\n`
  );
}
