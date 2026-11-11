import type { Localised, OrgFilter } from '../lib/types';
import { countInParentheses, type ShownItem } from '../lib/roadmap-helpers';
import { EmptyItems } from './EmptyItems';
import { RoadmapCard } from './RoadmapCard';
import { T } from './T';

interface HorizonPhaseProps {
  label: Localised;
  /** The items that match the organisation filter. */
  items: ShownItem[];
  /** The number of items before filtering. */
  total: number;
  filter: OrgFilter;
  headingId: string;
}

/**
 * One horizon (Now, Next or Later) rendered as a full-width phase in the
 * sequential roadmap journey. A dark heading bar names the phase in text with
 * an item count, then the items follow in a responsive grid that keeps cards a
 * comfortable reading width while the phases themselves always stack
 * top-to-bottom. The horizon is always labelled in text, never by colour or
 * position alone.
 */
export function HorizonPhase({
  label,
  items,
  total,
  filter,
  headingId,
}: HorizonPhaseProps) {
  return (
    <section
      aria-labelledby={headingId}
      className="scroll-mt-28 short:scroll-mt-0 overflow-hidden rounded-card border border-border bg-surface"
    >
      <h3
        id={headingId}
        className="bg-heading px-4 py-3 text-lg font-bold text-white"
      >
        <span>
          <T value={label} />
        </span>{' '}
        <span className="text-base font-normal text-white/80">
          <T value={countInParentheses({ shown: items.length, total })} />
        </span>
      </h3>
      <div className="p-3 sm:p-4">
        {items.length > 0 ? (
          <div className="card-grid">
            {items.map(({ item, index }) => (
              // The place in the unfiltered list, so a card keeps its element
              // as the filter changes.
              <RoadmapCard key={index} item={item} />
            ))}
          </div>
        ) : (
          <EmptyItems
            filter={filter}
            total={total}
            headingId={headingId}
            className="text-sm italic text-ink-500"
          />
        )}
      </div>
    </section>
  );
}
