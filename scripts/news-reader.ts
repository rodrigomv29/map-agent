import { fetchNews, printNewsArticles } from "./news-helpers";

async function main() {
  const query = process.argv[2];
  const category = process.argv[3];
  const country = process.argv[4];

  if (!query || query === "--help" || query === "-h") {
    console.log("Usage: npx tsx scripts/news-reader.ts <query> [category] [country]");
    console.log("\nCategories: business, entertainment, general, health, science, sports, technology");
    console.log("Country: 2-letter ISO code (e.g. us, gb, jp)");
    console.log("\nExamples:");
    console.log('  npx tsx scripts/news-reader.ts "artificial intelligence"');
    console.log('  npx tsx scripts/news-reader.ts "tech" technology');
    console.log('  npx tsx scripts/news-reader.ts "elections" general us');
    process.exit(0);
  }

  console.log(`\n  Searching: "${query}"${category ? ` | category: ${category}` : ""}${country ? ` | country: ${country}` : ""}\n`);

  try {
    const result = await fetchNews({ query, category, country });
    printNewsArticles(result);
  } catch (err) {
    console.error(`  Error: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }
}

main();
