import type { ReactNode } from 'react';
import type { DetailLine, RoadmapItem } from '../lib/types';
import { DETAILS_HEADING } from '../lib/content';
import { statusLabel } from '../lib/roadmap-helpers';
import { UI } from '../lib/strings';
import { T } from './T';

/** Builds nested lists from `level`, so "- " lines sit under the line above. */
function DetailList({ items }: { items: DetailLine[] }) {
  const build = (start: number, level: number): [ReactNode[], number] => {
    const nodes: ReactNode[] = [];
    let i = start;
    while (i < items.length && items[i].level >= level) {
      const index = i;
      let children: ReactNode = null;
      i++;
      if (i < items.length && items[i].level > level) {
        const [nested, next] = build(i, items[i].level);
        children = <ul className="mt-1 list-disc space-y-1 pl-5">{nested}</ul>;
        i = next;
      }
      nodes.push(
        <li key={index}>
          <T value={items[index].text} />
          {children}
        </li>,
      );
    }
    return [nodes, i];
  };

  return (
    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-900">
      {build(0, 0)[0]}
    </ul>
  );
}

/**
 * A single roadmap item. Shows the title, description, a text status label and
 * any labels. Never shows a date: the roadmap communicates priority and
 * confidence, not committed dates.
 */
export function RoadmapCard({
  item,
  headingLevel = 4,
}: {
  item: RoadmapItem;
  headingLevel?: 3 | 4;
}) {
  const Heading = headingLevel === 3 ? 'h3' : 'h4';
  const isDiscovery = item.phase?.toLowerCase().includes('discovery');

  return (
    <article className="rounded-card border border-border bg-surface p-4 shadow-sm">
      {item.phase ? (
        <p className="mb-2">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
              isDiscovery
                ? 'border-purple-300 bg-purple-50 text-purple-800'
                : 'border-border-strong bg-surface-subtle text-ink-700'
            }`}
          >
            {item.phase}
          </span>
        </p>
      ) : null}
      <Heading className="font-bold text-heading">
        <T value={item.title} />
      </Heading>
      {item.description.en ? (
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-900">
          <T value={item.description} />
        </p>
      ) : null}
      {item.outcome ? (
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-900">
          <strong className="font-semibold text-heading">
            <T value={UI.outcome} />
          </strong>{' '}
          <T value={item.outcome} />
        </p>
      ) : null}
      {item.details ? (
        <details className="mt-3 rounded-card border border-border bg-surface-subtle p-3">
          <summary className="cursor-pointer text-sm font-semibold text-heading">
            <T value={DETAILS_HEADING} />
          </summary>
          <DetailList items={item.details} />
        </details>
      ) : null}

      {item.status || item.labels ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {item.status ? (
            <span className="inline-flex items-center rounded-full border border-border-strong bg-surface-subtle px-2.5 py-0.5 text-xs font-medium text-ink-700">
              <T value={statusLabel(item.status)} />
            </span>
          ) : null}
          {item.labels?.map((label) => (
            <span
              key={label}
              className="inline-flex items-center rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-ink-700"
            >
              {label}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}
