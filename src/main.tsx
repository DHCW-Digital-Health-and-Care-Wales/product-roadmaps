import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot, hydrateRoot } from 'react-dom/client';
// Self-hosted Roboto (DHCW digital interface font). Bundled into the build so
// no third-party font service is called.
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './index.css';
import App from './App.tsx';
import { LanguageProvider } from './components/LanguageProvider';
import { preferredLang } from './lib/i18n';
import {
  orgFilterFromSearch,
  pathFor,
  routeFromPath,
  viewFromSearch,
} from './lib/router';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root was not found in the document.');
}

const app = (
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>
);

// The build prerenders each page in each language (scripts/prerender.ts).
// Reuse that HTML only when the first render will match it exactly; roadmap
// pages are always prerendered as cards, and every page without a filter.
const route = routeFromPath(window.location.pathname);
const { lang, slug } = rootElement.dataset;
const { search, hash } = window.location;
if (route.lang === null && route.slug === null) {
  window.location.replace(`${pathFor(preferredLang(), null)}${search}${hash}`);
} else if (
  lang === route.lang &&
  slug === (route.slug ?? '') &&
  (route.slug === null || viewFromSearch(search) === 'cards') &&
  orgFilterFromSearch(search).org === null
) {
  hydrateRoot(rootElement, app);
} else {
  // The browser's own fragment scroll can run before this render adds the target.
  // eslint-disable-next-line @eslint-react/dom-no-flush-sync -- the target must exist before scrolling
  flushSync(() => createRoot(rootElement).render(app));
  if (hash.length > 1) {
    // Instant, like the browser's own jump; the page's smooth scrolling would animate from the top.
    document
      .getElementById(hash.slice(1))
      ?.scrollIntoView({ behavior: 'instant' });
  }
}
