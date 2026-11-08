import { ArrowRight, Building2 } from 'lucide-react';
import type { Roadmap, OrgFilter } from '../lib/types';
import { fill, useLanguage } from '../lib/i18n';
import { HORIZONS, organisation } from '../lib/content';
import {
  countItems,
  countOf,
  filterItems,
  formatDate,
  roadmapSummary,
} from '../lib/roadmap-helpers';
import { onNavigate, pathFor, withOrgFilter } from '../lib/router';
import { UI } from '../lib/strings';
import { T } from './T';

/**
 * A landing page card linking to a roadmap. While filtered, it says how many
 * items are for the organisation and counts only those.
 */
export function ProductCard({
  roadmap,
  filter,
}: {
  roadmap: Roadmap;
  filter: OrgFilter;
}) {
  const { lang } = useLanguage();
  const href = withOrgFilter(pathFor(lang, roadmap.slug), filter);
  const { meta } = roadmap;
  const accent = meta.colour;
  const summary = roadmapSummary(roadmap);
  const headingId = `product-${roadmap.slug}`;

  return (
    <li
      data-filter-card=""
      className="group relative flex flex-col overflow-hidden rounded-card border border-border bg-surface shadow-xs transition-shadow hover:shadow-md card-focus-ring"
    >
      <div
        aria-hidden="true"
        className="h-1.5"
        style={{ backgroundColor: accent }}
      />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {meta.statusLabel.en ? (
            <span className="inline-flex items-center rounded-full bg-heading px-2.5 py-0.5 font-medium text-white">
              <T value={meta.statusLabel} />
            </span>
          ) : null}
          {meta.lastUpdated ? (
            <span className="text-ink-700">
              <T value={UI.updated} />{' '}
              <time dateTime={meta.lastUpdated}>
                {formatDate(meta.lastUpdated, lang)}
              </time>
            </span>
          ) : null}
        </div>

        {meta.family.en ? (
          // The swatch matches the colour band, linking a family across categories.
          <p className="mt-3 flex items-center gap-2 text-sm font-medium text-ink-700">
            <span
              aria-hidden="true"
              className="h-3 w-3 shrink-0 rounded-xs border border-black/10"
              style={{ backgroundColor: accent }}
            />
            <T value={meta.family} />
          </p>
        ) : null}
        <h3
          id={headingId}
          className={`${meta.family.en ? 'mt-1' : 'mt-3'} text-xl font-bold text-heading`}
        >
          <a
            data-filter-focus=""
            href={href}
            onClick={onNavigate(href)}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:shadow-none focus-visible:outline-hidden group-hover:underline"
          >
            <T value={meta.title} />
          </a>
        </h3>

        {summary.en ? (
          <p className="mt-3 line-clamp-4 leading-relaxed text-ink-900">
            <T value={summary} />
          </p>
        ) : null}

        {/* mt-auto pins the counts and link to the bottom, so they line up across a row. */}
        <div className="mt-auto pt-5">
          {filter.org ? (
            <p className="mb-3 flex items-center gap-1.5 text-sm text-ink-700">
              <Building2 aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span>
                <strong className="font-semibold text-heading">
                  <T value={countOf(countItems(roadmap, filter))} />
                </strong>{' '}
                <T
                  value={fill(UI.itemsFor, {
                    organisation: organisation(filter.org).short,
                  })}
                />
              </span>
            </p>
          ) : null}
          <dl className="flex flex-wrap gap-2">
            {HORIZONS.map((horizon) => (
              <div
                key={horizon.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-subtle px-3 py-1 text-sm"
              >
                <dt className="text-ink-700">
                  <T value={horizon.label} />
                </dt>
                <dd className="font-semibold text-heading">
                  {filterItems(roadmap.items[horizon.id], filter).length}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <p
          aria-hidden="true"
          className="inline-flex items-center gap-1 pt-6 font-medium text-action"
        >
          <T value={UI.viewRoadmap} />
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </p>
      </div>
    </li>
  );
}
