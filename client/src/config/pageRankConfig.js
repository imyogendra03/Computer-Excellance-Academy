/**
 * Page Rank Algorithm Configuration for Internal Linking Strategy
 * Implements SEO optimization through strategic internal linking
 */

export const pageRankConfig = {
  // Priority levels for page rank (1-10, higher = important)
  // Used to determine link distribution and breadcrumb strategy
  pages: {
    "/": { rank: 10, internalLinks: 8, priority: "high" },
    "/courses": { rank: 9, internalLinks: 7, priority: "high" },
    "/notes": { rank: 8, internalLinks: 6, priority: "high" },
    "/aboutus": { rank: 7, internalLinks: 5, priority: "medium" },
    "/support": { rank: 6, internalLinks: 4, priority: "medium" },
    "/batch-preview/:id": { rank: 7, internalLinks: 5, priority: "medium" },
    "/login": { rank: 4, internalLinks: 2, priority: "low", noindex: true },
    "/register": { rank: 4, internalLinks: 2, priority: "low", noindex: true },
    "/forgot": { rank: 3, internalLinks: 1, priority: "low", noindex: true },
    "/admin": { rank: 2, internalLinks: 0, priority: "low", noindex: true },
  },

  // Internal linking strategy - each page links to these pages
  internalLinkingStrategy: {
    "/": [
      { href: "/courses", anchor: "Explore All Courses", section: "primary" },
      { href: "/notes", anchor: "Download PDF Notes", section: "primary" },
      { href: "/aboutus", anchor: "About our Academy", section: "footer" },
      { href: "/support", anchor: "Get Support", section: "footer" },
      { href: "/batch-preview/:id", anchor: "Batch Details", section: "featured" },
    ],
    "/courses": [
      { href: "/", anchor: "Back to Home", section: "breadcrumb" },
      { href: "/notes", anchor: "Study Materials", section: "related" },
      { href: "/batch-preview/:id", anchor: "Join Batch", section: "cta" },
      { href: "/aboutus", anchor: "Our Instructors", section: "footer" },
    ],
    "/notes": [
      { href: "/", anchor: "Home", section: "breadcrumb" },
      { href: "/courses", anchor: "View Courses", section: "related" },
      { href: "/batch-preview/:id", anchor: "Live Batches", section: "cta" },
    ],
    "/aboutus": [
      { href: "/", anchor: "Home", section: "breadcrumb" },
      { href: "/courses", anchor: "Our Courses", section: "content" },
      { href: "/support", anchor: "Contact Us", section: "footer" },
    ],
    "/support": [
      { href: "/", anchor: "Home", section: "breadcrumb" },
      { href: "/aboutus", anchor: "About Academy", section: "related" },
      { href: "/courses", anchor: "Explore Courses", section: "footer" },
    ],
  },

  // Breadcrumb trails for each page (for schema.org markup)
  breadcrumbs: {
    "/": [{ name: "Home", url: "/" }],
    "/courses": [
      { name: "Home", url: "/" },
      { name: "Courses", url: "/courses" },
    ],
    "/notes": [
      { name: "Home", url: "/" },
      { name: "Study Materials", url: "/notes" },
    ],
    "/aboutus": [
      { name: "Home", url: "/" },
      { name: "About Us", url: "/aboutus" },
    ],
    "/support": [
      { name: "Home", url: "/" },
      { name: "Support", url: "/support" },
    ],
    "/batch-preview/:id": [
      { name: "Home", url: "/" },
      { name: "Courses", url: "/courses" },
      { name: "Batch Details", url: "/batch-preview/:id" },
    ],
  },

  // Page Rank Distribution Algorithm
  // Calculate relative importance of pages
  calculatePageRank: () => {
    const pages = pageRankConfig.pages;
    const totalRank = Object.values(pages).reduce((sum, p) => sum + (p.rank || 0), 0);
    
    const rankDistribution = {};
    Object.entries(pages).forEach(([path, config]) => {
      rankDistribution[path] = (config.rank / totalRank) * 100;
    });
    
    return rankDistribution;
  },

  // Get recommended internal links for a page
  getInternalLinks: (pathname) => {
    return pageRankConfig.internalLinkingStrategy[pathname] || [];
  },

  // Get breadcrumb schema for a page
  getBreadcrumbs: (pathname) => {
    return pageRankConfig.breadcrumbs[pathname] || [{ name: "Home", url: "/" }];
  },

  // Generate breadcrumb schema markup
  buildBreadcrumbSchema: (pathname) => {
    const breadcrumbs = pageRankConfig.getBreadcrumbs(pathname);
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: `https://computerexcellenceacademy.com${item.url}`,
      })),
    };
  },

  // SEO Score calculation based on page rank and linking
  calculateSEOScore: (pathname) => {
    const pageConfig = pageRankConfig.pages[pathname];
    if (!pageConfig) return 0;
    
    const rankScore = pageConfig.rank * 10; // 0-100
    const linkScore = pageConfig.internalLinks * 5; // 0-50
    const priorityScore = 
      pageConfig.priority === "high" ? 30 :
      pageConfig.priority === "medium" ? 20 : 10;
    
    return Math.min(100, rankScore + linkScore + priorityScore);
  },
};

export default pageRankConfig;
