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
import { useCallback, useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useViewMode } from "@/components/view-mode-provider";

interface Props {
  initialPosts: Article[] | null;
}

export default function PostsClient({ initialPosts }: Props) {
  const [posts, setPosts] = useState<Article[]>(initialPosts ?? []);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [hasLoadedMore, setHasLoadedMore] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const { viewMode } = useViewMode();
  const [isHydrated, setIsHydrated] = useState(false);

  const { ref, inView } = useInView();

  const loadMore = useCallback(async () => {
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
    } catch {
      // Error loading more posts - silently fail
    } finally {
      setLoading(false);
    }
  }, [page, selectedSource]);

  useEffect(() => {
    if (inView && !loading && !isFiltering && !isRefreshing) {
      loadMore();
    }
  }, [inView, loading, isFiltering, isRefreshing, loadMore]);

  const fetchFirstPage = useCallback(async (sourceId: string) => {
    const sourcesFilter = sourceId === "all" ? undefined : [sourceId];
    return (await fetchPosts(1, { sources: sourcesFilter })) ?? [];
  }, []);

  const refreshCurrentSource = useCallback(async () => {
    if (loading || isFiltering || isRefreshing) return;
    setIsRefreshing(true);
    try {
      const freshPosts = await fetchFirstPage(selectedSource);
      setPosts(freshPosts);
      setPage(1);
      setHasLoadedMore(false);
    } catch {
      // Error refreshing posts - silently fail
    } finally {
      setIsRefreshing(false);
    }
  }, [loading, isFiltering, isRefreshing, selectedSource, fetchFirstPage]);

  useEffect(() => {
    const timer = setInterval(() => {
      refreshCurrentSource();
    }, 60_000);

    return () => clearInterval(timer);
  }, [refreshCurrentSource]);

  useEffect(() => {
    setIsHydrated(true);

    // Restore scroll position if returning from article page
    const savedScrollPosition = sessionStorage.getItem('homeScrollPosition');
    if (savedScrollPosition) {
      const scrollY = parseInt(savedScrollPosition, 10);
      window.scrollTo(0, scrollY);
      sessionStorage.removeItem('homeScrollPosition');
    }
  }, []);

  const hrefFor = useCallback((article: Article) => {
    const slugOrId = article.slug ?? String(article.id);
    return `/article/${encodeURIComponent(slugOrId)}`;
  }, []);

  const handleArticleClick = useCallback(() => {
    // Save current scroll position before navigating to article
    sessionStorage.setItem('homeScrollPosition', String(window.scrollY));
  }, []);

  const handleFilterChange = useCallback(async (sourceId: string) => {
    if (sourceId === selectedSource) return;
    setIsFiltering(true);
    try {
      const freshPosts = await fetchFirstPage(sourceId);
      setPosts(freshPosts);
      setPage(1);
      setHasLoadedMore(false);
      setSelectedSource(sourceId);
    } catch {
      // Error filtering posts - silently fail
    } finally {
      setIsFiltering(false);
    }
  }, [selectedSource, fetchFirstPage]);

  const effectiveViewMode = isHydrated ? viewMode : "grid";
  const isListView = effectiveViewMode === "list";
  const featured = useMemo(
    () => (!hasLoadedMore && posts.length > 0 && !isListView ? posts[0] : null),
    [hasLoadedMore, posts, isListView]
  );
  const gridPosts = useMemo(
    () => (isListView || hasLoadedMore ? posts : posts.slice(1)),
    [isListView, hasLoadedMore, posts]
  );

  const filterButtonClasses = useMemo(() => ({
    base: "rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    active: "bg-primary text-primary-foreground border-primary shadow-sm hover:bg-primary/90",
    inactive: "border-border bg-muted text-muted-foreground hover:bg-muted/80"
  }), []);

  const filterButtonBase = filterButtonClasses.base;
  const activeFilterClasses = filterButtonClasses.active;
  const inactiveFilterClasses = filterButtonClasses.inactive;

  const filterButtons = useMemo(() => (
    <div role="region" aria-label="Filter articles by source" className="flex flex-wrap justify-center gap-2 mb-4">
      <button
        type="button"
        role="button"
        aria-pressed={selectedSource === "all"}
        aria-label="Show all sources"
        disabled={isFiltering || loading || isRefreshing}
        onClick={() => handleFilterChange("all")}
        className={cn(
          filterButtonBase,
          selectedSource === "all" ? activeFilterClasses : inactiveFilterClasses
        )}
      >
        All Sources
      </button>
      {NEWS_SOURCES.map((source: NewsSource) => (
        <button
          key={source.id}
          type="button"
          role="button"
          aria-pressed={selectedSource === source.id}
          aria-label={`Filter by ${source.name}`}
          disabled={isFiltering || loading || isRefreshing}
          onClick={() => handleFilterChange(source.id)}
          className={cn(
            filterButtonBase,
            selectedSource === source.id
              ? activeFilterClasses
              : inactiveFilterClasses
          )}
        >
          {source.name}
        </button>
      ))}
    </div>
  ), [selectedSource, isFiltering, loading, isRefreshing, handleFilterChange, filterButtonBase, activeFilterClasses, inactiveFilterClasses]);

  return (
    <section className="w-full" aria-label="News articles">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {filterButtons}
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {isFiltering && "Filtering articles..."}
          {isRefreshing && "Refreshing articles..."}
          {loading && "Loading more articles..."}
        </div>
        {(!posts || posts.length === 0) && (
          <div role="alert" className="text-xl font-bold text-center py-8 text-muted-foreground">
            No posts available
          </div>
        )}
        {featured && (
          <article className="mb-8">
            <Link
              href={hrefFor(featured)}
              onClick={handleArticleClick}
              className="block rounded-lg overflow-hidden shadow-lg group"
              aria-label={`Read ${featured.title}`}
            >
              <div className="relative w-full h-64 md:h-96 bg-muted">
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
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/70">
                    <span className="text-sm text-muted-foreground">
                      No image
                    </span>
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

        <div
          className={cn(
            isListView
              ? "grid grid-cols-1 gap-4"
              : "grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4"
          )}
        >
          {gridPosts.map((article, index) => {
            const publishDate = getArticlePublishDate(article);
            const sourceInfo = NEWS_SOURCES.find(
              (source: NewsSource) => source.id === article.source
            );

            if (isListView) {
              return (
                <article
                  key={`${article.id}-${index}`}
                  className="border-b border-border pb-3 last:border-b-0"
                >
                  <Link
                    href={hrefFor(article)}
                    onClick={handleArticleClick}
                    className="group block hover:bg-muted/30 p-3 rounded-lg transition-colors"
                    aria-label={`Read ${article.title}`}
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                      {publishDate && (
                        <time dateTime={publishDate.iso}>
                          {publishDate.display}
                        </time>
                      )}
                      {sourceInfo && (
                        <>
                          <span>•</span>
                          <span className="uppercase font-medium text-primary">
                            {sourceInfo.name}
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="font-bold text-base leading-snug line-clamp-2 mb-1.5 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {article.intro}
                    </p>
                  </Link>
                </article>
              );
            }

            return (
              <Card
                key={`${article.id}-${index}`}
                className="overflow-hidden transform transition duration-200 will-change-transform hover:-translate-y-1 hover:shadow-xl shadow-sm border-border/70"
              >
                <Link
                  href={hrefFor(article)}
                  onClick={handleArticleClick}
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
                          <span className="text-sm text-muted-foreground">
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

        <div ref={ref} className="flex justify-center items-center p-4">
          {loading || isFiltering || isRefreshing ? <Spinner /> : null}
        </div>
      </div>
    </section>
  );
}
