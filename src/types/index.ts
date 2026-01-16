export interface ArticleStartPublish {
  date: string;
  timezone_type?: number;
  timezone?: string;
}

export interface RssMediaContent {
  url?: string;
  "@_url"?: string;
}

export interface RssGuid {
  "#text"?: string;
  [key: string]: unknown;
}

export interface RssItem {
  title?: string | { "#text"?: string; __cdata?: string };
  link?: string | { "#text"?: string; __cdata?: string };
  guid?: string | RssGuid;
  description?: string | { "#text"?: string; __cdata?: string };
  "content:encoded"?: string | { "#text"?: string; __cdata?: string };
  category?: string | string[] | { "#text"?: string; __cdata?: string };
  pubDate?: string | { "#text"?: string; __cdata?: string };
  "media:content"?: RssMediaContent | RssMediaContent[];
  content?: RssMediaContent | RssMediaContent[];
  enclosure?: RssMediaContent | RssMediaContent[];
  [key: string]: unknown;
}

export interface Article {
  tid: number;
  label: string;
  tslug: string;
  id: number;
  title: string;
  slug: string;
  intro: string;
  summary?: string;
  seoAlt: string;
  image: string;
  startPublish?:
    | string
    | number
    | Date
    | ArticleStartPublish
    | null
    | undefined;
  date?: string;
  created?: string;
  updated?: string;
  category?: string;
  link: string;
  link2: string;
  firstItem: boolean;
  content?: string;
  body?: string;
  article?: string;
  source?: string;
}

export type ArticleSummary = Pick<
  Article,
  | "id"
  | "slug"
  | "title"
  | "intro"
  | "image"
  | "seoAlt"
  | "label"
  | "source"
  | "startPublish"
  | "date"
  | "created"
  | "updated"
>;
