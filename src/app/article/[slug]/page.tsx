import { fetchArticleBySlug } from "@/actions/fetch-posts";

import { OptimizedImage } from "@/components/ui/optimized-image";

import { getArticlePublishDate } from "@/lib/article-date";

import { SITE_URL } from "@/config/site";

import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: { slug: string } | Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: Props,

  parent: ResolvingMetadata
): Promise<Metadata> {
  // params may be a Promise depending on Next version/runtime — unwrap safely

  const resolvedParams = (
    params instanceof Promise ? await params : params
  ) as { slug: string };

  const { slug } = resolvedParams;

  const result = await fetchArticleBySlug(slug);

  const article = result.article;

  if (!article) {
    return {
      title: "Article Not Found",

      description: "The requested article could not be found.",
    };
  }

  // Create a clean excerpt from the article content

  const excerpt = article.intro || article.summary || "";

  const cleanExcerpt = excerpt

    .replace(/<[^>]*>/g, "") // Remove HTML tags

    .slice(0, 155) // Truncate to reasonable length for meta description

    .trim();

  // Get the image URL for social sharing

  const imageUrl = article.image || undefined;

  const publishDate = getArticlePublishDate(article);

  const updatedDate = article.updated
    ? getArticlePublishDate({
        ...article,

        startPublish: article.updated,

        date: article.updated,

        created: article.updated,

        updated: article.updated,
      } as typeof article)
    : null;

  return {
    title: article.title,

    description: cleanExcerpt,

    openGraph: {
      title: article.title,

      description: cleanExcerpt,

      images: imageUrl
        ? [{ url: imageUrl, alt: article.seoAlt || article.title }]
        : undefined,

      type: "article",

      publishedTime: publishDate?.iso ?? undefined,

      modifiedTime: updatedDate?.iso ?? publishDate?.iso ?? undefined,

      section: article.category || "News",

      authors: ["MosaiqueFM"],
    },

    twitter: {
      card: "summary_large_image",

      title: article.title,

      description: cleanExcerpt,

      images: imageUrl ? [imageUrl] : undefined,
    },

    alternates: {
      canonical: `${SITE_URL}/article/${slug}`,
    },
  };
}

export default async function Page({ params }: Props) {
  // params may be a Promise depending on Next version/runtime — unwrap safely.

  const resolvedParams = (
    params instanceof Promise ? await params : params
  ) as { slug: string };

  const { slug } = resolvedParams;

  const result = await fetchArticleBySlug(slug);

  const article = result.article;

  const attemptedUrls = result.attemptedUrls;

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-center text-lg">Article not found.</p>

        {attemptedUrls && attemptedUrls.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            <div>Attempted detail URLs:</div>

            <pre className="whitespace-pre-wrap">
              {attemptedUrls.join("\n")}
            </pre>
          </div>
        )}
      </div>
    );
  }

  // Render article details. The API may return a full HTML body under several field names.

  const bodyHtml =
    (article as any).content ||
    (article as any).body ||
    (article as any).article ||
    null;

  const plainText =
    article.intro ||
    (article as any).summary ||
    (article as any).description ||
    "";

  const publishDate = getArticlePublishDate(article);

  const updatedDate = article.updated
    ? getArticlePublishDate({
        ...article,

        startPublish: article.updated,

        date: article.updated,

        created: article.updated,

        updated: article.updated,
      } as typeof article)
    : null;

  const structuredData = {
    "@context": "https://schema.org",

    "@type": "NewsArticle",

    mainEntityOfPage: {
      "@type": "WebPage",

      "@id": `${SITE_URL}/article/${slug}`,
    },

    headline: article.title,

    description: plainText || article.title,

    image: article.image ? [article.image] : undefined,

    datePublished: publishDate?.iso,

    dateModified: updatedDate?.iso ?? publishDate?.iso,

    author: {
      "@type": "Organization",

      name: "Mosaique FM",
    },

    publisher: {
      "@type": "Organization",

      name: "Tunisian News",

      logo: {
        "@type": "ImageObject",

        url: `${SITE_URL}/favicon.ico`,
      },
    },

    articleSection: article.category || article.label || undefined,

    url: `${SITE_URL}/article/${slug}`,
  };

  const showDebug =
    process.env.NODE_ENV !== "production" &&
    attemptedUrls &&
    attemptedUrls.length > 0;

  return (
    <main className="container mx-auto px-4 py-8">
      <article className="max-w-3xl mx-auto">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-right">
          {article.title}
        </h1>

        {article.image && (
          <div className="relative w-full h-64 md:h-96 mb-6 overflow-hidden rounded">
            <OptimizedImage
              src={article.image}
              alt={article.seoAlt || article.title}
              className="w-full h-full object-cover"
              fill
              priority // Article main image should load quickly
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
          </div>
        )}

        <div className="prose prose-lg max-w-none text-right">
          {showDebug && (
            <div className="mb-4 text-sm text-gray-500 text-left">
              <strong>Debug - attempted detail URLs:</strong>

              <pre className="whitespace-pre-wrap">
                {attemptedUrls.join("\n")}
              </pre>
            </div>
          )}

          {bodyHtml ? (
            // If the API provided HTML, render it. We assume the API is trusted. If not, sanitize it first.

            <div dangerouslySetInnerHTML={{ __html: String(bodyHtml) }} />
          ) : (
            <p>{plainText}</p>
          )}

          {article.link && (
            <p className="mt-4">
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600"
              >
                Read original source
              </a>
            </p>
          )}
        </div>
      </article>
    </main>
  );
}
