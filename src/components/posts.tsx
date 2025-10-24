import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Article } from "@/types";
import Link from "next/link";

export interface PostProps {
  posts: Article[] | null;
  /** When false, don't render the large featured hero (useful for infinite-loaded batches) */
  showFeatured?: boolean;
}

export function Posts({ posts, showFeatured = true }: PostProps) {
  const hrefFor = (a: Article) => {
    const slugOrId = a.slug ?? String(a.id);
    return `/article/${encodeURIComponent(slugOrId)}`;
  };

  if (!posts || posts.length === 0) {
    return <div className="text-xl font-bold">No posts available</div>;
  }

  let featured: Article | null = null;
  let gridPosts: Article[] = posts;

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
              <div className="relative w-full h-64 md:h-96 bg-gray-100">
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

        {/* Grid of remaining articles */}
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
                      <OptimizedImage
                        src={article.image}
                        alt={article.seoAlt || article.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
      </div>
    </section>
  );
}
