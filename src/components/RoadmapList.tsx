import { useState } from 'react';
import type { Roadmap } from '../lib/types';
import { useLanguage } from '../lib/i18n';
import {
  isExpandable,
  placementHeadingId,
  roadmapGroups,
} from '../lib/roadmap-helpers';
import { UI } from '../lib/strings';
import { RoadmapListItem } from './RoadmapListItem';
import { T } from './T';

const linkButton =
  'text-action underline underline-offset-4 hover:decoration-2';

/**
 * The roadmap as a compact, text-first list: counts at a glance, then each
 * section and horizon as rows that open to show the outcome and details.
 * Shown instead of the cards with `?view=list`.
 */
export function RoadmapList({ roadmap }: { roadmap: Roadmap }) {
  const { tr } = useLanguage();
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set());

  const groups = roadmapGroups(roadmap);
  const expandable = groups.flatMap((g) =>
    g.items.flatMap((item, i) => (isExpandable(item) ? [`${g.id}-${i}`] : [])),
  );

  const toggle = (key: string) => {
    setOpen((current) => {
      const next = new Set(current);
      if (!next.delete(key)) next.add(key);
      return next;
    });
  };

  return (
    <div id="roadmap" className="scroll-mt-28 bg-surface px-4 py-8 sm:px-6">
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
                className="border-b-2 border-heading pb-2 text-2xl font-bold text-heading"
              >
                <T value={g.heading} />
              </h2>
              {g.items.length > 0 ? (
                <ul>
                  {g.items.map((item, i) => {
                    const key = `${g.id}-${i}`;
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
                <p className="py-4 text-ink-700">
                  <T value={UI.nothingYet} />
                </p>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
