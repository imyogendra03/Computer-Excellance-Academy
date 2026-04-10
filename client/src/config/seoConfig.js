export const SITE_URL = "https://computerexcellanceacademy.com";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/cea-logo.png`;
export const DEFAULT_ROBOTS = "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1";
export const NOINDEX_ROBOTS = "noindex, nofollow";
// Page rank weights for SEO optimization
export const PAGE_RANK_WEIGHTS = {
  homepage: 1.0,
  coursePages: 0.9,
  contentPages: 0.85,
  utilityPages: 0.6,
  authPages: 0.1,
};
export const seoConfig = {
  site: {
    name: "Computer Excellence Academy",
    shortName: "CEA",
    description:
      "Computer Excellence Academy (CEA) is India's premier digital learning institute for DCA, ADCA, Tally Prime, and Web Development. Get free study notes, certifications, and live support.",
    url: SITE_URL,
    logo: `${SITE_URL}/cea-logo.png`,
    email: "computerexcellenceacademy@gmail.com",
    phone: "+91-99999-99999",    address: "Basti, Uttar Pradesh, India - 272131",
    socialMedia: {
      facebook: "https://facebook.com/computerexcellenceacademy",
      instagram: "https://instagram.com/computerexcellenceacademy",
      youtube: "https://youtube.com/@computerexcellenceacademy",
      twitter: "https://twitter.com/ceadigital",
    },  },
  pages: {
    home: {
      title: "Computer Excellence Academy | Top DCA, ADCA & Tally Prime Training Online",
      description:
        "Master computer skills for free with Computer Excellence Academy. Enroll in DCA, ADCA, Tally Prime with GST, Typing, and Web Development courses with free PDF notes.",
      keywords:
        "computer excellence academy, free computer courses, adca course in hindi, dca certificate online, tally prime training, ccc exam notes, learn typing, digital education india",
      canonical: `${SITE_URL}/`,
      image: DEFAULT_OG_IMAGE,
      type: "website",
      robots: DEFAULT_ROBOTS,
      pageRankWeight: PAGE_RANK_WEIGHTS.homepage,
      internalLinks: ["/courses", "/notes", "/aboutus", "/support"],
    },
    courses: {
      title: "All Computer Courses & Free Certifications | Computer Excellence Academy",
      description:
        "Explore professional computer courses including ADCA, Basic Computer (DCA), Tally EPR 9, and Programming. Join active batches and start your digital career today.",
      keywords:
        "adca syllabus, dca computer course, tally full course online, free computer certificates, web development batch, computer academy near me, best computer institute online",
      canonical: `${SITE_URL}/courses`,
      image: DEFAULT_OG_IMAGE,
      type: "website",
      robots: DEFAULT_ROBOTS,
      pageRankWeight: PAGE_RANK_WEIGHTS.coursePages,
      internalLinks: ["/", "/notes", "/batch-preview/:id", "/support"],
    },
    notes: {
      title: "Download Computer Study Notes PDF | Free Course Material | CEA",
      description:
        "Get comprehensive study notes for DCA, ADCA, CCC, and Tally Prime. High-quality PDF materials for self-paced learning and exam success.",
      keywords:
        "computer notes pdf, dca notes hindi, adca free study material, ccc preparation guide, tally prime notes download, free educational pdf, study material computer",
      canonical: `${SITE_URL}/notes`,
      image: DEFAULT_OG_IMAGE,
      type: "website",
      robots: DEFAULT_ROBOTS,
      pageRankWeight: PAGE_RANK_WEIGHTS.coursePages,
      internalLinks: ["/", "/courses", "/aboutus"],
    },
    support: {
      title: "Contact Student Support | Computer Excellence Academy Helpdesk",
      description:
        "Need help with your course or dashboard? Contact Computer Excellence Academy support team for quick resolution of your technical or academic queries.",
      keywords:
        "cea support, contact computer excellence academy, student helpdesk, computer institute inquiry, tech support",
      canonical: `${SITE_URL}/support`,
      image: DEFAULT_OG_IMAGE,
      type: "website",
      robots: DEFAULT_ROBOTS,
      pageRankWeight: PAGE_RANK_WEIGHTS.contentPages,
      internalLinks: ["/", "/courses", "/aboutus"],
    },
    about: {
      title: "About Computer Excellence Academy | Our Vision for Digital Literacy",
      description:
        "Computer Excellence Academy was founded with the mission to provide accessible, high-quality computer education to students across India. Learn about our expert faculty and success stories.",
      keywords:
        "about cea, digital literacy mission india, computer institute history, student success computer academy, online computer training",
      canonical: `${SITE_URL}/aboutus`,
      image: DEFAULT_OG_IMAGE,
      type: "website",
      robots: DEFAULT_ROBOTS,
      pageRankWeight: PAGE_RANK_WEIGHTS.contentPages,
      internalLinks: ["/", "/courses", "/notes", "/support"],
    },
    login: {
      title: "Student Dashboard Login | Computer Excellence Academy",
      description:
        "Securely login to your CEA student portal to access your courses, exams, results, and study materials.",
      keywords: "student portal login, cea user login, dashboard access",
      canonical: `${SITE_URL}/login`,
      image: DEFAULT_OG_IMAGE,
      type: "website",
      robots: NOINDEX_ROBOTS,
      noindex: true,
    },
    register: {
      title: "Join Computer Excellence Academy | Free Student Registration",
      description:
        "Sign up for a free student account at CEA and unlock access to premium computer courses, live batches, and certifications.",
      keywords: "create cea account, student signup, free computer training registration",
      canonical: `${SITE_URL}/register`,
      image: DEFAULT_OG_IMAGE,
      type: "website",
      robots: NOINDEX_ROBOTS,
      noindex: true,
    },
    adminLogin: {
      title: "Admin Management Portal | CEA Control Center",
      description: "Secure gateway for Computer Excellence Academy administrative staff and management.",
      keywords: "admin login, faculty portal",
      canonical: `${SITE_URL}/adlogin`,
      image: DEFAULT_OG_IMAGE,
      type: "website",
      robots: NOINDEX_ROBOTS,
      noindex: true,
    },
    dashboard: {
      title: "My Learning Dashboard | Computer Excellence Academy",
      description: "Manage your computer learning progress, track attendance, view exam results, and resume your lectures.",
      keywords: "my learning path, student dashboard cea",
      canonical: `${SITE_URL}/userdash`,
      image: DEFAULT_OG_IMAGE,
      type: "website",
      robots: NOINDEX_ROBOTS,
      noindex: true,
    },
    admin: {
      title: "CEA Management Suite | Admin Analytics & Controls",
      description: "Unified admin dashboard for curriculum management, student oversight, and operational analytics.",
      keywords: "admin dashboard controls",
      canonical: `${SITE_URL}/admin`,
      image: DEFAULT_OG_IMAGE,
      type: "website",
      robots: NOINDEX_ROBOTS,
      noindex: true,
    },
    notFound: {
      title: "404 - Resource Not Found | Computer Excellence Academy",
      description:
        "Oops! The page you're searching for has moved or doesn't exist. Let's get you back to your learning path.",
      keywords: "404 not found",
      canonical: `${SITE_URL}/404`,
      image: DEFAULT_OG_IMAGE,
      type: "website",
      robots: NOINDEX_ROBOTS,
      noindex: true,
    },
  },
};

export const buildAbsoluteUrl = (pathname = "/") => {
  if (!pathname || pathname === "/") return `${SITE_URL}/`;

  return `${SITE_URL}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
};

