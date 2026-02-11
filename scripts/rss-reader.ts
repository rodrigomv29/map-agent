import { fetchRSS, printArticles } from "./rss-helpers";

const DEFAULT_FEEDS: Record<string, string> = {
  "cnn-top":   "http://rss.cnn.com/rss/cnn_topstories.rss",
  "cnn-world": "http://rss.cnn.com/rss/cnn_world.rss",
  "cnn-tech":  "http://rss.cnn.com/rss/cnn_tech.rss",
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
    console.log("  npx tsx scripts/rss-reader.ts cnn-world");
    console.log("  npx tsx scripts/rss-reader.ts https://feeds.bbci.co.uk/news/rss.xml");
    process.exit(0);
  }

  let url: string;
  let label: string;

  if (!arg) {
    url = DEFAULT_FEEDS["cnn-top"];
    label = "CNN Top Stories";
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
