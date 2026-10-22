import { HORIZON_NOTE, HORIZONS } from '../lib/content';
import type { View } from '../lib/router';
import { placementHeadingId } from '../lib/roadmap-helpers';
import { UI } from '../lib/strings';
import { T } from './T';

const horizonLink =
  'text-action underline underline-offset-4 hover:decoration-2';

/**
 * Plain-English explainer of what Now, Next and Later mean, plus the
 * forward-looking note that this shows direction and priorities rather than
 * firm commitments or dates. The list view puts the note first and the
 * horizons in a plain list instead of cards. Each horizon name links to its
 * section further down the page.
 */
export function HorizonExplainer({ view }: { view: View }) {
  const headingId = 'horizons-explainer-heading';
  const note = <T value={HORIZON_NOTE} />;

  return (
    <section
      aria-labelledby={headingId}
      className="border-b border-border bg-surface px-4 py-12 sm:px-6"
    >
      <div className="mx-auto max-w-content">
        <h2 id={headingId} className="text-2xl font-bold text-heading">
          <T value={UI.horizonsHeading} />
        </h2>

        {view === 'list' ? (
          <div className="max-w-3xl">
            <p className="mt-4 leading-relaxed text-ink-700">{note}</p>
            <dl className="mt-6 divide-y divide-border border-y border-border">
              {HORIZONS.map((horizon) => (
                <div key={horizon.id} className="py-3">
                  <dt className="text-lg font-bold">
                    <a
                      href={`#${placementHeadingId(horizon.id)}`}
                      className={horizonLink}
                    >
                      <T value={horizon.label} />
                    </a>
                  </dt>
                  <dd className="mt-1 leading-relaxed text-ink-900">
                    <T value={horizon.definition} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ) : (
          <>
            <dl className="mt-6 grid gap-4 md:grid-cols-3">
              {HORIZONS.map((horizon) => (
                <div
                  key={horizon.id}
                  className="group relative rounded-card border border-border bg-surface-subtle p-5 transition-shadow hover:shadow-md card-focus-ring"
                >
                  <dt className="text-lg font-bold text-heading">
                    <a
                      href={`#${placementHeadingId(horizon.id)}`}
                      className="after:absolute after:inset-0 after:content-[''] focus-visible:shadow-none focus-visible:outline-hidden group-hover:underline"
                    >
                      <T value={horizon.label} />
                    </a>
                  </dt>
                  <dd className="mt-2 leading-relaxed text-ink-900">
                    <T value={horizon.definition} />
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 max-w-3xl leading-relaxed text-ink-700">
              {note}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
