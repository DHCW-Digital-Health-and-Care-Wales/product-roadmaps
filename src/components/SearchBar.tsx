import { useEffect, useId, useState, type ReactNode } from 'react';
import { useLanguage } from '../lib/i18n';
import { UI } from '../lib/strings';
import type { Localised } from '../lib/types';
import { T } from './T';

/** How long typing must pause before the result count is announced. */
export const ANNOUNCE_DELAY_MS = 500;

/**
 * The search field, any `children` (the organisation filter), then a live
 * count of matching roadmaps from `status`. A change of query is only
 * announced once typing pauses; other changes are announced straight away.
 */
export function SearchBar({
  query,
  onQueryChange,
  status,
  children,
}: {
  query: string;
  onQueryChange: (query: string) => void;
  /** The result count for a query. */
  status: (query: string) => Localised;
  children?: ReactNode;
}) {
  const { tr } = useLanguage();
  const id = useId();
  // The query the count is for; each keystroke restarts the wait.
  const [announcedQuery, setAnnouncedQuery] = useState(query);
  useEffect(() => {
    const timer = setTimeout(() => setAnnouncedQuery(query), ANNOUNCE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div
      role="search"
      aria-label={tr(UI.searchRoadmaps)}
      className="border-b border-border pb-6"
    >
      <label htmlFor={id} className="block font-medium text-heading">
        <T value={UI.findProduct} />
      </label>
      <p id={`${id}-hint`} className="mt-0.5 text-sm text-ink-700">
        <T value={UI.findProductHint} />
      </p>
      <input
        id={id}
        aria-describedby={`${id}-hint`}
        type="search"
        autoComplete="off"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        className="mt-1 w-full max-w-sm rounded-sm border-2 border-ink-700 bg-surface px-3 py-2 text-base sm:w-96"
      />
      {children}
      <p role="status" className="mt-4 text-sm text-ink-700">
        <T value={status(announcedQuery)} />
      </p>
    </div>
  );
}
