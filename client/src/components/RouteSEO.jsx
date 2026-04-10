import { matchPath, useLocation } from "react-router-dom";
import SEOHelmet from "./SEOHelmet";
import seoConfig, {
  DEFAULT_OG_IMAGE,
  DEFAULT_ROBOTS,
  NOINDEX_ROBOTS,
  buildAbsoluteUrl,
  buildOrganizationSchema,
  buildWebsiteSchema,
} from "../config/seoConfig";

const routeSeoRules = [
  { path: "/", exact: true, config: seoConfig.pages.home },
  { path: "/courses", exact: true, config: seoConfig.pages.courses },
  { path: "/course", exact: true, config: seoConfig.pages.courses },
  { path: "/notes", exact: true, config: seoConfig.pages.notes },
  { path: "/support", exact: true, config: seoConfig.pages.support },
  { path: "/aboutus", exact: true, config: seoConfig.pages.about },
  { path: "/login", exact: true, config: seoConfig.pages.login },
  { path: "/register", exact: true, config: seoConfig.pages.register },
  { path: "/adlogin", exact: true, config: seoConfig.pages.adminLogin },
  { path: "/admin/*", exact: false, config: seoConfig.pages.admin },
  { path: "/UserDash/*", exact: false, config: seoConfig.pages.dashboard },
  { path: "*", exact: false, config: seoConfig.pages.notFound },
];

const resolveSeoConfig = (pathname) => {
  for (const rule of routeSeoRules) {
    const matched = matchPath(
      { path: rule.path, end: rule.exact },
      pathname
    );

    if (matched) {
      return rule.config;
    }
  }

  return seoConfig.pages.notFound;
};

const buildPageSchema = (pageConfig, pathname) => {
  const pageUrl = pageConfig.canonical || buildAbsoluteUrl(pathname);

  return {
    "@context": "https://schema.org",
    "@graph": [
      buildOrganizationSchema(),
      buildWebsiteSchema(),
      {
        "@type": "WebPage",
        name: pageConfig.title,
        description: pageConfig.description,
        url: pageUrl,
      },
    ],
  };
};

const RouteSEO = () => {
  const location = useLocation();
  const pageConfig = resolveSeoConfig(location.pathname);

  const isPrivateRoute =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/UserDash") ||
    pageConfig.noindex;

  const canonical = isPrivateRoute
    ? pageConfig.canonical || buildAbsoluteUrl(location.pathname)
    : pageConfig.canonical || buildAbsoluteUrl(location.pathname);

  return (
    <SEOHelmet
      title={pageConfig.title}
      description={pageConfig.description}
      keywords={pageConfig.keywords}
      image={pageConfig.image || DEFAULT_OG_IMAGE}
      url={canonical}
      type={pageConfig.type || "website"}
      robots={isPrivateRoute ? NOINDEX_ROBOTS : pageConfig.robots || DEFAULT_ROBOTS}
      schema={buildPageSchema(pageConfig, location.pathname)}
    />
  );
};

export default RouteSEO;
