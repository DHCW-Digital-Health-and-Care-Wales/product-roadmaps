import type { RoadmapMeta } from '../lib/types';
import { useLanguage } from '../lib/i18n';
import { ROADMAP_INTRO } from '../lib/content';
import { formatDate } from '../lib/roadmap-helpers';
import { onNavigate, productHref } from '../lib/router';

/**
 * Title section: a link back to all roadmaps, the roadmap title, status label,
 * a visible "last updated" date and the short intro. Rendered as the page's
 * primary heading.
 */
export function RoadmapIntro({ meta }: { meta: RoadmapMeta }) {
  const { lang, tr } = useLanguage();

  return (
    <section
      id="about"
      aria-labelledby="roadmap-title"
      className="scroll-mt-28 bg-surface-subtle px-4 pb-12 pt-28 sm:px-6 sm:pt-32"
    >
      <div className="mx-auto max-w-content">
        <p className="mb-6">
          <a
            href={productHref(null)}
            onClick={onNavigate(null)}
            className="text-sm font-medium text-action underline underline-offset-4 hover:no-underline"
          >
            &larr; {lang === 'cy' ? 'Pob trywydd' : 'All roadmaps'}
          </a>
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {meta.statusLabel.en ? (
            <span className="inline-flex items-center rounded-full bg-heading px-3 py-1 text-sm font-medium text-white">
              {tr(meta.statusLabel)}
            </span>
          ) : null}
          {meta.lastUpdated ? (
            <span className="text-sm text-ink-700">
              {lang === 'cy' ? 'Diweddarwyd ddiwethaf' : 'Last updated'}:{' '}
              <time dateTime={meta.lastUpdated}>
                {formatDate(meta.lastUpdated, lang)}
              </time>
            </span>
          ) : null}
        </div>

        <h1
          id="roadmap-title"
          className="mt-4 text-3xl font-bold text-heading sm:text-4xl"
        >
          {tr(meta.title)}
        </h1>

        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-900">
          {tr(ROADMAP_INTRO)}
        </p>
      </div>
    </section>
  );
}
