"use client";

import { fetchPosts } from "@/actions/fetch-posts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
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

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && !loading) {
      loadMore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  const loadMore = async () => {
    setLoading(true);
    try {
      const nextPage = (page % 7) + 1;
      const newPosts = (await fetchPosts(nextPage)) ?? [];
      setPosts((p) => [...p, ...newPosts]);
      setPage(nextPage);
      setHasLoadedMore(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const hrefFor = (a: Article) => {
    const slugOrId = a.slug ?? String(a.id);
    return `/article/${encodeURIComponent(slugOrId)}`;
  };

  if (!posts || posts.length === 0) {
    return <div className="text-xl font-bold">No posts available</div>;
  }

  const featured = !hasLoadedMore && posts.length > 0 ? posts[0] : null;
  const gridPosts = !hasLoadedMore ? posts.slice(1) : posts;

  return (
    <section className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {featured && (
          <article className="mb-8">
            <Link
              href={hrefFor(featured)}
              className="block rounded-lg overflow-hidden shadow-lg group"
              aria-label={`Read ${featured.title}`}
            >
              <div className="relative w-full h-64 md:h-96 bg-gray-100">
                {featured.image ? (
                  <img
                    src={featured.image}
                    alt={featured.seoAlt || featured.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
          {gridPosts.map((article) => (
            <Card
              key={article.id}
              className="overflow-hidden transform transition hover:-translate-y-1 hover:shadow-lg shadow-sm"
            >
              <Link
                href={hrefFor(article)}
                className="group block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                aria-label={`Read ${article.title}`}
              >
                <CardContent className="p-0">
                  <div className="w-full h-44 bg-gray-100 overflow-hidden">
                    {article.image ? (
                      <img
                        src={article.image}
                        alt={article.seoAlt || article.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                        <span className="text-sm text-gray-400">No image</span>
                      </div>
                    )}
                  </div>
                </CardContent>

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
                    <div className="flex items-center gap-2">
                      {article.label && (
                        <span className="px-2 py-0.5 bg-muted rounded-full">
                          {article.label}
                        </span>
                      )}
                    </div>
                    <div className="text-indigo-600 font-medium">Read →</div>
                  </div>
                </CardFooter>
              </Link>
            </Card>
          ))}
        </div>

        <div ref={ref} className="flex justify-center items-center p-4">
          {loading ? <Spinner /> : <Spinner />}
        </div>
      </div>
    </section>
  );
}