export const buildOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: seoConfig.site.name,
  alternateName: seoConfig.site.shortName,
  url: seoConfig.site.url,
  logo: seoConfig.site.logo,
  description: seoConfig.site.description,
  email: seoConfig.site.email,
  phone: seoConfig.site.phone,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Vedpur, Shukulpur Bazar, Ramjanki Marg",
    addressLocality: "Basti",
    addressRegion: "Uttar Pradesh",
    postalCode: "272131",
    addressCountry: "IN",
  },
  sameAs: Object.values(seoConfig.site.socialMedia),
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Support",
    email: seoConfig.site.email,
    telephone: seoConfig.site.phone,
  },
});

export const buildWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: seoConfig.site.name,
  url: seoConfig.site.url,
  description: seoConfig.site.description,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/courses?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});

/**
 * Build Course schema for course listing pages
 */
export const buildCourseSchema = (course) => ({
  "@context": "https://schema.org",
  "@type": "Course",
  name: course.title || "Computer Course",
  description: course.description || course.shortDescription || "",
  provider: {
    "@type": "Organization",
    name: seoConfig.site.name,
    sameAs: seoConfig.site.url,
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "1500+",
  },
});

/**
 * Build BreadcrumbList schema
 */
export const buildBreadcrumbSchema = (items = []) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
  })),
});

export default seoConfig;
