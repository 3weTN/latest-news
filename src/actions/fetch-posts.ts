"use server";

import {
  ApiNewsSource,
  NEWS_SOURCES,
  NewsSource,
  RssNewsSource,
} from "@/config/sources";
import { Article, RssItem } from "@/types";
import { XMLParser } from "fast-xml-parser";
import { unstable_cache } from "next/cache";

export type ArticleDetailResult = {
  article: Article | null;
  attemptedUrls: string[];
};

export interface FetchPostsOptions {
  sources?: string[];
}

const FETCH_OPTIONS = {
  cache: "no-store" as const,
  next: {
    revalidate: 0,
  },
} as const;

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  removeNSPrefix: true,
  trimValues: true,
  cdataPropName: "__cdata",
});

const ALL_SOURCES_KEY = "__all__";
const POSTS_CACHE_TAG = "fetch-posts";
const POSTS_CACHE_REVALIDATE_SECONDS = 60;
const ARTICLE_LOOKUP_BATCH_SIZE = 2;
const MOSAIQUE_DETAIL_LANGS = ["ar", "fr"] as const;

const textContent = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const asRecord = value as Record<string, unknown>;
    if (typeof asRecord.__cdata === "string") return asRecord.__cdata;
    if (typeof asRecord["#text"] === "string")
      return asRecord["#text"] as string;
  }
  return value == null ? "" : String(value);
};

const slugify = (input: string): string =>
  textContent(input)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const hashString = (input: string): number => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

const fillEndpointTemplate = (
  template: string,
  values: Record<string, string | number | undefined>
): string =>
  template.replace(/\{(\w+)\}/g, (_, token) => {
    const value = values[token];
    return encodeURIComponent(value !== undefined ? String(value) : "");
  });

const getArticleTimestamp = (article: Article): number => {
  const candidates: Array<Article["startPublish"] | Article["date"]> = [
    article.startPublish,
    article.date,
    article.created,
    article.updated,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;

    if (candidate instanceof Date) {
      const time = candidate.getTime();
      if (!Number.isNaN(time)) return time;
      continue;
    }

    if (typeof candidate === "number") {
      const date = new Date(
        candidate < 10_000_000_000 ? candidate * 1000 : candidate
      );
      if (!Number.isNaN(date.getTime())) return date.getTime();
      continue;
    }

    if (typeof candidate === "object" && "date" in candidate) {
      const date = new Date((candidate as { date?: string }).date ?? "");
      if (!Number.isNaN(date.getTime())) return date.getTime();
      continue;
    }

    const date = new Date(candidate);
    if (!Number.isNaN(date.getTime())) return date.getTime();
  }

  return 0;
};

const applyMaxAgeFilter = (
  articles: Article[],
  source: NewsSource
): Article[] => {
  if (!source.maxAgeDays) return articles;
  const cutoff = Date.now() - source.maxAgeDays * 24 * 60 * 60 * 1000;
  return articles.filter((article) => getArticleTimestamp(article) >= cutoff);
};

const normalizeMosaiqueImage = (imageUrl?: string): string => {
  if (!imageUrl) return "";
  let url = imageUrl.trim();

  if (!url) return "";
  if (url.startsWith("//")) {
    url = `https:${url}`;
  } else if (url.startsWith("/")) {
    url = `https://www.mosaiquefm.net${url}`;
  } else if (url.startsWith("http://")) {
    url = url.replace(/^http:\/\//, "https://");
  }

  return url;
};

const mapMosaiqueArticle = (article: Article, sourceId: string): Article => ({
  ...article,
  source: sourceId,
  image: normalizeMosaiqueImage(article.image as string | undefined),
  link2: article.link2 ?? article.link ?? "",
});

const fetchOgImage = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      next: { revalidate: 3600 }, // Cache OG lookups for 1 hour
    });
    if (!response.ok) return null;
    const html = await response.text();

    // Try og:image
    const ogMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);
    if (ogMatch) return ogMatch[1];

    // Try twitter:image
    const twitterMatch = html.match(
      /<meta name="twitter:image" content="([^"]+)"/i
    );
    if (twitterMatch) return twitterMatch[1];

    // Try featuredImage in JSON (specific to La Presse/WordPress)
    const jsonMatch = html.match(/"featuredImage":"([^"]+)"/);
    if (jsonMatch) return jsonMatch[1].replace(/\\/g, "");

    return null;
  } catch {
    return null;
  }
};

const stripHtml = (html: string): string => {
  if (!html) return "";

  let text = html;

  // Decode common HTML entities
  const entities: Record<string, string> = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&#8217;": "'",
    "&#8211;": "-",
    "&#8212;": "—",
    "&#8230;": "...",
    "&#233;": "é",
    "&#232;": "è",
    "&#224;": "à",
    "&#226;": "â",
    "&#234;": "ê",
    "&#238;": "î",
    "&#244;": "ô",
    "&#251;": "û",
    "&#231;": "ç",
    "&#171;": "«",
    "&#187;": "»",
  };

  // Basic entity decoding
  text = text.replace(/&[a-zA-Z0-9#]+;/g, (entity) => {
    if (entities[entity]) return entities[entity];
    // Handle numeric entities
    if (entity.startsWith("&#")) {
      const code = parseInt(entity.slice(2, -1), 10);
      if (!isNaN(code)) return String.fromCharCode(code);
    }
    return entity;
  });

  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, "");

  return text.trim();
};

