import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "profile";
  noIndex?: boolean;
}

const DEFAULT_TITLE = "CollegeBook — Digital Campus Network & Student Collaboration Platform | College-Book";
const DEFAULT_DESCRIPTION =
  "CollegeBook (College-Book) is the authentic digital campus network for college students. Discover campus feeds, cross-university explore, find hackathon teammates in Collab Hub, earn verified myCon skill badges, and build your digital graduation memory book.";
const DEFAULT_KEYWORDS =
  "collegebook, college-book, college book, college social network, digital campus platform, student collaboration hub, collab hub, campus feed, cross campus explore, mycon skill badges, university student network, hackathon team finder, college memory book";
const BASE_URL = "https://collegebook.vercel.app";

export const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonical,
  ogImage = `${BASE_URL}/logo.png`,
  ogType = "website",
  noIndex = false,
}: SEOProps) => {
  const location = useLocation();
  const fullTitle = title
    ? `${title} | CollegeBook`
    : DEFAULT_TITLE;
  const canonicalUrl = canonical || `${BASE_URL}${location.pathname}`;

  useEffect(() => {
    // 1. Document Title
    document.title = fullTitle;

    // Helper function to update or create meta tags
    const setMetaTag = (attrName: "name" | "property", attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // 2. Standard Meta Tags
    setMetaTag("name", "title", fullTitle);
    setMetaTag("name", "description", description);
    setMetaTag("name", "keywords", keywords);
    setMetaTag(
      "name",
      "robots",
      noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1"
    );

    // 3. Open Graph
    setMetaTag("property", "og:title", fullTitle);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:url", canonicalUrl);
    setMetaTag("property", "og:type", ogType);
    setMetaTag("property", "og:image", ogImage);
    setMetaTag("property", "og:site_name", "CollegeBook");

    // 4. Twitter Cards
    setMetaTag("name", "twitter:title", fullTitle);
    setMetaTag("name", "twitter:description", description);
    setMetaTag("name", "twitter:image", ogImage);
    setMetaTag("name", "twitter:url", canonicalUrl);

    // 5. Canonical Link
    let linkElement = document.querySelector('link[rel="canonical"]');
    if (!linkElement) {
      linkElement = document.createElement("link");
      linkElement.setAttribute("rel", "canonical");
      document.head.appendChild(linkElement);
    }
    linkElement.setAttribute("href", canonicalUrl);
  }, [fullTitle, description, keywords, canonicalUrl, ogImage, ogType, noIndex]);

  return null;
};

export default SEO;
