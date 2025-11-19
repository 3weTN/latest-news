export interface BaseNewsSource {
  id: string;
  name: string;
  enabledByDefault?: boolean;
  firstPageOnly?: boolean;
  maxAgeDays?: number;
}

export interface ApiNewsSource extends BaseNewsSource {
  type: "api";
  endpoint: string;
  perPage?: number;
  params?: Record<string, string | number>;
}

export interface RssNewsSource extends BaseNewsSource {
  type: "rss";
  endpoint: string;
}

export type NewsSource = ApiNewsSource | RssNewsSource;

export const NEWS_SOURCES: NewsSource[] = [
  {
    id: "mosaique",
    name: "Mosaique FM",
    type: "api",
    endpoint: "https://api.mosaiquefm.net/api/{lang}/{perPage}/{page}/articles",
    perPage: 24,
    params: {
      lang: "ar",
    },
    enabledByDefault: true,
  },
  {
    id: "rtci",
    name: "RTCI",
    type: "rss",
    endpoint: "https://www.rtci.tn/articles/rss",
    firstPageOnly: true,
    maxAgeDays: 30,
    enabledByDefault: true,
  },
  {
    id: "tunisienumerique",
    name: "Tunisie Numérique",
    type: "rss",
    endpoint: "https://www.tunisienumerique.com/feed-actualites-tunisie.xml",
    maxAgeDays: 2,
    enabledByDefault: true,
  },
  {
    id: "kapitalis",
    name: "Kapitalis",
    type: "rss",
    endpoint: "https://kapitalis.com/tunisie/feed/",
    maxAgeDays: 2,
    enabledByDefault: true,
  },
  {
    id: "lapresse",
    name: "La Presse",
    type: "rss",
    endpoint: "https://lapresse.tn/feed/",
    maxAgeDays: 2,
    enabledByDefault: true,
  },
];
