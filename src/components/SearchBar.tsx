import { useEffect, useId, useState } from 'react';
import { fill, useLanguage } from '../lib/i18n';
import { roadmapCount } from '../lib/roadmap-helpers';
import { UI } from '../lib/strings';
import { T } from './T';

/** How long typing must pause before the result count is announced. */
export const ANNOUNCE_DELAY_MS = 500;

/**
 * The search field and a live count of matching roadmaps. The count is only
 * announced once typing pauses.
 */
export function SearchBar({
  query,
  onQueryChange,
  shown,
  total,
}: {
  query: string;
  onQueryChange: (query: string) => void;
  shown: number;
  total: number;
}) {
  const { tr } = useLanguage();
  const id = useId();
  // The count of matches announced, or null for the total; each keystroke
  // restarts the wait, even if the count is unchanged.
  const [announced, setAnnounced] = useState<number | null>(null);
  useEffect(() => {
    const timer = setTimeout(
      () => setAnnounced(query.trim() ? shown : null),
      ANNOUNCE_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [query, shown]);

  return (
    <div
      role="search"
      aria-label={tr(UI.searchRoadmaps)}
      className="flex flex-wrap items-end gap-x-6 gap-y-3 border-b border-border pb-6"
    >
      <div>
        <label htmlFor={id} className="block font-medium text-heading">
          <T value={UI.findProduct} />
        </label>
        <input
          id={id}
          type="search"
          autoComplete="off"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          className="mt-1 w-full max-w-sm rounded-sm border-2 border-ink-700 bg-surface px-3 py-2 text-base sm:w-96"
        />
      </div>
      <p role="status" className="text-sm text-ink-700 sm:ml-auto">
        <T
          value={
            announced === null
              ? roadmapCount(total)
              : fill(UI.showingRoadmaps, {
                  shown: String(announced),
                  total: String(total),
                })
          }
        />
      </p>
    </div>
  );
}
