"use client";

import { fetchPosts } from "@/actions/fetch-posts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Spinner } from "@/components/ui/spinner";
import { NEWS_SOURCES, type NewsSource } from "@/config/sources";
import { getArticlePublishDate } from "@/lib/article-date";
import { cn } from "@/lib/utils";
import { Article } from "@/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

interface Props {
  initialPosts: Article[] | null;
}

export default function PostsClient({ initialPosts }: Props) {
  const [posts, setPosts] = useState<Article[]>(initialPosts ?? []);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [hasLoadedMore, setHasLoadedMore] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string>("all");

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && !loading && !isFiltering) {
      loadMore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, loading, isFiltering, selectedSource]);

  const loadMore = async () => {
    const activeSourceIds =
      selectedSource === "all"
        ? NEWS_SOURCES.map((source: NewsSource) => source.id)
        : [selectedSource];

    const activeSourceDefs = NEWS_SOURCES.filter((source: NewsSource) =>
      activeSourceIds.includes(source.id)
    );

    if (
      activeSourceDefs.length > 0 &&
      activeSourceDefs.every((source) => source.firstPageOnly)
    ) {
      return;
    }

    setLoading(true);
    try {
      const nextPage = page + 1;
      const sourcesFilter =
        selectedSource === "all" ? undefined : [selectedSource];
      const newPosts =
        (await fetchPosts(nextPage, { sources: sourcesFilter })) ?? [];
      setPosts((p) => [...p, ...newPosts]);
      setPage(nextPage);
      setHasLoadedMore(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const hrefFor = (article: Article) => {
    const slugOrId = article.slug ?? String(article.id);
    return `/article/${encodeURIComponent(slugOrId)}`;
  };

  const featured = !hasLoadedMore && posts.length > 0 ? posts[0] : null;
  const gridPosts = !hasLoadedMore ? posts.slice(1) : posts;

  const handleFilterChange = async (sourceId: string) => {
    if (sourceId === selectedSource) return;
    setIsFiltering(true);
    try {
      const sourcesFilter = sourceId === "all" ? undefined : [sourceId];
      const freshPosts =
        (await fetchPosts(1, { sources: sourcesFilter })) ?? [];
      setPosts(freshPosts);
      setPage(1);
      setHasLoadedMore(false);
      setSelectedSource(sourceId);
    } catch (e) {
      console.error(e);
    } finally {
      setIsFiltering(false);
    }
  };

  const filterButtons = (
    <div className="flex flex-wrap justify-center gap-2 mb-6">
      <button
        type="button"
        disabled={isFiltering || loading}
        onClick={() => handleFilterChange("all")}
        className={cn(
          "rounded-full border px-4 py-2 text-sm transition-colors bg-red-600",
          selectedSource === "all"
            ? "bg-gray-200 text-black border-gray-300 hover:bg-gray-300"
            : "border-border bg-transparent text-muted-foreground hover:bg-muted"
        )}
      >
        All Sources
      </button>
      {NEWS_SOURCES.map((source: NewsSource) => (
        <button
          key={source.id}
          type="button"
          disabled={isFiltering || loading}
          onClick={() => handleFilterChange(source.id)}
          className={cn(
            "rounded-full border px-4 py-2 text-sm transition-colors",
            selectedSource === source.id
              ? "bg-gray-200 text-black border-gray-300 hover:bg-gray-300"
              : "border-border bg-transparent text-muted-foreground hover:bg-muted"
          )}
        >
          {source.name}
        </button>
      ))}
    </div>
  );

  return (
    <section className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filterButtons}
        {(!posts || posts.length === 0) && (
          <div className="text-xl font-bold text-center py-8">
            No posts available
          </div>
        )}
        {featured && (
          <article className="mb-8">
            <Link
              href={hrefFor(featured)}
              className="block rounded-lg overflow-hidden shadow-lg group"
              aria-label={`Read ${featured.title}`}
            >
              <div className="relative w-full h-64 md:h-96 bg-gray-100">
                {featured.image ? (
                  <OptimizedImage
                    src={featured.image}
                    alt={featured.seoAlt || featured.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    fill
                    priority={!hasLoadedMore}
                    fetchPriority={!hasLoadedMore ? "high" : "auto"}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <span className="text-sm text-gray-400">No image</span>
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

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
          {gridPosts.map((article) => {
            const publishDate = getArticlePublishDate(article);
            const sourceInfo = NEWS_SOURCES.find(
              (source: NewsSource) => source.id === article.source
            );
            return (
              <Card
                key={article.id}
                className="overflow-hidden transform transition will-change-transform hover:-translate-y-1 hover:shadow-lg shadow-sm"
              >
                <Link
                  href={hrefFor(article)}
                  className="group block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  aria-label={`Read ${article.title}`}
                >
                  <CardContent className="p-0">
                    <div className="relative w-full h-44 bg-gray-100 overflow-hidden">
                      {article.image ? (
                        <OptimizedImage
                          src={article.image}
                          alt={article.seoAlt || article.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                          <span className="text-sm text-gray-400">
                            No image
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  {publishDate && (
                    <div className="px-4 pt-2 text-xs text-muted-foreground text-right">
                      <time
                        dateTime={publishDate.iso}
                        className="whitespace-nowrap"
                      >
                        {publishDate.display}
                      </time>
                    </div>
                  )}

                  <CardFooter className="flex flex-col items-start p-4 gap-2 text-right">
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
                      <div className="text-indigo-600 font-medium">
                        {"Read \u2192"}
                      </div>
                    </div>
                  </CardFooter>
                </Link>
              </Card>
            );
          })}
        </div>

        <div ref={ref} className="flex justify-center items-center p-4">
          {loading || isFiltering ? <Spinner /> : null}
        </div>
      </div>
    </section>
  );
}
