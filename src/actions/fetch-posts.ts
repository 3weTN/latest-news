"use server";

import { Article } from "@/types";
import { XMLParser } from "fast-xml-parser";

export type ArticleDetailResult = {
  article: Article | null;
  attemptedUrls: string[];
};

const MOSAIQUE_SOURCE = "mosaique" as const;
const RTCI_SOURCE = "rtci" as const;
const MOSAIQUE_PER_PAGE = 24;
const RTCI_FEED_URL = "https://www.rtci.tn/articles/rss";

const FETCH_OPTIONS = {
  next: {
    revalidate: 300,
  },
} as const;

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  removeNSPrefix: true,
  trimValues: true,
  cdataPropName: "__cdata",
});

const textContent = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const asRecord = value as Record<string, unknown>;
    if (typeof asRecord.__cdata === "string") return asRecord.__cdata;
    if (typeof asRecord["#text"] === "string") return asRecord["#text"] as string;
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
      const date = new Date(candidate < 10_000_000_000 ? candidate * 1000 : candidate);
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

const mapMosaiqueArticle = (article: Article): Article => ({
  ...article,
  source: MOSAIQUE_SOURCE,
  link2: article.link2 ?? article.link ?? "",
});

const parseRtciItem = (item: any): Article | null => {
  if (!item) return null;

  const rawLink = textContent(item.link || (item.guid && item.guid["#text"]) || item.guid);
  const link = rawLink.trim();
  const title = textContent(item.title).trim();

  if (!link || !title) {
    return null;
  }

  const rawDescription =
    textContent(item.description) || textContent(item["content:encoded"]);
  const intro =
    rawDescription.length > 280 ? `${rawDescription.slice(0, 277)}...` : rawDescription;

  const categoryValue = Array.isArray(item.category)
    ? textContent(item.category[0])
    : textContent(item.category);
  const category = categoryValue.trim() || "RTCI";
  const labelSlug = slugify(category) || "rtci";

  const guidValue =
    textContent(item.guid?.["#text"]) ||
    textContent(item.guid) ||
    link ||
    title;
  const id = hashString(guidValue || link || title);
  const fallbackSlug = `rtci-${id}`;
  const rawSlug = slugify(title);
  const slugValue = rawSlug ? `rtci-${rawSlug}` : fallbackSlug;

  const rawPubDate = textContent(item.pubDate);
  const pubDate = rawPubDate ? new Date(rawPubDate) : null;
  const publishISO =
    pubDate && !Number.isNaN(pubDate.getTime()) ? pubDate.toISOString() : undefined;

  const mediaCandidate = item["media:content"] ?? item.content ?? item.enclosure;
  const media = Array.isArray(mediaCandidate) ? mediaCandidate[0] : mediaCandidate;
  const imageUrl = media ? textContent(media.url ?? media["@_url"]) : "";

  return {
    tid: -2,
    label: category || "RTCI",
    tslug: labelSlug || `rtci-${id}`,
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
    source: RTCI_SOURCE,
  };
};

const fetchMosaiqueArticles = async (page: number): Promise<Article[]> => {
  const apiUrl = `https://api.mosaiquefm.net/api/ar/${MOSAIQUE_PER_PAGE}/${page}/articles`;

  try {
    const response = await fetch(apiUrl, FETCH_OPTIONS);
    if (!response.ok) {
      throw new Error(`Mosaique API returned ${response.status}`);
    }

    const data = await response.json();
    const items = Array.isArray(data?.items) ? (data.items as Article[]) : [];
    return items.map(mapMosaiqueArticle);
  } catch (error) {
    console.error("Error fetching Mosaique articles:", error);
    return [];
  }
};

const fetchRtciArticles = async (): Promise<Article[]> => {
  try {
    const response = await fetch(RTCI_FEED_URL, FETCH_OPTIONS);
    if (!response.ok) {
      throw new Error(`RTCI feed returned ${response.status}`);
    }

    const xml = await response.text();
    const parsed = xmlParser.parse(xml);
    const items = parsed?.rss?.channel?.item;
    const itemList = Array.isArray(items) ? items : items ? [items] : [];

    return itemList
      .map(parseRtciItem)
      .filter((article): article is Article => Boolean(article));
  } catch (error) {
    console.error("Error fetching RTCI RSS feed:", error);
    return [];
  }
};

export async function fetchPosts(page: number) {
  const [mosaiqueArticles, rtciArticles] = await Promise.all([
    fetchMosaiqueArticles(page),
    page === 1 ? fetchRtciArticles() : Promise.resolve([]),
  ]);

  const combined =
    page === 1
      ? [...rtciArticles, ...mosaiqueArticles].sort(
          (a, b) => getArticleTimestamp(b) - getArticleTimestamp(a)
        )
      : mosaiqueArticles;

  if (combined.length === 0) {
    return null;
  }

  return combined;
}

export async function fetchArticleBySlug(
  slug: string
): Promise<ArticleDetailResult> {
  const attemptedUrls: string[] = [];
  // If slug looks like a numeric id, call the article detail endpoint pattern.
  const isNumeric = /^\d+$/.test(slug);

  if (isNumeric) {
    // Try multiple language endpoints following the API pattern.
    const langs = ["ar", "fr"];
    for (const lang of langs) {
      const detailUrl = `https://api.mosaiquefm.net/api/${lang}/5/1/articles/${encodeURIComponent(
        slug
      )}`;
      attemptedUrls.push(detailUrl);
      try {
        console.log("Fetching article detail from", detailUrl);
        const res = await fetch(detailUrl, FETCH_OPTIONS);
        if (!res.ok) continue;
        const data = await res.json();
        const article: any = data?.item ?? data?.article ?? data?.data ?? data;
        if (article) {
          return {
            article: { ...(article as Article), source: MOSAIQUE_SOURCE },
            attemptedUrls,
          };
        }
      } catch (e) {
        // try next language
        continue;
      }
    }
  }

  // Fallback: search recent posts (paginated) to find a matching slug or id.
  try {
    const decoded = decodeURIComponent(slug);
    const maxPages = 8;
    for (let p = 1; p <= maxPages; p++) {
      const posts = await fetchPosts(p);
      if (!posts || posts.length === 0) continue;
      const found = posts.find(
        (it) =>
          it.slug === decoded ||
          it.tslug === decoded ||
          String(it.id) === decoded ||
          String(it.id) === slug
      );
      if (found) return { article: found, attemptedUrls };
    }

    console.log("Article not found for slug:", slug);

    return { article: null, attemptedUrls };
  } catch (e) {
    return { article: null, attemptedUrls };
  }
}
