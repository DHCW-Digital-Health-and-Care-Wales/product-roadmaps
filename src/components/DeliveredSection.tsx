import type { RoadmapItem } from '../lib/types';
import { useLanguage } from '../lib/i18n';
import type { SECTIONS } from '../lib/content';
import { RoadmapCard } from './RoadmapCard';

/**
 * A delivered work section, for example "Recently delivered", "Other work we
 * have delivered this year" or "Not doing right now".
 */
export function DeliveredSection({
  section,
  items,
}: {
  section: (typeof SECTIONS)[number];
  items: RoadmapItem[];
}) {
  const { lang, tr } = useLanguage();
  const headingId = `delivered-${section.id}`;

  return (
    <section
      aria-labelledby={headingId}
      className="border-b border-border bg-surface px-4 py-12 sm:px-6"
    >
      <div className="mx-auto max-w-content">
        <div className="flex items-center gap-2">
          <h2 id={headingId} className="text-2xl font-bold text-heading">
            {tr(section.heading)}
          </h2>
          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-border bg-surface-subtle px-2 text-xs font-semibold text-ink-700">
            {items.length}
          </span>
        </div>

        <p className="mt-4 max-w-3xl leading-relaxed text-ink-900">
          {tr(section.description)}
        </p>

        {items.length > 0 ? (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {items.map((item, index) => (
              <RoadmapCard key={index} item={item} headingLevel={3} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-card border border-border bg-surface-subtle p-5">
            <p className="font-medium text-ink-700">
              {lang === 'cy'
                ? 'Dim byd i’w ddangos yma eto.'
                : 'Nothing to show here yet.'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
