import { useState } from 'react';
import type { Roadmap, OrgFilter } from '../lib/types';
import { fill, useLanguage } from '../lib/i18n';
import {
  countOf,
  isExpandable,
  placementHeadingId,
  roadmapGroups,
} from '../lib/roadmap-helpers';
import { UI } from '../lib/strings';
import { EmptyItems } from './EmptyItems';
import { RoadmapListItem } from './RoadmapListItem';
import { T } from './T';

const linkButton =
  'text-action underline underline-offset-4 hover:decoration-2';

/**
 * The roadmap as a compact, text-first list: counts at a glance, then each
 * section and horizon as rows that open to show the outcome and details.
 * Shown instead of the cards with `?view=list`.
 */
export function RoadmapList({
  roadmap,
  filter,
}: {
  roadmap: Roadmap;
  filter: OrgFilter;
}) {
  const { tr } = useLanguage();
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set());

  const groups = roadmapGroups(roadmap, filter);
  // Keyed by the place in the unfiltered list, so rows stay open while filtering.
  const keyOf = (id: string, index: number) => `${id}-${index}`;
  const expandable = groups.flatMap((g) =>
    g.items.flatMap(({ item, index }) =>
      isExpandable(item) ? [keyOf(g.id, index)] : [],
    ),
  );

  const toggle = (key: string) => {
    setOpen((current) => {
      const next = new Set(current);
      if (!next.delete(key)) next.add(key);
      return next;
    });
  };

  return (
    <div
      id="roadmap"
      className="scroll-mt-28 border-b border-border bg-surface px-4 py-8 sm:px-6 sm:py-10"
    >
      <div className="mx-auto max-w-content">
        <div className="max-w-3xl">
          <nav aria-label={tr(UI.atAGlance)}>
            <ul className="grid grid-cols-2 gap-2 sm:auto-cols-fr sm:grid-flow-col sm:grid-cols-none">
              {groups
                .filter((g) => g.glance)
                .map((g) => (
                  <li key={g.id}>
                    <a
                      href={`#${placementHeadingId(g.id)}`}
                      className="block h-full rounded-card border border-border px-4 py-3 text-ink-900 hover:border-action"
                    >
                      <span className="block text-3xl leading-tight font-bold text-heading">
                        {g.items.length}
                        {g.items.length < g.total ? (
                          <span className="text-base font-normal text-ink-700">
                            {' '}
                            <T
                              value={fill(UI.ofTotal, {
                                total: String(g.total),
                              })}
                            />
                          </span>
                        ) : null}
                      </span>
                      <span className="text-sm text-ink-700">
                        <T value={g.heading} />
                      </span>
                    </a>
                  </li>
                ))}
            </ul>
          </nav>

          {expandable.length > 0 ? (
            <div className="mt-6 flex gap-4 text-sm">
              <button
                type="button"
                className={linkButton}
                onClick={() => setOpen(new Set(expandable))}
              >
                <T value={UI.openAll} />
              </button>
              <button
                type="button"
                className={linkButton}
                onClick={() => setOpen(new Set())}
              >
                <T value={UI.closeAll} />
              </button>
            </div>
          ) : null}

          {groups.map((g) => (
            <section
              key={g.id}
              aria-labelledby={placementHeadingId(g.id)}
              className="mt-10 scroll-mt-28"
            >
              <h2
                id={placementHeadingId(g.id)}
                className="flex flex-wrap items-center gap-x-3 border-b-2 border-heading pb-2 text-2xl font-bold text-heading"
              >
                <T value={g.heading} />
                {filter.org ? (
                  <span className="inline-flex h-6 items-center rounded-full border border-border bg-surface-subtle px-2 text-xs font-semibold text-ink-700">
                    <T
                      value={countOf({ shown: g.items.length, total: g.total })}
                    />
                  </span>
                ) : null}
              </h2>
              {g.items.length > 0 ? (
                <ul>
                  {g.items.map(({ item, index }) => {
                    const key = keyOf(g.id, index);
                    return (
                      <RoadmapListItem
                        key={key}
                        item={item}
                        open={open.has(key)}
                        onToggle={() => toggle(key)}
                      />
                    );
                  })}
                </ul>
              ) : (
                <EmptyItems
                  filter={filter}
                  total={g.total}
                  headingId={placementHeadingId(g.id)}
                  className="py-4 text-ink-700"
                />
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
