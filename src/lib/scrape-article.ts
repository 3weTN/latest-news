/**
 * Scrapes full article content from source websites
 * Different sources have different HTML structures, so we use source-specific selectors
 */

interface ScrapedContent {
  content: string | null;
  success: boolean;
}

const SCRAPER_CONFIGS = {
  mosaique: {
    selectors: [
      '.article-content',
      '.post-content',
      'article .content',
      '.entry-content',
      '[itemprop="articleBody"]',
    ],
  },
  shems: {
    selectors: [
      '.article-content',
      '.post-content',
      'article .content',
      '.entry-content',
    ],
  },
  tunisienumerique: {
    selectors: [
      '.entry-content',
      '.article-content',
      '.post-content',
      '[itemprop="articleBody"]',
    ],
  },
  kapitalis: {
    selectors: [
      '.entry-content',
      '.article-content',
      '.post-content',
    ],
  },
  lapresse: {
    selectors: [
      '.entry-content',
      '.article-content',
      '.post-content',
      '[itemprop="articleBody"]',
    ],
  },
  rtci: {
    selectors: [
      '.article-content',
      '.entry-content',
      '.post-content',
    ],
  },
};

/**
 * Extracts content from Next.js __NEXT_DATA__ JSON (for Mosaique FM)
 */
function extractFromNextData(html: string): string | null {
  try {
    // Find __NEXT_DATA__ script tag
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/i);
    if (nextDataMatch && nextDataMatch[1]) {
      const jsonData = JSON.parse(nextDataMatch[1]);

      // Navigate to article description
      const description =
        jsonData?.props?.pageProps?.pagedata?.article?.description ||
        jsonData?.props?.pageProps?.article?.description ||
        jsonData?.props?.pageProps?.pagedata?.article?.content;

      if (description && typeof description === 'string' && description.length > 100) {
        return description;
      }
    }
  } catch (error) {
    // JSON parsing failed, continue to other methods
  }

  return null;
}

/**
 * Extracts content using CSS selectors
 */
function extractContentWithSelectors(html: string, selectors: string[]): string | null {
  for (const selector of selectors) {
    // Simple regex-based extraction (avoiding full DOM parser for server-side)
    const selectorClass = selector.replace(/^\./, '').replace(/\[.*\]/, '');

    // Try class-based selector
    if (selector.startsWith('.')) {
      const classRegex = new RegExp(`<[^>]+class=["'][^"']*${selectorClass}[^"']*["'][^>]*>([\\s\\S]*?)<\/[^>]+>`, 'i');
      const match = html.match(classRegex);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // Try itemprop selector
    if (selector.includes('itemprop')) {
      const itempropRegex = /<[^>]+itemprop=["']articleBody["'][^>]*>([\s\S]*?)<\/[^>]+>/i;
      const match = html.match(itempropRegex);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // Try generic article/content tags
    const tagMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (tagMatch && tagMatch[1] && tagMatch[1].length > 500) {
      return tagMatch[1].trim();
    }
  }

  return null;
}

/**
 * Scrapes article content from a URL
 */
export async function scrapeArticleContent(
  url: string,
  sourceId: string
): Promise<ScrapedContent> {
  try {
    // Fetch the article page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8,fr;q=0.7',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      return { content: null, success: false };
    }

    const html = await response.text();

    // Try to extract from Next.js __NEXT_DATA__ first (for Mosaique FM and similar sites)
    if (sourceId === 'mosaique' || sourceId === 'shems') {
      const nextContent = extractFromNextData(html);
      if (nextContent && nextContent.length > 100) {
        return { content: nextContent, success: true };
      }
    }

    // Get scraper config for this source
    const config = SCRAPER_CONFIGS[sourceId as keyof typeof SCRAPER_CONFIGS] || SCRAPER_CONFIGS.mosaique;

    // Try to extract content using configured selectors
    const content = extractContentWithSelectors(html, config.selectors);

    if (content && content.length > 100) {
      return { content, success: true };
    }

    // Fallback: try to extract from meta description or JSON-LD
    const metaDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
    if (metaDescMatch && metaDescMatch[1]) {
      return { content: `<p>${metaDescMatch[1]}</p>`, success: false };
    }

    return { content: null, success: false };
  } catch (error) {
    console.error(`Scraping error for ${url}:`, error);
    return { content: null, success: false };
  }
}