const parseRssItem = async (
  item: RssItem,
  source: RssNewsSource
): Promise<Article | null> => {
  if (!item) return null;

  const guidText = typeof item.guid === 'object' && item.guid !== null ? item.guid["#text"] : undefined;
  const rawLink = textContent(
    item.link || guidText || item.guid
  );
  const link = rawLink.trim();
  const title = textContent(item.title).trim();

  if (!link || !title) {
    return null;
  }

  const rawDescription =
    textContent(item.description) || textContent(item["content:encoded"]);

  const cleanDescription = stripHtml(rawDescription);

  const intro =
    cleanDescription.length > 280
      ? `${cleanDescription.slice(0, 277)}...`
      : cleanDescription;

  const categoryValue = Array.isArray(item.category)
    ? textContent(item.category[0])
    : textContent(item.category);
  const category = categoryValue.trim() || source.name;
  const labelSlug = slugify(category) || source.id;

  const guidObjectText = typeof item.guid === 'object' && item.guid !== null ? item.guid["#text"] : undefined;
  const guidValue =
    textContent(guidObjectText) ||
    textContent(item.guid) ||
    link ||
    title;
  const id = hashString(guidValue || link || title);
  const fallbackSlug = `${source.id}-${id}`;
  const rawSlug = slugify(title);
  const slugValue = rawSlug ? `${source.id}-${rawSlug}` : fallbackSlug;

  const rawPubDate = textContent(item.pubDate);
  const pubDate = rawPubDate ? new Date(rawPubDate) : null;
  const publishISO =
    pubDate && !Number.isNaN(pubDate.getTime())
      ? pubDate.toISOString()
      : undefined;

  const mediaCandidate =
    item["media:content"] ?? item.content ?? item.enclosure;
  const media = Array.isArray(mediaCandidate)
    ? mediaCandidate[0]
    : mediaCandidate;
  let imageUrl = media ? textContent(media.url ?? media["@_url"]) : "";

  if (!imageUrl) {
    const htmlContent =
      textContent(item["content:encoded"]) || textContent(item.description);
    const imgMatch = htmlContent.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch) {
      imageUrl = imgMatch[1];
    }
  }

  // Fallback: Fetch OG image if still no image
  if (!imageUrl && link) {
    // Only try fallback for specific sources or if enabled, to avoid too many requests?
    // For now, try for all.
    imageUrl = (await fetchOgImage(link)) || "";
  }

  return {
    tid: hashString(`${source.id}-${category}`),
    label: category || source.name,
    tslug: labelSlug || `${source.id}-${id}`,
    id,
    title,
    slug: slugValue,
    intro,
    summary: rawDescription || undefined,
    seoAlt: title,
    image: imageUrl,
    startPublish: publishISO ?? rawPubDate ?? null,
    date: publishISO,
    created: publishISO,
    updated: publishISO,
    category,
    link,
    link2: link,
    firstItem: false,
    source: source.id,
  };
};

const fetchApiSource = async (
  source: ApiNewsSource,
  page: number
): Promise<Article[]> => {
  const perPage = source.perPage ?? 24;
  const replacements: Record<string, string | number | undefined> = {
    page,
    perPage,
    ...source.params,
  };

  const apiUrl = fillEndpointTemplate(source.endpoint, replacements);

  try {
    const response = await fetch(apiUrl, FETCH_OPTIONS);
    if (!response.ok) {
      throw new Error(`${source.name} API returned ${response.status}`);
    }

    const data = await response.json();
    const items: Article[] = Array.isArray(data?.items)
      ? (data.items as Article[])
      : [];

    let mapped: Article[];
    switch (source.id) {
      case "mosaique":
        mapped = items.map((item) => mapMosaiqueArticle(item, source.id));
        break;
      default:
        mapped = items.map((item) => ({ ...item, source: source.id }));
        break;
    }

    return applyMaxAgeFilter(mapped, source);
  } catch {
    return [];
  }
};

const fetchRssSource = async (source: RssNewsSource): Promise<Article[]> => {
  try {
    const response = await fetch(source.endpoint, FETCH_OPTIONS);
    if (!response.ok) {
      throw new Error(`${source.name} feed returned ${response.status}`);
    }

    const xml = await response.text();
    const parsed = xmlParser.parse(xml);
    const items = parsed?.rss?.channel?.item;
    const itemList = Array.isArray(items) ? items : items ? [items] : [];

    const mappedPromises = itemList.map((item) => parseRssItem(item, source));
    const mapped = (await Promise.all(mappedPromises)).filter(
      (article): article is Article => Boolean(article)
    );

    return applyMaxAgeFilter(mapped, source);
  } catch {
    return [];
  }
};

