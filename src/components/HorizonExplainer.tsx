import { HORIZON_NOTE, HORIZONS } from '../lib/content';
import { UI } from '../lib/strings';
import { T } from './T';

/**
 * Plain-English explainer of what Now, Next and Later mean, plus the
 * forward-looking note that this shows direction and priorities rather than
 * firm commitments or dates.
 */
export function HorizonExplainer() {
  const headingId = 'horizons-explainer-heading';

  return (
    <section
      aria-labelledby={headingId}
      className="border-b border-border bg-surface px-4 py-12 sm:px-6"
    >
      <div className="mx-auto max-w-content">
        <h2 id={headingId} className="text-2xl font-bold text-heading">
          <T value={UI.horizonsHeading} />
        </h2>

        <dl className="mt-6 grid gap-4 md:grid-cols-3">
          {HORIZONS.map((horizon) => (
            <div
              key={horizon.id}
              className="rounded-card border border-border bg-surface-subtle p-5"
            >
              <dt className="text-lg font-bold text-heading">
                <T value={horizon.label} />
              </dt>
              <dd className="mt-2 leading-relaxed text-ink-900">
                <T value={horizon.definition} />
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-6 max-w-3xl leading-relaxed text-ink-700">
          <T value={HORIZON_NOTE} />
        </p>
      </div>
    </section>
  );
}
