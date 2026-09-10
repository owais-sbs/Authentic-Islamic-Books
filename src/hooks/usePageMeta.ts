import { useEffect } from 'react';

const DEFAULT_TITLE = 'Islamic Digital Library — Explore Centuries of Scholarship';
const DEFAULT_DESCRIPTION =
  'Discover a growing collection of Islamic books and scholarly works, presented in a clean, structured English reading experience.';

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export interface PageMetaOptions {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
  path?: string;
}

/**
 * Set document title + Open Graph / Twitter meta for the current route.
 * Absolute OG image URL is derived from VITE_SITE_URL or window origin.
 */
export function usePageMeta({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  image,
  type = 'website',
  path,
}: PageMetaOptions = {}) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    const origin =
      (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') ||
      (typeof window !== 'undefined' ? window.location.origin : '');
    const ogImage =
      image ||
      (origin ? `${origin}/og-image.jpg` : '/og-image.jpg');
    const url = path && origin ? `${origin}${path}` : typeof window !== 'undefined' ? window.location.href : '';

    setMeta('name', 'description', description);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:image', ogImage);
    setMeta('property', 'og:site_name', 'Islamic Digital Library');
    if (url) setMeta('property', 'og:url', url);

    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', ogImage);

    return () => {
      document.title = prevTitle;
    };
  }, [title, description, image, type, path]);
}
