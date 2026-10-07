import { useCallback, useEffect, useState } from 'react';
import type { Roadmap } from './lib/types';
import { loadRoadmaps } from './lib/sheet';
import { useLanguage } from './lib/i18n';
import { useProductRoute } from './lib/router';
import { RoadmapHeader } from './components/RoadmapHeader';
import { AccessibilityStatement } from './components/AccessibilityStatement';
import { PrivacyNote } from './components/PrivacyNote';
import { RoadmapFooter } from './components/RoadmapFooter';
import { BackToTop } from './components/BackToTop';
import {
  ErrorState,
  LoadingState,
  NotFoundState,
} from './components/LoadStates';
import { LandingPage } from './pages/LandingPage';
import { RoadmapPage } from './pages/RoadmapPage';

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; roadmaps: Roadmap[] };

/** Loads all roadmaps from the Google Sheet, then routes on `?product=`. */
export default function App() {
  const { lang, tr } = useLanguage();
  const cy = lang === 'cy';
  const slug = useProductRoute();
  const [state, setState] = useState<State>({ status: 'loading' });

  const load = useCallback((force: boolean) => {
    loadRoadmaps(force)
      .then((roadmaps) => setState({ status: 'ready', roadmaps }))
      .catch((error: unknown) => {
        console.error(error);
        setState({ status: 'error' });
      });
  }, []);

  useEffect(() => load(false), [load]);

  const retry = () => {
    setState({ status: 'loading' });
    load(true);
  };

  const roadmap =
    state.status === 'ready' && slug
      ? state.roadmaps.find((r) => r.slug === slug)
      : undefined;

  useEffect(() => {
    const site = cy ? 'Trywyddion IGDC' : 'DHCW roadmaps';
    document.title = roadmap ? `${tr(roadmap.meta.title)} – ${site}` : site;
  }, [roadmap, cy, tr]);

  let content;
  if (state.status === 'loading') content = <LoadingState />;
  else if (state.status === 'error') content = <ErrorState onRetry={retry} />;
  else if (!slug) content = <LandingPage roadmaps={state.roadmaps} />;
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
      <RoadmapHeader showSectionLinks={Boolean(roadmap)} />

      <main id="main-content">
        {content}
        <AccessibilityStatement />
        <PrivacyNote />
      </main>

      <RoadmapFooter />
      <BackToTop />
    </>
  );
}
