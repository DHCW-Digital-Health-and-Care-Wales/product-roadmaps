import { focusCard, keepInPlace } from '../lib/focus';
import {
  emptyText,
  hiddenCount,
  showHiddenItems,
} from '../lib/roadmap-helpers';
import { setOrgFilter } from '../lib/router';
import { NO_ORG_FILTER, type OrgFilter } from '../lib/types';
import { T } from './T';

/**
 * What a section or horizon with no items to show says. When the filter hides
 * its items, a button shows them all again, keeping the section where it is on
 * screen and moving focus to its first item, which takes the button's place.
 */
export function EmptyItems({
  filter,
  total,
  headingId,
  className = '',
}: {
  filter: OrgFilter;
  /** The number of items before filtering. */
  total: number;
  /** The heading that labels the section (`aria-labelledby`). */
  headingId: string;
  className?: string;
}) {
  const hidden = hiddenCount(filter, total);

  return (
    <div className={`text-ink-700 ${className}`.trim()}>
      <p>
        <T value={emptyText(filter, total)} />
      </p>
      {hidden > 0 ? (
        <button
          type="button"
          onClick={() => {
            const section =
              document.querySelector(`[aria-labelledby="${headingId}"]`) ??
              undefined;
            keepInPlace(section, () => setOrgFilter(NO_ORG_FILTER));
            focusCard(
              section?.querySelector('[data-filter-card]') ?? undefined,
            );
          }}
          className="mt-2 text-sm font-medium text-action underline underline-offset-4 hover:decoration-2"
        >
          <T value={showHiddenItems(hidden)} />
        </button>
      ) : null}
    </div>
  );
}
