import { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import type { RoadmapItem } from '../lib/types';
import { DETAILS_HEADING } from '../lib/content';
import { isExpandable } from '../lib/roadmap-helpers';
import { UI } from '../lib/strings';
import { DetailList } from './DetailList';
import { T } from './T';

/**
 * One row in the list view. The title opens the outcome and details when the
 * item has either; otherwise it is a plain heading.
 */
export function RoadmapListItem({
  item,
  open,
  onToggle,
}: {
  item: RoadmapItem;
  open: boolean;
  onToggle: () => void;
}) {
  const panelId = useId();
  const expandable = isExpandable(item);
  const title = (
    <span className="text-lg font-bold">
      <T value={item.title} />
    </span>
  );

  return (
    <li className="border-b border-border py-4">
      <h3 className="text-heading">
        {expandable ? (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={onToggle}
            className="group flex w-full items-start justify-between gap-4 text-left text-action"
          >
            <span className="underline-offset-4 group-hover:underline">
              {title}
            </span>
            <ChevronDown
              aria-hidden="true"
              className={`mt-1 h-5 w-5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
              strokeWidth={2.5}
            />
          </button>
        ) : (
          title
        )}
      </h3>

      {item.description.en ? (
        <p className="mt-1 whitespace-pre-line leading-relaxed text-ink-700">
          <T value={item.description} />
        </p>
      ) : null}

      {expandable ? (
        <div
          id={panelId}
          hidden={!open}
          className="mt-3 space-y-3 leading-relaxed text-ink-900"
        >
          {item.outcome ? (
            <p className="whitespace-pre-line">
              <strong className="font-bold">
                <T value={UI.outcome} />
              </strong>{' '}
              <T value={item.outcome} />
            </p>
          ) : null}
          {item.details ? (
            <div>
              <p className="font-bold">
                <T value={DETAILS_HEADING} />
              </p>
              <DetailList items={item.details} className="mt-1" />
            </div>
          ) : null}
        </div>
      ) : null}

      {item.phase || item.labels ? (
        <p className="mt-2 flex flex-wrap gap-1.5 text-xs">
          {item.phase ? (
            <span className="rounded-sm border border-nhs-wales-blue px-2 py-0.5 font-bold text-nhs-wales-blue">
              <T value={item.phase} />
            </span>
          ) : null}
          {item.labels?.map((label) => (
            <span
              key={label.en}
              className="rounded-sm bg-surface-muted px-2 py-0.5 font-medium text-ink-700"
            >
              <T value={label} />
            </span>
          ))}
        </p>
      ) : null}
    </li>
  );
}
