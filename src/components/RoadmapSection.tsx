import type { OrgFilter } from '../lib/types';
import type { SECTIONS } from '../lib/content';
import {
  countInParentheses,
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
        <h2 id={headingId} className="text-2xl font-bold text-heading">
          <T value={section.heading} />{' '}
          <span className="text-lg font-normal text-ink-700">
            <T value={countInParentheses({ shown: items.length, total })} />
          </span>
        </h2>

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
            className="mt-6 text-ink-700"
          />
        )}
      </div>
    </section>
  );
}
