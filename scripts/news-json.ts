import { fetchNews } from "./news-helpers";

async function main() {
  const query = process.argv[2];
  const category = process.argv[3];
  const country = process.argv[4];

  if (!query || query === "--help" || query === "-h") {
    console.log("Usage: npx tsx scripts/news-json.ts <query> [category] [country]");
    console.log("\nPrints raw JSON output from NewsAPI.");
    console.log("\nExamples:");
    console.log('  npx tsx scripts/news-json.ts "artificial intelligence"');
    console.log('  npx tsx scripts/news-json.ts "tech" technology | jq .');
    process.exit(0);
  }

  try {
    const result = await fetchNews({ query, category, country });
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
    process.exit(1);
  }
}

main();
