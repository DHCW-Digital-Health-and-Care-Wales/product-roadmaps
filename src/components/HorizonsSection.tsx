import { ChevronDown } from 'lucide-react';
import type { Roadmap } from '../lib/types';
import { useLanguage } from '../lib/i18n';
import { HORIZONS, ROADMAP_DESCRIPTION, ROADMAP_HEADING } from '../lib/content';
import { HorizonColumn } from './HorizonColumn';

/**
 * The roadmap itself: a heading in the roadmap's colour, followed by the three
 * horizons stacked as a single top-to-bottom journey (Now, then Next, then
 * Later). This stacked chronological layout is the canonical roadmap
 * presentation pattern; see docs/ROADMAP_PRESENTATION_STANDARD.md and
 * docs/adr/0001-roadmap-chronology-presentation-pattern.md. Horizons are never
 * rendered as side-by-side columns. A decorative connector between phases
 * signals progression without relying on colour to carry meaning.
 */
export function HorizonsSection({ roadmap }: { roadmap: Roadmap }) {
  const { tr } = useLanguage();
  const headingId = 'roadmap-heading';
  const accent = roadmap.meta.colour;
  const lastIndex = HORIZONS.length - 1;

  return (
    <section aria-labelledby={headingId} className="py-10">
      <div className="border-l-4 pl-4" style={{ borderColor: accent }}>
        <h2 id={headingId} className="text-2xl font-bold text-heading">
          {tr(ROADMAP_HEADING)}
        </h2>
      </div>

      <p className="mt-4 max-w-3xl leading-relaxed text-ink-900">
        {tr(ROADMAP_DESCRIPTION)}
      </p>

      <ol className="mt-8 space-y-8">
        {HORIZONS.map((horizon, index) => (
          <li key={horizon.id}>
            <HorizonColumn
              label={horizon.label}
              items={roadmap.items[horizon.id]}
              headingId={`horizon-${horizon.id}`}
              accent={accent}
            />
            {index < lastIndex ? (
              <div
                aria-hidden="true"
                className="flex flex-col items-center pt-8 text-ink-300"
              >
                <ChevronDown className="h-6 w-6" strokeWidth={2.5} />
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
