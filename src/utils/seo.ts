/**
 * Dynamic SEO and Head Metadata Manager
 * 
 * Ensures every view and chapter in AlgoLearn maintains unique, professional
 * document titles, meta descriptions, canonical URLs, Open Graph tags,
 * and JSON-LD structured data without framework boilerplate.
 */

import { ROUTE_METADATA, SITE_CONFIG, SITE_URL, getStructuredData } from '../config/site';

/**
 * Updates all essential document head elements dynamically
 */
export function updateSEO(tabKey: string, chapterTitle?: string) {
  if (typeof document === 'undefined') return;

  const baseMeta = ROUTE_METADATA[tabKey] || ROUTE_METADATA.HOME;
  let title = baseMeta.title;
  let description = baseMeta.description;
  let canonicalPath = baseMeta.canonicalPath;

  // If a specific theory chapter is viewed, tailor title and canonical URL
  if (tabKey === 'THEORY' && chapterTitle) {
    title = `${chapterTitle} – Linear Search Theory | ${SITE_CONFIG.name}`;
    description = `Study ${chapterTitle} as part of the AlgoLearn Linear Search curriculum with interactive visualizers, code snippets, and complexity proofs.`;
  }

  const absoluteCanonical = `${SITE_URL}${canonicalPath}`;

  // 1. Update Document Title
  document.title = title;

  // 2. Helper to set or create meta tag
  const setMeta = (nameAttr: 'name' | 'property', key: string, content: string) => {
    let el = document.querySelector(`meta[${nameAttr}="${key}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(nameAttr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // Standard Meta Tags
  setMeta('name', 'description', description);
  setMeta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  setMeta('name', 'author', SITE_CONFIG.author);

  // Open Graph Metadata
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', absoluteCanonical);
  setMeta('property', 'og:site_name', SITE_CONFIG.name);
  setMeta('property', 'og:type', baseMeta.ogType || 'website');
  setMeta('property', 'og:image', SITE_CONFIG.ogImage);
  setMeta('property', 'og:locale', SITE_CONFIG.locale);

  // Twitter / X Card Metadata
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', description);
  setMeta('name', 'twitter:image', SITE_CONFIG.ogImage);

  // 3. Update Canonical Tag
  let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', absoluteCanonical);

  // 4. Update Schema.org JSON-LD structured data
  const jsonLdData = getStructuredData(tabKey);
  let scriptEl = document.querySelector('script[type="application/ld+json"]#algolearn-schema') as HTMLScriptElement | null;
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.type = 'application/ld+json';
    scriptEl.id = 'algolearn-schema';
    document.head.appendChild(scriptEl);
  }
  scriptEl.textContent = JSON.stringify(jsonLdData);
}
