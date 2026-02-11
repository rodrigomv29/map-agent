"use client";

interface NewsArticle {
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: string;
  author: string | null;
}

export function NewsArticleCard({ article }: { article: NewsArticle }) {
  const formattedDate = new Date(article.publishedAt).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" }
  );

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border border-zinc-200 bg-white p-3 transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800"
    >
      <div className="flex gap-3">
        {article.urlToImage && (
          <img
            src={article.urlToImage}
            alt=""
            className="h-16 w-16 flex-shrink-0 rounded object-cover"
          />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {article.title}
          </h3>
          {article.description && (
            <p className="mt-1 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
              {article.description}
            </p>
          )}
          <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
            <span>{article.source}</span>
            <span>-</span>
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </a>
  );
}
