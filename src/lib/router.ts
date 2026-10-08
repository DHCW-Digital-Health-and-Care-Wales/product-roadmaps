import { useEffect, useState, type MouseEvent } from 'react';
import { LANG_PARAM } from './i18n';

/**
 * Path routing: the landing page is the site root and each product is
 * `<base><slug>/`. The build prerenders an index.html at each of those paths
 * (scripts/prerender.ts), and the URL hash stays free for in-page links.
 */
const BASE = import.meta.env.BASE_URL;

export function slugFromPath(pathname: string): string | null {
  if (!pathname.startsWith(BASE)) return null;
  const slug = pathname
    .slice(BASE.length)
    .replace(/(^|\/)index\.html$/, '')
    .replace(/\/+$/, '');
  if (!slug) return null;
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export function pathFor(slug: string | null): string {
  return slug ? `${BASE}${encodeURIComponent(slug)}/` : BASE;
}

/** The link to a product (or the landing page), keeping any `?lang=`. */
export function productHref(slug: string | null): string {
  const path = pathFor(slug);
  if (typeof window === 'undefined') return path;
  const lang = new URLSearchParams(window.location.search).get(LANG_PARAM);
  return lang ? `${path}?${new URLSearchParams({ [LANG_PARAM]: lang })}` : path;
}

export function navigate(slug: string | null) {
  window.history.pushState({}, '', productHref(slug));
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo(0, 0);
}

/** Click handler for links that should navigate without a full reload. */
export function onNavigate(slug: string | null) {
  return (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.button !== 0
    ) {
      return;
    }
    event.preventDefault();
    navigate(slug);
  };
}

/**
 * The current product slug, or null on the landing page. The prerender passes
 * `serverSlug` because there is no URL to read.
 */
export function useProductRoute(serverSlug?: string | null): string | null {
  const [product, setProduct] = useState(() =>
    serverSlug === undefined
      ? slugFromPath(window.location.pathname)
      : serverSlug,
  );
  useEffect(() => {
    const onPop = () => setProduct(slugFromPath(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  return product;
}
