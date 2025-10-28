import { Article, ArticleStartPublish } from "@/types";

type ArticleDateSource =
  | Article["startPublish"]
  | Article["date"]
  | Article["created"]
  | Article["updated"]
  | null
  | undefined;

interface ParsedDateResult {
  date: Date;
  timeZone?: string;
}

const displayLocale = "en-GB";

const baseFormatterOptions: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
};

const defaultDateFormatter = new Intl.DateTimeFormat(displayLocale, baseFormatterOptions);

const isStartPublishRecord = (
  value: unknown
): value is ArticleStartPublish => {
  return (
    typeof value === "object" &&
    value !== null &&
    "date" in value &&
    typeof (value as ArticleStartPublish).date === "string"
  );
};

const parseNumericDate = (value: number): Date | null => {
  const ms = value < 10_000_000_000 ? value * 1000 : value;
  const date = new Date(ms);
  return Number.isNaN(date.getTime()) ? null : date;
};

const parseDateString = (raw: string): Date | null => {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (/^\d+$/.test(trimmed)) {
    return parseNumericDate(Number(trimmed));
  }

  let normalized = trimmed.replace(" ", "T");
  normalized = normalized.replace(/\.(\d{3})\d+$/, ".$1");

  const candidates = [
    normalized,
    `${normalized}Z`,
    trimmed,
    `${trimmed}Z`,
  ];

  for (const candidate of candidates) {
    const date = new Date(candidate);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
};

const toDate = (value: ArticleDateSource): ParsedDateResult | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : { date: value };
  }

  if (typeof value === "number") {
    const date = parseNumericDate(value);
    return date ? { date } : null;
  }

  if (typeof value === "string") {
    const date = parseDateString(value);
    return date ? { date } : null;
  }

  if (isStartPublishRecord(value)) {
    const date = parseDateString(value.date);
    return date ? { date, timeZone: value.timezone } : null;
  }

  const fallback = new Date(value as Date);
  return Number.isNaN(fallback.getTime()) ? null : { date: fallback };
};

const formatDisplay = (date: Date, timeZone?: string): string => {
  if (!timeZone) {
    return defaultDateFormatter.format(date);
  }

  try {
    return new Intl.DateTimeFormat(displayLocale, {
      ...baseFormatterOptions,
      timeZone,
    }).format(date);
  } catch {
    return defaultDateFormatter.format(date);
  }
};

export interface ArticlePublishDate {
  date: Date;
  iso: string;
  display: string;
  timeZone?: string;
}

export function getArticlePublishDate(
  article: Article
): ArticlePublishDate | null {
  const sources: ArticleDateSource[] = [
    article.startPublish ?? null,
    article.date ?? null,
    article.created ?? null,
    article.updated ?? null,
  ];

  for (const source of sources) {
    const parsed = toDate(source);
    if (!parsed) continue;

    return {
      date: parsed.date,
      iso: parsed.date.toISOString(),
      display: formatDisplay(parsed.date, parsed.timeZone),
      timeZone: parsed.timeZone,
    };
  }

  return null;
}
