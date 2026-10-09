import { useEffect, useState, type MouseEvent } from 'react';
import { isLang, type Lang } from './i18n';

/**
 * Path routing: every page sits under its language, `<base><lang>/` for the
 * landing page and `<base><lang>/<slug>/` for a product, so the build can
 * prerender each language (scripts/prerender.ts) and it works without
 * JavaScript. The site root redirects to a language (src/main.tsx, or
 * scripts/prerender.ts without JavaScript). The URL hash stays free for in-page
 * links.
 */
const BASE = import.meta.env.BASE_URL;

/** `lang` is null outside a language folder; `slug` is null on a landing page. */
export interface Route {
  lang: Lang | null;
  slug: string | null;
}

function decode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function routeFromPath(pathname: string): Route {
  if (!pathname.startsWith(BASE)) return { lang: null, slug: null };
  const path = pathname
    .slice(BASE.length)
    .replace(/(^|\/)index\.html$/, '')
    .replace(/\/+$/, '');
  const [first, ...rest] = path.split('/');
  const lang = isLang(first) ? first : null;
  const slug = lang ? rest.join('/') : path;
  return { lang, slug: slug ? decode(slug) : null };
}

/** A product page, or the landing page when `slug` is null or empty. */
export function pathFor(lang: Lang, slug: string | null): string {
  return slug
    ? `${BASE}${lang}/${encodeURIComponent(slug)}/`
    : `${BASE}${lang}/`;
}

/** A roadmap's published JSON, shared by both languages. */
export function dataPathFor(slug: string): string {
  return `${BASE}${encodeURIComponent(slug)}/roadmap.json`;
}

export function navigate(href: string, { scroll = true } = {}) {
  const { pathname, search, hash } = window.location;
  if (href !== `${pathname}${search}${hash}`) {
    window.history.pushState({}, '', href);
  }
  window.dispatchEvent(new PopStateEvent('popstate'));
  if (scroll) window.scrollTo(0, 0);
}

/** Click handler for links that should navigate without a full reload. */
export function onNavigate(href: string, options?: { scroll?: boolean }) {
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
    navigate(href, options);
  };
}

/** The current route. The prerender passes `server` because there is no URL. */
export function useRoute(server?: Route): Route {
  const [route, setRoute] = useState(
    () => server ?? routeFromPath(window.location.pathname),
  );
  useEffect(() => {
    const onPop = () => {
      const next = routeFromPath(window.location.pathname);
      setRoute((current) =>
        current.lang === next.lang && current.slug === next.slug
          ? current
          : next,
      );
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  return route;
}
