import { fill, LANGUAGES, useLanguage } from '../lib/i18n';
import { pathFor } from '../lib/router';
import { UI } from '../lib/strings';
import { ArrowLink } from './ArrowLink';
import { T } from './T';

/**
 * An empty `slug` gives the generic message for the prerendered 404.html, in
 * both languages because the page can't tell which was asked for without
 * JavaScript.
 */
export function NotFoundState({ slug }: { slug: string }) {
  const { lang } = useLanguage();

  return (
    <section className="bg-surface-subtle px-4 pb-16 pt-6 sm:px-6">
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
            <ArrowLink href={pathFor(lang, null)} className="mt-6">
              <T value={UI.viewAllRoadmaps} />
            </ArrowLink>
          </>
        ) : (
          LANGUAGES.map(({ value }) => (
            <div key={value} lang={value} className="mt-8">
              <p className="max-w-3xl text-lg leading-relaxed text-ink-900">
                {UI.notFoundGeneric[value]}
              </p>
              <ArrowLink
                href={pathFor(value, null)}
                clientSide={false}
                className="mt-6"
              >
                {UI.viewAllRoadmaps[value]}
              </ArrowLink>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
