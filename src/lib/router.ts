import { useEffect, useState, type MouseEvent } from 'react';

/**
 * Query-string routing (`?product=<slug>`). Keeps a single index.html on
 * GitHub Pages and leaves the URL hash free for in-page section links.
 */
export const PRODUCT_PARAM = 'product';

function readProduct(): string | null {
  return new URLSearchParams(window.location.search).get(PRODUCT_PARAM);
}

export function productHref(slug: string | null): string {
  const url = new URL(window.location.href);
  url.hash = '';
  if (slug) url.searchParams.set(PRODUCT_PARAM, slug);
  else url.searchParams.delete(PRODUCT_PARAM);
  return `${url.pathname}${url.search}`;
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

export function useProductRoute(): string | null {
  const [product, setProduct] = useState(readProduct);
  useEffect(() => {
    const onPop = () => setProduct(readProduct());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  return product;
}
