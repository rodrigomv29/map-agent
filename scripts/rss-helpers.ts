export interface RSSArticle {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
}

function extractTag(xml: string, tag: string): string {
  const cdataMatch = xml.match(
    new RegExp(`<${tag}>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`)
  );
  if (cdataMatch) return cdataMatch[1].trim();

  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return match ? match[1].trim() : "";
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

export async function fetchRSS(url: string): Promise<RSSArticle[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch RSS: ${response.status} ${response.statusText}`);
  }

  const xml = await response.text();

  const channelTitle = extractTag(xml, "title") || url;

  const items = xml.split("<item>").slice(1);

  return items.map((item) => ({
    title: stripHtml(extractTag(item, "title")),
    link: extractTag(item, "link"),
    description: stripHtml(extractTag(item, "description")),
    pubDate: extractTag(item, "pubDate"),
    source: channelTitle,
  }));
}

export function formatArticle(article: RSSArticle, index: number): string {
  const date = article.pubDate
    ? new Date(article.pubDate).toLocaleString()
    : "Unknown date";

  const desc = article.description.length > 200
    ? article.description.slice(0, 200) + "..."
    : article.description;

  return [
    `  [${index + 1}] ${article.title}`,
    `      ${date} | ${article.source}`,
    desc ? `      ${desc}` : null,
    `      ${article.link}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function printArticles(articles: RSSArticle[]): void {
  if (articles.length === 0) {
    console.log("  No articles found.");
    return;
  }

  console.log(articles.map((a, i) => formatArticle(a, i)).join("\n\n"));
}
