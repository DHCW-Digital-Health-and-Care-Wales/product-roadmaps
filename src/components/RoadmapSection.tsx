import type { RoadmapItem } from '../lib/types';
import type { SECTIONS } from '../lib/content';
import { UI } from '../lib/strings';
import { RoadmapCard } from './RoadmapCard';
import { T } from './T';

/**
 * One of the fixed sections around the horizons: "Recently delivered", "Other
 * work we have delivered this year" or "Not doing right now".
 */
export function RoadmapSection({
  section,
  items,
}: {
  section: (typeof SECTIONS)[number];
  items: RoadmapItem[];
}) {
  const headingId = `section-${section.id}`;

  return (
    <section
      aria-labelledby={headingId}
      className="border-b border-border bg-surface px-4 py-12 sm:px-6"
    >
      <div className="mx-auto max-w-content">
        <div className="flex items-center gap-2">
          <h2 id={headingId} className="text-2xl font-bold text-heading">
            <T value={section.heading} />
          </h2>
          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-border bg-surface-subtle px-2 text-xs font-semibold text-ink-700">
            {items.length}
          </span>
        </div>

        <p className="mt-4 max-w-3xl leading-relaxed text-ink-900">
          <T value={section.description} />
        </p>

        {items.length > 0 ? (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {items.map((item, index) => (
              // Static list from the snapshot; never reordered or filtered.
              // eslint-disable-next-line @eslint-react/no-array-index-key
              <RoadmapCard key={index} item={item} headingLevel={3} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-card border border-border bg-surface-subtle p-5">
            <p className="font-medium text-ink-700">
              <T value={UI.nothingYet} />
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
