import type { RoadmapMeta } from '../lib/types';
import { useLanguage } from '../lib/i18n';

/**
 * "Our vision" and "Our value" blocks, placed directly beneath the intro.
 * Copy comes from the product's "vision" and "serviceDescription" settings in
 * the Google Sheet; a block is hidden when its setting is empty.
 */
export function VisionStatement({ meta }: { meta: RoadmapMeta }) {
  const { lang, tr } = useLanguage();

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
              {lang === 'cy' ? 'Ein gweledigaeth' : 'Our vision'}
            </h2>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-900">
              {tr(meta.vision)}
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
              {lang === 'cy' ? 'Ein gwerth' : 'Our value'}
            </h2>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-900">
              {tr(meta.serviceDescription)}
            </p>
          </div>
        </section>
      ) : null}
    </>
  );
}
