import { StrictMode } from 'react';
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
import { pathFor, routeFromPath } from './lib/router';

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
// Reuse that HTML only when the first render will match it exactly.
const route = routeFromPath(window.location.pathname);
const { lang, slug } = rootElement.dataset;
if (route.lang === null && route.slug === null) {
  const { search, hash } = window.location;
  window.location.replace(`${pathFor(preferredLang(), null)}${search}${hash}`);
} else if (lang === route.lang && slug === (route.slug ?? '')) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
