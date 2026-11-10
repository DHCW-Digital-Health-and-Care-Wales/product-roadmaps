import type { ReactNode } from 'react';
import type { RoadmapMeta, OrgFilter } from '../lib/types';
import { useLanguage } from '../lib/i18n';
import { ROADMAP_INTRO } from '../lib/content';
import { formatDate } from '../lib/roadmap-helpers';
import { onNavigate, pathFor, withOrgFilter } from '../lib/router';
import { UI } from '../lib/strings';
import { FamilyLabel } from './FamilyLabel';
import { T } from './T';

/**
 * Title section, rendered as the page's primary heading. A link back to all
 * roadmaps sits on the left of the top row and `controls` (the organisation
 * filter) on the right, in a column of its own from `xl`; the back link keeps
 * the organisation filter. Below
 * them come the title, with the family as a caption inside the h1, then one
 * line of status label, "last updated" date and product lead, each shown only
 * if set. The roadmap's "Our vision" follows, or the generic intro if it has
 * none, then `children`. The background is tinted with the roadmap's colour,
 * which is decorative and never used for text.
 */
export function RoadmapIntro({
  meta,
  filter,
  controls,
  children,
}: {
  meta: RoadmapMeta;
  filter: OrgFilter;
  controls?: ReactNode;
  children?: ReactNode;
}) {
  const { lang } = useLanguage();
  const back = withOrgFilter(pathFor(lang, null), filter);
  const hasMeta = Boolean(
    meta.statusLabel.en || meta.lastUpdated || meta.productLead,
  );

  return (
    <section
      id="about"
      aria-labelledby="roadmap-title"
      // Top padding clears the fixed SiteHeader (72px, 88px from sm); index.css
      // moves <main> down further while the mobile filter strip shows.
      className="scroll-mt-28 border-b-4 px-4 pb-8 pt-24 sm:px-6 sm:pb-10 sm:pt-30"
      style={{
        backgroundColor: `color-mix(in srgb, ${meta.colour} 7%, var(--color-surface-subtle))`,
        borderBottomColor: meta.colour,
      }}
    >
      {/* From xl the filter gets its own column, so opening it doesn't push the
          title down. The column has a fixed width so the text doesn't reflow,
          and the 1fr row takes any extra height when the panel is taller. */}
      <div className="mx-auto max-w-content xl:grid xl:grid-cols-[minmax(0,1fr)_22rem] xl:grid-rows-[auto_1fr] xl:gap-x-12">
        {/* Below xl the back link floats left, so the filter link sits beside
            it and its panel opens underneath at full width without moving
            the link. */}
        <div className="flow-root xl:contents">
          <a
            href={back}
            onClick={onNavigate(back)}
            className="float-left mr-8 text-sm font-medium text-action underline underline-offset-4 hover:no-underline xl:col-start-1 xl:row-start-1 xl:justify-self-start"
          >
            &larr; <T value={UI.allRoadmaps} />
          </a>
          {controls ? (
            <div className="min-w-0 xl:col-start-2 xl:row-span-2 xl:row-start-1">
              {controls}
            </div>
          ) : null}
        </div>

        <div className="xl:col-start-1 xl:row-start-2">
          <h1
            id="roadmap-title"
            tabIndex={-1}
            className="mt-6 text-3xl font-bold text-heading sm:text-4xl"
          >
            {meta.family.en ? (
              <>
                <FamilyLabel meta={meta} as="span" className="mb-1">
                  {/* Not sr-only: its absolute position adds a space before the colon in the name. */}
                  <span className="[clip-path:inset(50%)]">:</span>
                </FamilyLabel>{' '}
              </>
            ) : null}
            <T value={meta.title} />
          </h1>

          {hasMeta ? (
            // Stacked on small screens. From sm it's one line, where
            // overflow-hidden clips the separator if the product lead wraps to
            // the start of a line, so it only shows between items.
            <p className="mt-3 flex flex-col items-start gap-x-6 gap-y-2 overflow-hidden text-sm text-ink-700 sm:flex-row sm:flex-wrap sm:items-center">
              {meta.statusLabel.en ? (
                <span className="inline-flex items-center rounded-full bg-heading px-3 py-1 font-medium text-white">
                  <T value={meta.statusLabel} />
                </span>
              ) : null}
              {meta.lastUpdated ? (
                <span>
                  <T value={UI.lastUpdated} />:{' '}
                  <time dateTime={meta.lastUpdated}>
                    {formatDate(meta.lastUpdated, lang)}
                  </time>
                </span>
              ) : null}
              {meta.productLead ? (
                <span className="relative">
                  {meta.lastUpdated ? (
                    <span
                      aria-hidden="true"
                      className="absolute -left-3 hidden -translate-x-1/2 text-ink-500 sm:inline"
                    >
                      ·
                    </span>
                  ) : null}
                  <T value={UI.productLead} />: {meta.productLead}
                </span>
              ) : null}
            </p>
          ) : null}

          {meta.vision.en ? (
            <div id="vision" className="mt-8 max-w-3xl">
              <h2 className="text-2xl font-bold text-heading">
                <T value={UI.vision} />
              </h2>
              <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-ink-900">
                <T value={meta.vision} />
              </p>
            </div>
          ) : (
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-ink-900">
              <T value={ROADMAP_INTRO} />
            </p>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}
