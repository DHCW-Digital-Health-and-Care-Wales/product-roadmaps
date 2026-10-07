import type { ReactNode } from 'react';
import type { Capabilities, RoadmapItem } from '../lib/types';
import { useLanguage } from '../lib/i18n';
import { statusLabel } from '../lib/roadmap-helpers';

function renderSummaryWithMetric(summary: string, metric?: string) {
  if (!metric || !summary.includes(metric)) {
    return summary;
  }

  const [before, after] = summary.split(metric, 2);
  return (
    <>
      {before}
      <strong className="rounded bg-heading/10 px-1 font-semibold text-heading">
        {metric}
      </strong>
      {after}
    </>
  );
}

/** Builds nested lists from `level`, so "- " lines sit under the line above. */
function CapabilityList({
  items,
  tr,
}: {
  items: Capabilities['items'];
  tr: (value: Capabilities['label']) => string;
}) {
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
          {tr(items[index].text)}
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
 * A single roadmap item. Shows the title, summary, a text status label and any
 * related services. Never shows a date: the roadmap communicates priority and
 * confidence, not committed dates.
 */
export function RoadmapCard({
  item,
  headingLevel = 4,
}: {
  item: RoadmapItem;
  headingLevel?: 3 | 4;
}) {
  const { lang, tr } = useLanguage();
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
      <Heading className="font-bold text-heading">{tr(item.title)}</Heading>
      {item.summary.en ? (
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-900">
          {renderSummaryWithMetric(tr(item.summary), item.metric)}
        </p>
      ) : null}
      {item.outcome ? (
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-900">
          <strong className="font-semibold text-heading">
            {lang === 'cy' ? 'Canlyniad:' : 'Outcome:'}
          </strong>{' '}
          {tr(item.outcome)}
        </p>
      ) : null}
      {item.capabilities ? (
        <details className="mt-3 rounded-card border border-border bg-surface-subtle p-3">
          <summary className="cursor-pointer text-sm font-semibold text-heading">
            {tr(item.capabilities.label)}
          </summary>
          <CapabilityList items={item.capabilities.items} tr={tr} />
        </details>
      ) : null}

      {item.status || item.services ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {item.status ? (
            <span className="inline-flex items-center rounded-full border border-border-strong bg-surface-subtle px-2.5 py-0.5 text-xs font-medium text-ink-700">
              {tr(statusLabel(item.status))}
            </span>
          ) : null}
          {item.services?.map((service) => (
            <span
              key={service}
              className="inline-flex items-center rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-ink-700"
            >
              {service}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}
