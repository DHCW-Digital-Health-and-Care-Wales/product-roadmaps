import {
  useEffect,
  useState,
  useSyncExternalStore,
  type MouseEvent,
} from 'react';
import { isLang, type Lang } from './i18n';
import { isOrganisationId, NO_ORG_FILTER, type OrgFilter } from './types';

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

/** How a roadmap is laid out: cards by default, or a list with `?view=list`. */
export type View = 'cards' | 'list';

/** Only exactly `view=list` opts in, so anything else matches the prerender. */
export function viewFromSearch(search: string): View {
  return new URLSearchParams(search).get('view') === 'list' ? 'list' : 'cards';
}

/** The current view. Always cards in the prerender, which has no URL. */
export function useView(): View {
  const [view, setView] = useState<View>(() =>
    typeof window === 'undefined'
      ? 'cards'
      : viewFromSearch(window.location.search),
  );
  useEffect(() => {
    const onPop = () => setView(viewFromSearch(window.location.search));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  return view;
}

/**
 * The filter in a query string: `org=<id>`, plus `all=no` to leave out
 * all-Wales work. An unknown `org` is ignored, and `all=no` means nothing when
 * the organisation is all of Wales itself.
 */
export function orgFilterFromSearch(search: string): OrgFilter {
  const params = new URLSearchParams(search);
  const org = params.get('org');
  if (!isOrganisationId(org)) return NO_ORG_FILTER;
  return {
    org,
    includeNational: org === 'national' || params.get('all') !== 'no',
  };
}

/** `href` with the filter's params in place of any it had, keeping the rest. */
export function withOrgFilter(href: string, filter: OrgFilter): string {
  const [beforeHash, hash] = splitAt(href, '#');
  const [path, query] = splitAt(beforeHash, '?');
  const params = new URLSearchParams(query);
  params.delete('org');
  params.delete('all');
  if (filter.org) {
    params.set('org', filter.org);
    if (filter.org !== 'national' && !filter.includeNational) {
      params.set('all', 'no');
    }
  }
  const search = params.toString();
  return `${path}${search ? `?${search}` : ''}${hash ? `#${hash}` : ''}`;
}

function splitAt(value: string, separator: string): [string, string] {
  const at = value.indexOf(separator);
  return at === -1 ? [value, ''] : [value.slice(0, at), value.slice(at + 1)];
}

const sameOrgFilter = (a: OrgFilter, b: OrgFilter) =>
  a.org === b.org && a.includeNational === b.includeNational;

const subscribePopState = (onChange: () => void) => {
  window.addEventListener('popstate', onChange);
  return () => window.removeEventListener('popstate', onChange);
};

// useSyncExternalStore needs the same object until the filter changes.
let lastSearch: string | null = null;
let lastFilter = NO_ORG_FILTER;
function currentOrgFilter(): OrgFilter {
  const { search } = window.location;
  if (search !== lastSearch) {
    lastSearch = search;
    const next = orgFilterFromSearch(search);
    if (!sameOrgFilter(next, lastFilter)) lastFilter = next;
  }
  return lastFilter;
}

/**
 * The organisation filter in the URL. None in the prerender and while
 * hydrating; src/main.tsx renders afresh rather than hydrate a filtered URL.
 */
export function useOrgFilter(): OrgFilter {
  return useSyncExternalStore(
    subscribePopState,
    currentOrgFilter,
    () => NO_ORG_FILTER,
  );
}

/**
 * Sets the filter in the URL. It replaces the history entry, so Back leaves
 * the page as it was rather than stepping through each change.
 */
export function setOrgFilter(filter: OrgFilter) {
  const { pathname, search, hash } = window.location;
  window.history.replaceState(
    window.history.state,
    '',
    withOrgFilter(`${pathname}${search}${hash}`, filter),
  );
  window.dispatchEvent(new PopStateEvent('popstate'));
}

const subscribeNever = () => () => undefined;

/**
 * False in the prerender and while hydrating, so links that need JavaScript
 * are left out of the static HTML.
 */
export function useHasJs(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
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
