import { ChevronRight, Layers, Tag } from 'lucide-react';
import { DETAILS_HEADING } from '../lib/content';
import { UI } from '../lib/strings';
import type { RoadmapItem } from '../lib/types';
import { DetailList } from './DetailList';
import { OrgPills } from './OrgPills';
import { RichText } from './RichText';
import { T } from './T';

/**
 * A single roadmap item. Shows the phase, title, description and outcome, then
 * a footer pinned to the bottom of the card (so footers line up across a grid
 * row) with the details, labels and the organisations it is for. Never shows a
 * date: the roadmap communicates priority and confidence, not committed dates.
 */
export function RoadmapCard({
  item,
  headingLevel = 4,
}: {
  item: RoadmapItem;
  headingLevel?: 3 | 4;
}) {
  const Heading = headingLevel === 3 ? 'h3' : 'h4';
  const labels = item.labels ?? [];
  // Each footer item has its own check below; keep this in step with them so a
  // card with none gets no empty footer.
  const hasFooter =
    item.details !== undefined ||
    labels.length > 0 ||
    item.organisations !== undefined;

  return (
    <article
      data-filter-card=""
      className="flex flex-col rounded-card border border-border bg-surface p-5 shadow-xs"
    >
      {item.phase ? (
        <p className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold text-nhs-wales-blue">
          <Layers
            aria-hidden="true"
            className="h-4 w-4 shrink-0"
            strokeWidth={2.25}
          />
          <T value={item.phase} />
        </p>
      ) : null}
      <Heading
        data-filter-focus=""
        tabIndex={-1}
        className="text-lg leading-snug font-bold text-heading"
      >
        <T value={item.title} />
      </Heading>
      {item.description.en ? (
        <RichText
          value={item.description}
          className="mt-2 text-base leading-relaxed text-ink-900"
        />
      ) : null}
      {item.outcome ? (
        <div className="mt-4 rounded-card bg-surface-subtle p-3">
          <p className="text-sm font-semibold text-heading">
            <T value={UI.outcome} />
          </p>
          <RichText
            value={item.outcome}
            className="mt-1 text-base leading-relaxed text-ink-900"
          />
        </div>
      ) : null}

      {hasFooter ? (
        <div className="mt-auto space-y-3 pt-4">
          {item.details ? (
            // mb-0 overrides the margin space-y adds, so the 44px row sits
            // evenly against the rule below it.
            <details className="group mb-0 border-t border-border">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold text-action underline-offset-4 hover:underline [&::-webkit-details-marker]:hidden">
                <span>
                  <T value={DETAILS_HEADING} />
                  <span className="sr-only">
                    : <T value={item.title} />
                  </span>
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 transition-transform group-open:rotate-90"
                  strokeWidth={2.5}
                />
              </summary>
              <DetailList items={item.details} className="pb-3 text-base" />
            </details>
          ) : null}

          {labels.length ? (
            <p className="flex gap-1.5 border-t border-border pt-3 text-sm text-ink-700">
              <Tag
                aria-hidden="true"
                className="mt-[3px] h-3.5 w-3.5 shrink-0 text-ink-500"
                strokeWidth={2.25}
              />
              <span>
                <span className="sr-only">
                  <T value={UI.tags} />{' '}
                </span>
                {labels.map((label, i) => (
                  // Each dot ends the topic before it, so a wrapped line never
                  // starts with one; screen readers hear a comma instead.
                  <span key={label.en}>
                    <span className="inline-block max-w-full">
                      <T value={label} />
                      {i < labels.length - 1 ? (
                        <>
                          <span className="sr-only">,</span>
                          <span
                            aria-hidden="true"
                            className="ml-1 text-ink-300"
                          >
                            •
                          </span>
                        </>
                      ) : null}
                    </span>{' '}
                  </span>
                ))}
              </span>
            </p>
          ) : null}

          {item.organisations ? (
            <OrgPills
              organisations={item.organisations}
              className="border-t border-border pt-3"
            />
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
