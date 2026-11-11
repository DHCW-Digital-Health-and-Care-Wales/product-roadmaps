import { useLanguage } from '../lib/i18n';
import { INFO_PAGES } from '../lib/info-pages';
import { pathFor, type InfoPageId } from '../lib/router';
import { UI } from '../lib/strings';
import { BackLink } from '../components/BackLink';
import { T } from '../components/T';

/** The accessibility statement or privacy note, on a page of its own. */
export function InfoPage({ page }: { page: InfoPageId }) {
  const { lang } = useLanguage();
  const { heading, paragraphs } = INFO_PAGES[page];
  const home = pathFor(lang, null);

  return (
    <section className="px-4 pb-16 pt-6 sm:px-6">
      <div className="mx-auto max-w-content">
        <BackLink href={home}>
          <T value={UI.backToRoadmaps} />
        </BackLink>
        <h1 tabIndex={-1} className="mt-6 text-3xl font-bold text-heading">
          <T value={heading} />
        </h1>
        <div className="mt-4 max-w-3xl space-y-4 leading-relaxed text-ink-900">
          {paragraphs.map((paragraph) => (
            <p key={paragraph.en}>
              <T value={paragraph} />
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
