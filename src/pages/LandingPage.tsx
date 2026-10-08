import { ArrowRight } from 'lucide-react';
import type { Roadmap } from '../lib/types';
import { useLanguage } from '../lib/i18n';
import { HORIZONS, ROADMAP_INTRO } from '../lib/content';
import { formatDate } from '../lib/roadmap-helpers';
import { onNavigate, productHref } from '../lib/router';

function ProductCard({ roadmap }: { roadmap: Roadmap }) {
  const { lang, tr } = useLanguage();
  const { meta } = roadmap;
  const accent = meta.colour;
  const summary = meta.serviceDescription.en
    ? meta.serviceDescription
    : ROADMAP_INTRO;
  const headingId = `product-${roadmap.slug}`;

  return (
    <li className="group relative flex flex-col overflow-hidden rounded-card border border-border bg-surface shadow-sm transition-shadow hover:shadow-md card-focus-ring">
      <div
        aria-hidden="true"
        className="h-1.5"
        style={{ backgroundColor: accent }}
      />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {meta.statusLabel.en ? (
            <span className="inline-flex items-center rounded-full bg-heading px-2.5 py-0.5 font-medium text-white">
              {tr(meta.statusLabel)}
            </span>
          ) : null}
          {meta.lastUpdated ? (
            <span className="text-ink-700">
              {lang === 'cy' ? 'Diweddarwyd' : 'Updated'}{' '}
              <time dateTime={meta.lastUpdated}>
                {formatDate(meta.lastUpdated, lang)}
              </time>
            </span>
          ) : null}
        </div>

        <h3 id={headingId} className="mt-3 text-xl font-bold text-heading">
          <a
            href={productHref(roadmap.slug)}
            onClick={onNavigate(roadmap.slug)}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:shadow-none focus-visible:outline-none group-hover:underline"
          >
            {tr(meta.title)}
          </a>
        </h3>

        {summary.en ? (
          <p className="mt-3 line-clamp-4 leading-relaxed text-ink-900">
            {tr(summary)}
          </p>
        ) : null}

        <dl className="mt-5 flex flex-wrap gap-2">
          {HORIZONS.map((horizon) => (
            <div
              key={horizon.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-subtle px-3 py-1 text-sm"
            >
              <dt className="text-ink-700">{tr(horizon.label)}</dt>
              <dd className="font-semibold text-heading">
                {roadmap.items[horizon.id].length}
              </dd>
            </div>
          ))}
        </dl>

        <p
          aria-hidden="true"
          className="mt-auto inline-flex items-center gap-1 pt-6 font-medium text-action"
        >
          {lang === 'cy' ? 'Gweld y trywydd' : 'View roadmap'}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </p>
      </div>
    </li>
  );
}

/** Landing page: introduces the roadmaps and lets people pick a product. */
export function LandingPage({ roadmaps }: { roadmaps: Roadmap[] }) {
  const { lang } = useLanguage();
  const cy = lang === 'cy';

  return (
    <>
      <section
        aria-labelledby="landing-title"
        className="bg-surface-subtle px-4 pb-12 pt-28 sm:px-6 sm:pt-32"
      >
        <div className="mx-auto max-w-content">
          <span className="inline-flex items-center rounded-full bg-heading px-3 py-1 text-sm font-medium text-white">
            Beta
          </span>
          <h1
            id="landing-title"
            className="mt-4 text-3xl font-bold text-heading sm:text-4xl"
          >
            {cy ? 'Trywyddion cynnyrch' : 'Product roadmaps'}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-900">
            {cy
              ? 'Gweld beth mae Iechyd a Gofal Digidol Cymru yn gweithio arno nawr, beth sy’n dod nesaf a’r cyfeiriad rydym yn disgwyl ei gymryd yn hwyrach.'
              : 'See what Digital Health and Care Wales is working on now, what’s coming next and the direction we expect to take later.'}
          </p>
        </div>
      </section>

      <section
        aria-labelledby="products-heading"
        className="px-4 py-12 sm:px-6"
      >
        <div className="mx-auto max-w-content">
          <h2 id="products-heading" className="text-2xl font-bold text-heading">
            {cy ? 'Dewis cynnyrch' : 'Choose a product'}
          </h2>
          {roadmaps.length > 0 ? (
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {roadmaps.map((roadmap) => (
                <ProductCard key={roadmap.slug} roadmap={roadmap} />
              ))}
            </ul>
          ) : (
            <p className="mt-6 rounded-card border border-border bg-surface-subtle p-5 font-medium text-ink-700">
              {cy
                ? 'Does dim trywyddion wedi’u cyhoeddi eto.'
                : 'No roadmaps have been published yet.'}
            </p>
          )}
        </div>
      </section>
    </>
  );
}
