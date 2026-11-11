import { useState } from 'react';
import { type Roadmap, NO_ORG_FILTER, type OrgFilter } from '../lib/types';
import { organisation } from '../lib/content';
import { openOrgFilter } from '../lib/focus';
import { fill, useLanguage } from '../lib/i18n';
import {
  categoryTiles,
  filterGroups,
  filterRoadmaps,
  organisationsWithWork,
  roadmapsStatus,
} from '../lib/roadmap-helpers';
import { setOrgFilter } from '../lib/router';
import { UI } from '../lib/strings';
import { CategorySection } from '../components/CategorySection';
import { CategoryTiles } from '../components/CategoryTiles';
import { FeedbackLink } from '../components/FeedbackLink';
import { OrgFilterDisclosure } from '../components/OrgFilterDisclosure';
import { SearchBar } from '../components/SearchBar';
import { T } from '../components/T';

/**
 * Landing page: a short introduction, jump links to each category, a search
 * and an organisation filter that narrow the cards, then more about the
 * roadmaps. Without JavaScript every roadmap is listed.
 */
export function LandingPage({
  roadmaps,
  filter,
}: {
  roadmaps: Roadmap[];
  filter: OrgFilter;
}) {
  const { lang } = useLanguage();
  const [query, setQuery] = useState('');
  const groups = filterGroups(roadmaps, query, lang, filter);
  const shown = groups.reduce((sum, group) => sum + group.roadmaps.length, 0);

  return (
    <>
      <section aria-labelledby="landing-title" className="page-intro">
        <div className="mx-auto max-w-content">
          <h1
            id="landing-title"
            tabIndex={-1}
            className="text-3xl font-bold text-heading sm:text-4xl"
          >
            <T value={UI.landingTitle} />
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-900">
            <T value={UI.landingIntro} />
          </p>
          <CategoryTiles tiles={categoryTiles(roadmaps, groups)} />
        </div>
      </section>

      <div className="page-body">
        <div className="mx-auto flex max-w-content flex-col gap-(--block-gap)">
          {roadmaps.length > 0 ? (
            <>
              <SearchBar
                query={query}
                onQueryChange={setQuery}
                status={(q) =>
                  roadmapsStatus(
                    filterRoadmaps(roadmaps, q, lang, filter).length,
                    roadmaps.length,
                    q,
                    filter,
                  )
                }
              >
                <OrgFilterDisclosure
                  filter={filter}
                  organisations={organisationsWithWork(roadmaps)}
                  defaultOpen={Boolean(filter.org)}
                  className="mt-4"
                />
              </SearchBar>
              {groups.map((group) => (
                <CategorySection
                  key={group.category.id}
                  group={group}
                  filter={filter}
                />
              ))}
              {shown === 0 ? <NoMatches query={query} filter={filter} /> : null}
            </>
          ) : (
            <p className="rounded-card border border-border bg-surface-subtle p-5 font-medium text-ink-700">
              <T value={UI.noRoadmaps} />
            </p>
          )}
          <section
            aria-labelledby="about-roadmaps-heading"
            className="max-w-3xl"
          >
            <h2
              id="about-roadmaps-heading"
              className="text-2xl font-bold text-heading"
            >
              <T value={UI.aboutRoadmapsHeading} />
            </h2>
            <div className="mt-4 space-y-4 leading-relaxed text-ink-900">
              <p>
                <T value={UI.aboutRoadmapsOpen} />
              </p>
              <p>
                <T value={UI.aboutRoadmapsBeta} />
              </p>
              <p>
                <T value={UI.aboutRoadmapsFeedback} />
              </p>
              <p>
                <FeedbackLink />
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

/** Says nothing matches, offering to clear the filter if there is one. */
function NoMatches({ query, filter }: { query: string; filter: OrgFilter }) {
  const box =
    'rounded-card border border-border bg-surface-subtle p-5 font-medium text-ink-700';
  if (!filter.org) {
    return (
      <p className={box}>
        <T value={UI.noMatches} />
      </p>
    );
  }
  const vars = { organisation: organisation(filter.org).short };
  return (
    <div className={box}>
      <p>
        <T value={fill(query.trim() ? UI.noMatchesFor : UI.noWorkFor, vars)} />
      </p>
      <button
        type="button"
        onClick={() => {
          setOrgFilter(NO_ORG_FILTER);
          // The button goes, so move focus to the filter.
          openOrgFilter();
        }}
        className="mt-3 text-action underline underline-offset-4 hover:decoration-2"
      >
        <T value={UI.showAllOrganisations} />
      </button>
    </div>
  );
}
