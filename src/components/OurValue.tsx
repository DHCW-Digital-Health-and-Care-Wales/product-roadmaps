import type { RoadmapMeta } from '../lib/types';
import { UI } from '../lib/strings';
import { T } from './T';

/**
 * "Our value" section, placed directly beneath the intro (which holds "Our
 * vision"). Copy comes from the product's "Service description" column on the
 * Google Sheet's roadmap list; the section is hidden when it is empty.
 */
export function OurValue({ meta }: { meta: RoadmapMeta }) {
  if (!meta.serviceDescription.en) return null;

  return (
    <section
      id="service-description"
      aria-labelledby="service-description-heading"
      className="border-b border-border bg-surface px-4 py-8 sm:px-6"
    >
      <div className="mx-auto max-w-content">
        <h2
          id="service-description-heading"
          className="text-2xl font-bold text-heading"
        >
          <T value={UI.value} />
        </h2>
        <p className="mt-3 max-w-3xl whitespace-pre-line text-lg leading-relaxed text-ink-900">
          <T value={meta.serviceDescription} />
        </p>
      </div>
    </section>
  );
}
