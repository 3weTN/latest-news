export interface ArticleStartPublish {
  date: string;
  timezone_type?: number;
  timezone?: string;
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
