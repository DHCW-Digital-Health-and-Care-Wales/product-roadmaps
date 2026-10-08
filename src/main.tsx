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
import { readInitialLang } from './lib/i18n';
import { slugFromPath } from './lib/router';

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

// The build prerenders each page in the default language (scripts/prerender.ts).
// Reuse that HTML only when the first render will match it exactly.
const prerendered = rootElement.dataset.slug;
if (
  prerendered !== undefined &&
  prerendered === (slugFromPath(window.location.pathname) ?? '') &&
  !readInitialLang().explicit
) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