const fetchArticlesForSource = async (
  source: NewsSource,
  page: number
): Promise<Article[]> => {
  if (source.firstPageOnly && page > 1) {
    return [];
  }

  if (source.type === "api") {
    return fetchApiSource(source, page);
  }

  return fetchRssSource(source);
};

const normalizeSourcesKey = (sources?: string[]): string => {
  if (!sources || sources.length === 0) {
    return ALL_SOURCES_KEY;
  }

  const uniqueIds = Array.from(
    new Set(sources.map((id) => id.trim()).filter(Boolean))
  );

  if (uniqueIds.length === 0) {
    return ALL_SOURCES_KEY;
  }

  return uniqueIds.sort().join(",");
};

const parseSourcesKey = (sourcesKey: string): Set<string> | null => {
  if (sourcesKey === ALL_SOURCES_KEY) {
    return null;
  }

  return new Set(
    sourcesKey
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
  );
};

const loadPosts = async (
  page: number,
  requestedSources: Set<string> | null
): Promise<Article[] | null> => {
  const activeSources = NEWS_SOURCES.filter((source: NewsSource) => {
    if (requestedSources && !requestedSources.has(source.id)) {
      return false;
    }

    if (source.firstPageOnly && page > 1) {
      return false;
    }

    return true;
  });

  if (activeSources.length === 0) {
    return null;
  }

  const articleGroups = await Promise.all(
    activeSources.map((source) => fetchArticlesForSource(source, page))
  );

  const combined = articleGroups.flat();
  if (combined.length === 0) {
    return null;
  }

  combined.sort((a, b) => getArticleTimestamp(b) - getArticleTimestamp(a));
  return combined;
};

const cachedLoadPosts = unstable_cache(
  async (page: number, sourcesKey: string) => {
    const requestedSources = parseSourcesKey(sourcesKey);
    return loadPosts(page, requestedSources);
  },
  [POSTS_CACHE_TAG],
  {
    revalidate: POSTS_CACHE_REVALIDATE_SECONDS,
  }
);

export async function fetchPosts(
  page: number,
  options?: FetchPostsOptions
): Promise<Article[] | null> {
  const sourcesKey = normalizeSourcesKey(options?.sources);
  return cachedLoadPosts(page, sourcesKey);
}

const matchesArticleSlug = (
  candidate: Article,
  decodedSlug: string,
  rawSlug: string
): boolean => {
  const candidateId =
    candidate.id !== undefined && candidate.id !== null
      ? String(candidate.id)
      : "";

  return (
    candidate.slug === decodedSlug ||
    candidate.tslug === decodedSlug ||
    candidateId === decodedSlug ||
    candidateId === rawSlug
  );
};

export async function fetchArticleBySlug(
  slug: string
): Promise<ArticleDetailResult> {
  const attemptedUrls: string[] = [];
  const isNumeric = /^\d+$/.test(slug);

  if (isNumeric) {
    const mosaiqueSource = NEWS_SOURCES.find(
      (source) => source.id === "mosaique"
    ) as ApiNewsSource | undefined;

    if (mosaiqueSource) {
      const detailResponses = await Promise.all(
        MOSAIQUE_DETAIL_LANGS.map(async (lang) => {
          const detailUrl = `https://api.mosaiquefm.net/api/${lang}/5/1/articles/${encodeURIComponent(
            slug
          )}`;
          attemptedUrls.push(detailUrl);
          try {
            const res = await fetch(detailUrl, FETCH_OPTIONS);
            if (!res.ok) {
              return null;
            }
            const data = await res.json();
            const rawArticle =
              (data?.item as Article | undefined) ??
              (data?.article as Article | undefined) ??
              (data?.data as Article | undefined) ??
              (data as Article | undefined);
            return rawArticle
              ? mapMosaiqueArticle(rawArticle, mosaiqueSource.id)
              : null;
          } catch {
            return null;
          }
        })
      );

      const detailArticle = detailResponses.find(
        (article): article is Article => Boolean(article)
      );
      if (detailArticle) {
        return { article: detailArticle, attemptedUrls };
      }
    }
  }

  try {
    const decoded = decodeURIComponent(slug);
    const maxPages = 8;
    const pageNumbers = Array.from({ length: maxPages }, (_, idx) => idx + 1);

    for (
      let index = 0;
      index < pageNumbers.length;
      index += ARTICLE_LOOKUP_BATCH_SIZE
    ) {
      const batch = pageNumbers.slice(index, index + ARTICLE_LOOKUP_BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async (pageNumber) => fetchPosts(pageNumber))
      );

      for (const posts of batchResults) {
        if (!posts || posts.length === 0) {
          continue;
        }

        const found = posts.find((candidate) =>
          matchesArticleSlug(candidate, decoded, slug)
        );
        if (found) {
          return { article: found, attemptedUrls };
        }
      }
    }

    return { article: null, attemptedUrls };
  } catch (e) {
    return { article: null, attemptedUrls };
  }
}
