import { useEffect, useRef } from 'react';
import { roadmaps } from './lib/roadmaps';
import { useLanguage } from './lib/i18n';
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

/**
 * Routes on the URL path (via LanguageProvider) to a landing page or a product
 * roadmap. The prerender uses an empty slug for the generic not-found page in
 * 404.html.
 */
export default function App() {
  const { route, tr } = useLanguage();
  const { slug } = route;
  const roadmap = slug ? roadmaps.find((r) => r.slug === slug) : undefined;
  const mainRef = useRef<HTMLElement>(null);
  const previousSlugRef = useRef(slug);

  useEffect(() => {
    const site = tr(UI.siteTitle);
    let page: string | undefined;
    if (roadmap) page = tr(roadmap.meta.title);
    else if (slug !== null) page = tr(UI.notFoundHeading);
    document.title = page ? `${page} – ${site}` : site;
  }, [roadmap, slug, tr]);

  // After client-side navigation, move focus to the new page's heading so
  // screen readers announce it (runs after the title update above).
  useEffect(() => {
    if (previousSlugRef.current === slug) return;
    previousSlugRef.current = slug;
    mainRef.current?.querySelector('h1')?.focus();
  }, [slug]);

  let content;
  if (slug === null) content = <LandingPage roadmaps={roadmaps} />;
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

      <SiteFooter dataSlug={roadmap?.slug} />
      <BackToTop />
    </>
  );
}
