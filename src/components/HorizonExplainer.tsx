import { HORIZON_NOTE, HORIZONS } from '../lib/content';
import type { View } from '../lib/router';
import { placementHeadingId } from '../lib/roadmap-helpers';
import { UI } from '../lib/strings';
import { T } from './T';

const horizonLink =
  'text-action underline underline-offset-4 hover:decoration-2';

/**
 * Plain-English explainer of what Now, Next and Later mean, plus a note that
 * the work has no dates and its order isn't a priority list. The cards view
 * shows the horizons as a quiet three-column strip with the note below; the
 * list view puts the note first and the horizons in a plain list. Each
 * horizon name links to its section further down the page.
 */
export function HorizonExplainer({ view }: { view: View }) {
  const headingId = 'horizons-explainer-heading';
  const note = <T value={HORIZON_NOTE} />;

  return (
    <section
      aria-labelledby={headingId}
      className={`page-section ${
        view === 'list' ? 'bg-surface' : 'bg-surface-subtle'
      }`}
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
            <dl className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-3">
              {HORIZONS.map((horizon) => (
                <div key={horizon.id}>
                  <dt className="font-bold">
                    <a
                      href={`#${placementHeadingId(horizon.id)}`}
                      className={horizonLink}
                    >
                      <T value={horizon.label} />
                    </a>
                  </dt>
                  <dd className="mt-1 leading-relaxed text-ink-700">
                    <T value={horizon.definition} />
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-4 max-w-3xl text-sm text-ink-700">{note}</p>
          </>
        )}
      </div>
    </section>
  );
}
