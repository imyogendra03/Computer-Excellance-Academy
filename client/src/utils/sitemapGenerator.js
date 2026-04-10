/**
 * SEO Sitemap Generator
 * Generates XML and JSON sitemaps for search engine indexing
 */

import pageRankConfig from "../config/pageRankConfig";

export const generateXMLSitemap = (baseUrl = "https://computerexcellenceacademy.com") => {
  const pages = Object.entries(pageRankConfig.pages).filter(
    ([_, config]) => !config.noindex
  );

  const xmlUrls = pages
    .map(([path, config]) => {
      const priority = 
        config.priority === "high" ? "0.9" :
        config.priority === "medium" ? "0.7" : "0.5";

      return `  <url>
    <loc>${baseUrl}${path}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>${config.priority === "high" ? "weekly" : "monthly"}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${xmlUrls}
</urlset>`;
};

export const generateJSONSitemap = (baseUrl = "https://computerexcellanceacademy.com") => {
  const pages = Object.entries(pageRankConfig.pages).filter(
    ([_, config]) => !config.noindex
  );

  return {
    sitemapVersion: "1.0",
    isSitemapIndex: false,
    baseUrl,
    lastUpdate: new Date().toISOString(),
    urls: pages.map(([path, config]) => ({
      url: `${baseUrl}${path}`,
      lastmod: new Date().toISOString().split("T")[0],
      changefreq: config.priority === "high" ? "weekly" : "monthly",
      priority: 
        config.priority === "high" ? 0.9 :
        config.priority === "medium" ? 0.7 : 0.5,
      pageRank: pageRankConfig.calculatePageRank()[path] || 0,
    })),
  };
};

/**
 * Generate robots.txt content
 */
export const generateRobotsTxt = () => {
  return `# Computer Excellence Academy - robots.txt
# Generated for SEO Optimization

User-agent: *
Allow: /
Allow: /courses
Allow: /notes
Allow: /aboutus
Allow: /support

Disallow: /admin
Disallow: /admin/
Disallow: /user/
Disallow: /dashboard
Disallow: /login
Disallow: /register
Disallow: /forgot
Disallow: /adlogin
Disallow: /*.json$
Disallow: /api/

# Crawl delay to prevent server overload
Crawl-delay: 1

# Sitemap locations
Sitemap: https://computerexcellenceacademy.com/sitemap.xml
Sitemap: https://computerexcellenceacademy.com/sitemap.json

# Google specific
User-agent: Googlebot
Allow: /
Crawl-delay: 0

# Bing specific
User-agent: Bingbot
Allow: /
Crawl-delay: 0
`;
};

export default { generateXMLSitemap, generateJSONSitemap, generateRobotsTxt };
