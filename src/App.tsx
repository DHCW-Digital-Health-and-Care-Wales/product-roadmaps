import { useEffect } from 'react';
import type { Roadmap } from './lib/types';
import snapshot from './data/roadmaps.json';
import { useLanguage } from './lib/i18n';
import { useProductRoute } from './lib/router';
import { SiteHeader } from './components/SiteHeader';
import { AccessibilityStatement } from './components/AccessibilityStatement';
import { PrivacyNote } from './components/PrivacyNote';
import { SiteFooter } from './components/SiteFooter';
import { BackToTop } from './components/BackToTop';
import { NotFoundState } from './components/NotFoundState';
import { LandingPage } from './pages/LandingPage';
import { RoadmapPage } from './pages/RoadmapPage';

// Nightly snapshot of the Google Sheet, written by scripts/sync-roadmaps.ts.
const roadmaps = snapshot as Roadmap[];

/** Routes on `?product=` to the landing page or a product roadmap. */
export default function App() {
  const { lang, tr } = useLanguage();
  const cy = lang === 'cy';
  const slug = useProductRoute();
  const roadmap = slug ? roadmaps.find((r) => r.slug === slug) : undefined;

  useEffect(() => {
    const site = cy ? 'Trywyddion IGDC' : 'DHCW roadmaps';
    document.title = roadmap ? `${tr(roadmap.meta.title)} – ${site}` : site;
  }, [roadmap, cy, tr]);

  let content;
  if (!slug) content = <LandingPage roadmaps={roadmaps} />;
  else if (!roadmap) content = <NotFoundState slug={slug} />;
  else content = <RoadmapPage roadmap={roadmap} />;

  return (
    <>
      <a href="#main-content" className="skip-link">
        {cy ? (
          <span lang="cy">Neidio i&rsquo;r prif gynnwys</span>
        ) : (
          'Skip to content'
        )}
      </a>

      <span id="top" />
      <SiteHeader showSectionLinks={Boolean(roadmap)} />

      <main id="main-content">
        {content}
        <AccessibilityStatement />
        <PrivacyNote />
      </main>

      <SiteFooter />
      <BackToTop />
    </>
  );
}
