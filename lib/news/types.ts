export const BBC_NEWS_URL = 'https://www.bbc.co.uk/news';
export const NEWS_REFRESH_MS = 15 * 60 * 1000;

export type NewsItem = {
  title: string;
  url: string;
  publishedAt: string;
  imageUrl?: string;
  description?: string;
};

export type NewsSnapshot = {
  items: NewsItem[];
  fetchedAt: string;
  feedUpdatedAt: string | null;
};
