import { useState } from 'react';
import type { Roadmap } from '../lib/types';
import { useLanguage } from '../lib/i18n';
import { categoryTiles, filterGroups } from '../lib/roadmap-helpers';
import { UI } from '../lib/strings';
import { CategorySection } from '../components/CategorySection';
import { CategoryTiles } from '../components/CategoryTiles';
import { SearchBar } from '../components/SearchBar';
import { T } from '../components/T';

/**
 * Landing page: introduces the roadmaps, with jump links to each category and
 * a search that filters the cards. Without JavaScript every roadmap is listed.
 */
export function LandingPage({ roadmaps }: { roadmaps: Roadmap[] }) {
  const { lang } = useLanguage();
  const [query, setQuery] = useState('');
  const groups = filterGroups(roadmaps, query, lang);
  const shown = groups.reduce((sum, group) => sum + group.roadmaps.length, 0);

  return (
    <>
      <section
        aria-labelledby="landing-title"
        className="bg-surface-subtle px-4 pb-12 pt-28 sm:px-6 sm:pt-32"
      >
        <div className="mx-auto max-w-content">
          <span className="inline-flex items-center rounded-full bg-heading px-3 py-1 text-sm font-medium text-white">
            <T value={UI.phaseBadge} />
          </span>
          <h1
            id="landing-title"
            tabIndex={-1}
            className="mt-4 text-3xl font-bold text-heading sm:text-4xl"
          >
            <T value={UI.landingTitle} />
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-900">
            <T value={UI.landingIntro} />
          </p>
          <CategoryTiles tiles={categoryTiles(roadmaps, groups)} />
        </div>
      </section>

      <div className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-content">
          {roadmaps.length > 0 ? (
            <>
              <SearchBar
                query={query}
                onQueryChange={setQuery}
                shown={shown}
                total={roadmaps.length}
              />
              {groups.map((group) => (
                <CategorySection key={group.category.id} group={group} />
              ))}
              {shown === 0 ? (
                <p className="mt-8 rounded-card border border-border bg-surface-subtle p-5 font-medium text-ink-700">
                  <T value={UI.noMatches} />
                </p>
              ) : null}
            </>
          ) : (
            <p className="rounded-card border border-border bg-surface-subtle p-5 font-medium text-ink-700">
              <T value={UI.noRoadmaps} />
            </p>
          )}
        </div>
      </div>
    </>
  );
}
