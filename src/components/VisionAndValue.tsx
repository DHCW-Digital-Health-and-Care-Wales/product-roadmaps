import type { RoadmapMeta } from '../lib/types';
import { UI } from '../lib/strings';
import { T } from './T';

/**
 * "Our vision" and "Our value" blocks, placed directly beneath the intro.
 * Copy comes from the product's "Vision" and "Service description" columns on
 * the Google Sheet's roadmap list; a block is hidden when its value is empty.
 */
export function VisionAndValue({ meta }: { meta: RoadmapMeta }) {
  return (
    <>
      {meta.vision.en ? (
        <section
          id="vision"
          aria-labelledby="vision-heading"
          className="border-b border-border bg-surface px-4 py-12 sm:px-6"
        >
          <div className="mx-auto max-w-content">
            <h2 id="vision-heading" className="text-2xl font-bold text-heading">
              <T value={UI.vision} />
            </h2>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-900">
              <T value={meta.vision} />
            </p>
          </div>
        </section>
      ) : null}

      {meta.serviceDescription.en ? (
        <section
          id="service-description"
          aria-labelledby="service-description-heading"
          className="border-b border-border bg-surface-subtle px-4 py-12 sm:px-6"
        >
          <div className="mx-auto max-w-content">
            <h2
              id="service-description-heading"
              className="text-2xl font-bold text-heading"
            >
              <T value={UI.value} />
            </h2>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-900">
              <T value={meta.serviceDescription} />
            </p>
          </div>
        </section>
      ) : null}
    </>
  );
}
