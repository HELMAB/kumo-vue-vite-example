import { i18n } from "@/i18n";

/**
 * Per-page SEO for the SPA. Updates <title>, the description, canonical URL
 * and the Open Graph / Twitter tags on every navigation and language switch.
 * Google renders JavaScript, so these are what it indexes; social crawlers
 * (Facebook, Telegram) don't, and use the static tags in index.html instead.
 */
const SITE_URL = (import.meta.env.VITE_SITE_URL || location.origin).replace(/\/$/, "");
const OG_LOCALE = { km: "km_KH", en: "en_US" };

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
}

export function applySeo(route) {
  const { t, te, locale } = i18n.global;
  const name = route.name && route.name !== "not-found" ? route.name : null;

  const page = route.meta.title ? t(route.meta.title) : "";
  const title = t("seo.title", { page });
  const descKey = `seo.${name}`;
  const description = name && te(descKey) ? t(descKey) : t("seo.default");
  const url = `${SITE_URL}${route.path === "/" ? "/" : route.path}`;

  document.title = title;
  setMeta("name", "description", description);
  // Keep 404s out of the index
  setMeta("name", "robots", name ? "index, follow, max-image-preview:large" : "noindex, follow");
  setCanonical(url);

  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:url", url);
  setMeta("property", "og:locale", OG_LOCALE[locale.value]);
  setMeta("property", "og:locale:alternate", OG_LOCALE[locale.value === "km" ? "en" : "km"]);
  setMeta("name", "twitter:title", title);
  setMeta("name", "twitter:description", description);
}
