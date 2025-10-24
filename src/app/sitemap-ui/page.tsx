import { fetchPosts } from "@/actions/fetch-posts";
import { Article } from "@/types";
import Link from "next/link";

export const dynamic = "force-static";

export default async function SitemapPageUI() {
  // Fetch a few pages of posts to show in the UI sitemap
  const pagesToFetch = 4;
  const articles: Article[] = [];

  for (let p = 1; p <= pagesToFetch; p++) {
    const posts = await fetchPosts(p);
    if (posts) articles.push(...posts);
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Sitemap (UI)</h1>

      <p className="mb-6 text-sm text-muted-foreground">
        This page lists recent articles. For the machine-readable sitemap visit{" "}
        <Link href="/sitemap.xml" className="text-indigo-600">
          /sitemap.xml
        </Link>
        .
      </p>

      <ul className="space-y-3">
        {articles.length === 0 && (
          <li>No articles found to include in the sitemap.</li>
        )}

        {articles.map((a) => {
          const slug = a.slug || String(a.id);
          const href = `/article/${encodeURIComponent(slug)}`;
          const lastMod = a.startPublish
            ? new Date(a.startPublish).toLocaleString()
            : "";

          return (
            <li
              key={a.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <Link href={href} className="text-indigo-600 underline">
                  {a.title}
                </Link>
                <div className="text-xs text-muted-foreground">{a.intro}</div>
              </div>
              <div className="text-xs text-gray-500 mt-2 sm:mt-0">
                {lastMod}
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
