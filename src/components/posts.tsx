import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { getArticlePublishDate } from "@/lib/article-date";
import { NEWS_SOURCES, type NewsSource } from "@/config/sources";
import { ArticleSummary } from "@/types";
import Link from "next/link";

export interface PostProps {
  posts: ArticleSummary[] | null;
  /** When false, don't render the large featured hero (useful for infinite-loaded batches) */
  showFeatured?: boolean;
}

export function Posts({ posts, showFeatured = true }: PostProps) {
  const hrefFor = (article: ArticleSummary) => {
    const slugOrId = article.slug ?? String(article.id);
    return `/article/${encodeURIComponent(slugOrId)}`;
  };

  if (!posts || posts.length === 0) {
    return <div className="text-xl font-bold text-muted-foreground">No posts available</div>;
  }

  let featured: ArticleSummary | null = null;
  let gridPosts: ArticleSummary[] = posts;

  if (showFeatured && posts.length > 0) {
    featured = posts[0];
    gridPosts = posts.slice(1);
  }

  return (
    <section className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Featured article */}
        {featured && (
          <article className="mb-8">
            <Link
              href={hrefFor(featured)}
              className="block rounded-lg overflow-hidden shadow-lg group"
              aria-label={`Read ${featured.title}`}
            >
              <div className="relative w-full h-64 md:h-96 bg-muted">
                {featured.image ? (
                  <OptimizedImage
                    src={featured.image}
                    alt={featured.seoAlt || featured.title}
                    fill
                    priority
                    useBlur
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/70">
                    <span className="text-sm text-muted-foreground">No image</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                <div className="absolute bottom-4 left-4 right-4 text-right md:left-8 md:right-8 md:bottom-8">
                  <h2 className="text-white text-xl md:text-3xl font-semibold leading-tight line-clamp-2">
                    {featured.title}
                  </h2>
                  <p className="mt-2 text-sm text-white/90 hidden md:block line-clamp-3">
                    {featured.intro}
                  </p>
                </div>
              </div>
            </Link>
          </article>
        )}

        {/* Grid of remaining articles */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
          {gridPosts.map((article) => {
            const publishDate = getArticlePublishDate(article);
            const sourceInfo = NEWS_SOURCES.find(
              (source: NewsSource) => source.id === article.source
            );
            return (
              <Card
                key={article.id}
                className="overflow-hidden transform transition duration-200 will-change-transform hover:-translate-y-1 hover:shadow-xl shadow-sm border-border/70"
              >
                <Link
                  href={hrefFor(article)}
                  className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label={`Read ${article.title}`}
                >
                  <CardContent className="p-0">
                    <div className="relative w-full h-44 bg-muted overflow-hidden">
                      {article.image ? (
                        <OptimizedImage
                          src={article.image}
                          alt={article.seoAlt || article.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/70">
                          <span className="text-sm text-muted-foreground">No image</span>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  {publishDate && (
                    <div className="px-4 pt-2 text-xs text-muted-foreground text-right">
                      <time dateTime={publishDate.iso} className="whitespace-nowrap">
                        {publishDate.display}
                      </time>
                    </div>
                  )}

                  <CardFooter className="flex w-full flex-col items-start p-4 gap-2 text-right">
                    <CardTitle className="text-base sm:text-lg leading-tight line-clamp-2">
                      {article.title}
                    </CardTitle>

                    <CardDescription>
                      <span className="block text-sm text-muted-foreground max-h-14 overflow-hidden">
                        {article.intro}
                      </span>
                    </CardDescription>

                    <div className="mt-2 w-full flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex flex-wrap items-center gap-2">
                        {article.label && (
                          <span className="px-2 py-0.5 bg-muted rounded-full">
                            {article.label}
                          </span>
                        )}
                        {sourceInfo && (
                          <span className="px-2 py-0.5 border rounded-full text-[0.65rem] uppercase tracking-wide">
                            {sourceInfo.name}
                          </span>
                        )}
                      </div>
                      <div className="text-primary font-semibold transition-transform duration-200 group-hover:translate-x-0.5">
                        {"Read \u2192"}
                      </div>
                    </div>
                  </CardFooter>
              </Link>
            </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
