import { useEffect } from "react";

const DEFAULT_ROBOTS = "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1";

const upsertMetaTag = (selector, attribute, value) => {
  let tag = document.head.querySelector(selector);

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, value);
    document.head.appendChild(tag);
  }

  return tag;
};

const upsertLinkTag = (selector, rel) => {
  let tag = document.head.querySelector(selector);

  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }

  return tag;
};

const upsertJsonLdScript = (id) => {
  let script = document.head.querySelector(`script[data-seo-schema="${id}"]`);

  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.seoSchema = id;
    document.head.appendChild(script);
  }

  return script;
};

export const SEOHelmet = ({
  title = "Computer Excellence Academy",
  description = "Digital learning platform for computer courses, notes, and student support.",
  keywords = "computer courses, online learning, digital education",
  image = "https://computerexcellanceacademy.com/cea-logo.png",
  url = "https://computerexcellanceacademy.com/",
  type = "website",
  robots = DEFAULT_ROBOTS,
  schema = null,
}) => {
  useEffect(() => {
    document.title = title;

    upsertMetaTag('meta[name="description"]', "name", "description").content = description;
    upsertMetaTag('meta[name="keywords"]', "name", "keywords").content = keywords;
    upsertMetaTag('meta[name="robots"]', "name", "robots").content = robots;
    upsertMetaTag('meta[name="twitter:card"]', "name", "twitter:card").content = "summary_large_image";
    upsertMetaTag('meta[name="twitter:title"]', "name", "twitter:title").content = title;
    upsertMetaTag('meta[name="twitter:description"]', "name", "twitter:description").content = description;
    upsertMetaTag('meta[name="twitter:image"]', "name", "twitter:image").content = image;

    upsertMetaTag('meta[property="og:type"]', "property", "og:type").content = type;
    upsertMetaTag('meta[property="og:title"]', "property", "og:title").content = title;
    upsertMetaTag('meta[property="og:description"]', "property", "og:description").content = description;
    upsertMetaTag('meta[property="og:image"]', "property", "og:image").content = image;
    upsertMetaTag('meta[property="og:url"]', "property", "og:url").content = url;
    upsertMetaTag('meta[property="og:site_name"]', "property", "og:site_name").content =
      "Computer Excellence Academy";

    upsertLinkTag('link[rel="canonical"]', "canonical").href = url;

    const schemaScript = upsertJsonLdScript("page");

    if (schema) {
      schemaScript.textContent = JSON.stringify(schema);
    } else {
      schemaScript.textContent = "";
    }
  }, [title, description, keywords, image, url, type, robots, schema]);

  return null;
};

export const useSEO = (seoData) => {
  useEffect(() => {
    if (!seoData) return;

    document.title = seoData.title || "Computer Excellence Academy";

    const description = seoData.description || "Digital learning platform";
    const keywords = seoData.keywords || "";
    const image = seoData.image || "https://computerexcellanceacademy.com/cea-logo.png";
    const canonical = seoData.canonical || "https://computerexcellanceacademy.com/";
    const robots = seoData.noindex ? "noindex, nofollow" : seoData.robots || DEFAULT_ROBOTS;

    upsertMetaTag('meta[name="description"]', "name", "description").content = description;
    upsertMetaTag('meta[name="keywords"]', "name", "keywords").content = keywords;
    upsertMetaTag('meta[name="robots"]', "name", "robots").content = robots;
    upsertMetaTag('meta[name="twitter:title"]', "name", "twitter:title").content = seoData.title;
    upsertMetaTag('meta[name="twitter:description"]', "name", "twitter:description").content = description;
    upsertMetaTag('meta[name="twitter:image"]', "name", "twitter:image").content = image;
    upsertMetaTag('meta[property="og:title"]', "property", "og:title").content = seoData.title;
    upsertMetaTag('meta[property="og:description"]', "property", "og:description").content = description;
    upsertMetaTag('meta[property="og:image"]', "property", "og:image").content = image;
    upsertMetaTag('meta[property="og:url"]', "property", "og:url").content = canonical;
    upsertMetaTag('meta[property="og:type"]', "property", "og:type").content = seoData.type || "website";

    upsertLinkTag('link[rel="canonical"]', "canonical").href = canonical;

    const schemaScript = upsertJsonLdScript("page");
    schemaScript.textContent = seoData.schema ? JSON.stringify(seoData.schema) : "";
  }, [seoData]);
};

export default SEOHelmet;
