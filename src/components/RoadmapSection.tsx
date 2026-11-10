import type { OrgFilter } from '../lib/types';
import type { SECTIONS } from '../lib/content';
import {
  countText,
  placementHeadingId,
  type ShownItem,
} from '../lib/roadmap-helpers';
import { EmptyItems } from './EmptyItems';
import { RoadmapCard } from './RoadmapCard';
import { T } from './T';

/**
 * One of the fixed sections around the horizons: "Recently delivered", "Other
 * work we have delivered this year" or "Not doing right now".
 */
export function RoadmapSection({
  section,
  items,
  total,
  filter,
}: {
  section: (typeof SECTIONS)[number];
  /** The items that match the organisation filter. */
  items: ShownItem[];
  /** The number of items before filtering. */
  total: number;
  filter: OrgFilter;
}) {
  const headingId = placementHeadingId(section.id);

  return (
    <section aria-labelledby={headingId} className="page-section bg-surface">
      <div className="mx-auto max-w-content">
        <div className="flex items-center gap-2">
          <h2 id={headingId} className="text-2xl font-bold text-heading">
            <T value={section.heading} />
          </h2>
          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-border bg-surface-subtle px-2 text-xs font-semibold text-ink-700">
            <T value={countText({ shown: items.length, total })} />
          </span>
        </div>

        <p className="mt-4 max-w-3xl leading-relaxed text-ink-900">
          <T value={section.description} />
        </p>

        {items.length > 0 ? (
          <div className="card-grid mt-6">
            {items.map(({ item, index }) => (
              // The place in the unfiltered list, so a card keeps its element
              // as the filter changes.
              <RoadmapCard key={index} item={item} headingLevel={3} />
            ))}
          </div>
        ) : (
          <EmptyItems
            filter={filter}
            total={total}
            headingId={headingId}
            className="mt-6 rounded-card border border-border bg-surface-subtle p-5 font-medium text-ink-700"
          />
        )}
      </div>
    </section>
  );
}
