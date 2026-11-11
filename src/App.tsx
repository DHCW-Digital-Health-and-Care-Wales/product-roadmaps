import { useEffect, useRef } from 'react';
import { roadmaps } from './lib/roadmaps';
import { useLanguage } from './lib/i18n';
import { INFO_PAGES } from './lib/info-pages';
import { organisationsWithWork, titleWithFamily } from './lib/roadmap-helpers';
import { NO_ORG_FILTER } from './lib/types';
import { useOrgFilter, useView, isInfoPage } from './lib/router';
import { UI } from './lib/strings';
import { T } from './components/T';
import { SiteHeader } from './components/SiteHeader';
import { SiteFooter } from './components/SiteFooter';
import { BackToTop } from './components/BackToTop';
import { PhaseBanner } from './components/PhaseBanner';
import { NotFoundState } from './components/NotFoundState';
import { InfoPage } from './pages/InfoPage';
import { LandingPage } from './pages/LandingPage';
import { RoadmapPage } from './pages/RoadmapPage';

/**
 * Routes on the URL path (via LanguageProvider) to a landing page or a product
 * roadmap. The prerender uses an empty slug for the generic not-found page in
 * 404.html.
 */
export default function App() {
  const { route, tr } = useLanguage();
  const view = useView();
  const filter = useOrgFilter();
  const { slug } = route;
  const infoPage = isInfoPage(slug) ? slug : null;
  const roadmap =
    slug && !infoPage ? roadmaps.find((r) => r.slug === slug) : undefined;
  const mainRef = useRef<HTMLElement>(null);
  const previousSlugRef = useRef(slug);

  useEffect(() => {
    const site = tr(UI.siteTitle);
    let page: string | undefined;
    if (roadmap) page = tr(titleWithFamily(roadmap.meta));
    else if (infoPage) page = tr(INFO_PAGES[infoPage].heading);
    else if (slug !== null) page = tr(UI.notFoundHeading);
    document.title = page ? `${page} – ${site}` : site;
  }, [roadmap, infoPage, slug, tr]);

  // After client-side navigation, move focus to the new page's heading so
  // screen readers announce it (runs after the title update above).
  useEffect(() => {
    if (previousSlugRef.current === slug) return;
    previousSlugRef.current = slug;
    mainRef.current?.querySelector('h1')?.focus();
  }, [slug]);

  // Only pages with the filter's controls show it in the header.
  const hasOrgFilter = slug === null ? roadmaps.length > 0 : Boolean(roadmap);

  let content;
  if (slug === null) {
    content = <LandingPage roadmaps={roadmaps} filter={filter} />;
  } else if (infoPage) {
    content = <InfoPage page={infoPage} />;
  } else if (!roadmap) {
    content = <NotFoundState slug={slug} />;
  } else {
    content = (
      <RoadmapPage
        roadmap={roadmap}
        view={view}
        filter={filter}
        organisations={organisationsWithWork(roadmaps)}
      />
    );
  }

  return (
    <>
      <a href="#main-content" className="skip-link">
        <T value={UI.skipLink} />
      </a>

      <span id="top" tabIndex={-1} />
      <SiteHeader
        filter={hasOrgFilter ? filter : NO_ORG_FILTER}
        showSectionLinks={Boolean(roadmap)}
      />

      <main id="main-content" ref={mainRef}>
        <PhaseBanner bilingual={slug === ''} />
        {content}
      </main>

      <SiteFooter dataSlug={roadmap?.slug} view={view} filter={filter} />
      <BackToTop />
    </>
  );
}
