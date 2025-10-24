import { fetchPosts } from "@/actions/fetch-posts";
import { Article } from "@/types";

const baseUrl = "https://mosaiquefm.net";

function generateSiteMap(articles: Article[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <!-- Home page -->
     <url>
       <loc>${baseUrl}</loc>
       <changefreq>hourly</changefreq>
       <priority>1.0</priority>
     </url>
    ${articles
      .map((article) => {
        // Safely parse publish date; avoid invalid Date -> toISOString() errors
        const raw = (article as any).startPublish;
        const d = raw ? new Date(raw) : null;
        const publishDate = d && !isNaN(d.getTime()) ? d.toISOString() : null;
        const slug = article.slug || article.id;
        return `
      <url>
          <loc>${baseUrl}/article/${encodeURIComponent(String(slug))}</loc>
          ${publishDate ? `<lastmod>${publishDate}</lastmod>` : ""}
          <changefreq>daily</changefreq>
          <priority>0.8</priority>
      </url>
    `;
      })
      .join("")}
   </urlset>
 `;
}

export async function GET() {
  try {
    // Fetch first few pages of articles for the sitemap
    const pages = 4; // Adjust based on your needs
    const articles: Article[] = [];

    for (let page = 1; page <= pages; page++) {
      const posts = await fetchPosts(page);
      if (posts) {
        articles.push(...posts);
      }
    }

    // Generate sitemap XML
    const sitemap = generateSiteMap(articles);

    return new Response(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
}
