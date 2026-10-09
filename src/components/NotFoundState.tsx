import { ArrowRight } from 'lucide-react';
import { fill, LANGUAGES, useLanguage } from '../lib/i18n';
import { onNavigate, pathFor } from '../lib/router';
import { UI } from '../lib/strings';
import { T } from './T';

const LINK_CLASS =
  'mt-6 inline-flex items-center gap-2 font-medium text-action underline underline-offset-4 hover:no-underline';

/**
 * An empty `slug` gives the generic message for the prerendered 404.html, in
 * both languages because the page can't tell which was asked for without
 * JavaScript.
 */
export function NotFoundState({ slug }: { slug: string }) {
  const { lang } = useLanguage();

  return (
    <section className="bg-surface-subtle px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
      <div className="mx-auto max-w-content">
        <h1 tabIndex={-1} className="text-3xl font-bold text-heading">
          {slug ? (
            <T value={UI.notFoundHeading} />
          ) : (
            <>
              <span lang="cy">{UI.notFoundHeading.cy}</span> /{' '}
              <span lang="en">{UI.notFoundHeading.en}</span>
            </>
          )}
        </h1>
        {slug ? (
          <>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-900">
              <T value={fill(UI.notFoundBody, { slug })} />
            </p>
            <a
              href={pathFor(lang, null)}
              onClick={onNavigate(pathFor(lang, null))}
              className={LINK_CLASS}
            >
              <T value={UI.viewAllRoadmaps} />
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </>
        ) : (
          LANGUAGES.map(({ value }) => (
            <div key={value} lang={value} className="mt-8">
              <p className="max-w-3xl text-lg leading-relaxed text-ink-900">
                {UI.notFoundGeneric[value]}
              </p>
              <a href={pathFor(value, null)} className={LINK_CLASS}>
                {UI.viewAllRoadmaps[value]}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
