import { fetchRSS, printArticles } from "./rss-helpers";

const DEFAULT_FEEDS: Record<string, string> = {
  "bbc-top":   "https://feeds.bbci.co.uk/news/rss.xml",
  "bbc-world": "https://feeds.bbci.co.uk/news/world/rss.xml",
  "bbc-tech":  "https://feeds.bbci.co.uk/news/technology/rss.xml",
  "nyt-top":   "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
  "nyt-world": "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
  "npr":       "https://feeds.npr.org/1001/rss.xml",
  "reuters":   "https://www.reutersagency.com/feed/?best-topics=tech",
};

async function main() {
  const arg = process.argv[2];

  if (arg === "--help" || arg === "-h") {
    console.log("Usage: npx tsx scripts/rss-reader.ts [feed-name | url]");
    console.log("\nBuilt-in feeds:");
    for (const [name, url] of Object.entries(DEFAULT_FEEDS)) {
      console.log(`  ${name.padEnd(12)} ${url}`);
    }
    console.log("\nExamples:");
    console.log("  npx tsx scripts/rss-reader.ts");
    console.log("  npx tsx scripts/rss-reader.ts nyt-top");
    console.log("  npx tsx scripts/rss-reader.ts https://some-site.com/rss.xml");
    process.exit(0);
  }

  let url: string;
  let label: string;

  if (!arg) {
    url = DEFAULT_FEEDS["bbc-top"];
    label = "BBC Top Stories";
  } else if (arg.startsWith("http")) {
    url = arg;
    label = arg;
  } else if (DEFAULT_FEEDS[arg]) {
    url = DEFAULT_FEEDS[arg];
    label = arg;
  } else {
    console.error(`Unknown feed: "${arg}". Use --help to see available feeds.`);
    process.exit(1);
  }

  console.log(`\n  Fetching: ${label}\n`);

  try {
    const articles = await fetchRSS(url);
    printArticles(articles);
    console.log(`\n  Total: ${articles.length} articles\n`);
  } catch (err) {
    console.error(`  Error: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }
}

main();
