import { useEffect, useRef } from 'react';
import type { Roadmap } from './lib/types';
import snapshot from './data/roadmaps.json';
import { useLanguage } from './lib/i18n';
import { useProductRoute } from './lib/router';
import { UI } from './lib/strings';
import { T } from './components/T';
import { SiteHeader } from './components/SiteHeader';
import { AccessibilityStatement } from './components/AccessibilityStatement';
import { PrivacyNote } from './components/PrivacyNote';
import { SiteFooter } from './components/SiteFooter';
import { BackToTop } from './components/BackToTop';
import { NotFoundState } from './components/NotFoundState';
import { LandingPage } from './pages/LandingPage';
import { RoadmapPage } from './pages/RoadmapPage';

// Nightly snapshot of the Google Sheet, written and schema-checked by
// scripts/sync-roadmaps.ts.
const roadmaps = snapshot as Roadmap[];

/** Routes on `?product=` to the landing page or a product roadmap. */
export default function App() {
  const { tr } = useLanguage();
  const slug = useProductRoute();
  const roadmap = slug ? roadmaps.find((r) => r.slug === slug) : undefined;
  const mainRef = useRef<HTMLElement>(null);
  const previousSlugRef = useRef(slug);

  useEffect(() => {
    const site = tr(UI.siteTitle);
    document.title = roadmap ? `${tr(roadmap.meta.title)} – ${site}` : site;
  }, [roadmap, tr]);

  // After client-side navigation, move focus to the new page's heading so
  // screen readers announce it (runs after the title update above).
  useEffect(() => {
    if (previousSlugRef.current === slug) return;
    previousSlugRef.current = slug;
    mainRef.current?.querySelector('h1')?.focus();
  }, [slug]);

  let content;
  if (!slug) content = <LandingPage roadmaps={roadmaps} />;
  else if (!roadmap) content = <NotFoundState slug={slug} />;
  else content = <RoadmapPage roadmap={roadmap} />;

  return (
    <>
      <a href="#main-content" className="skip-link">
        <T value={UI.skipLink} />
      </a>

      <span id="top" />
      <SiteHeader showSectionLinks={Boolean(roadmap)} />

      <main id="main-content" ref={mainRef}>
        {content}
        <AccessibilityStatement />
        <PrivacyNote />
      </main>

      <SiteFooter />
      <BackToTop />
    </>
  );
}
