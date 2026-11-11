import { useLanguage } from '../lib/i18n';
import { INFO_PAGES } from '../lib/info-pages';
import { pathFor, type InfoPageId } from '../lib/router';
import { UI } from '../lib/strings';
import { ArrowLink } from '../components/ArrowLink';
import { T } from '../components/T';

/**
 * The accessibility statement or privacy note, on a page of its own: the
 * heading in a grey band that continues from the phase banner, as on the
 * other pages, then the text and a link to all roadmaps. The link isn't a back
 * link, as visitors may arrive here from anywhere.
 */
export function InfoPage({ page }: { page: InfoPageId }) {
  const { lang } = useLanguage();
  const { heading, paragraphs } = INFO_PAGES[page];
  const home = pathFor(lang, null);

  return (
    <>
      <div className="bg-surface-subtle px-4 pb-8 pt-6 sm:px-6">
        <h1
          tabIndex={-1}
          className="mx-auto max-w-content text-3xl font-bold text-heading"
        >
          <T value={heading} />
        </h1>
      </div>
      <div className="px-4 pb-16 pt-8 sm:px-6">
        <div className="mx-auto max-w-content">
          <div className="max-w-3xl space-y-4 leading-relaxed text-ink-900">
            {paragraphs.map((paragraph) => (
              <p key={paragraph.en}>
                <T value={paragraph} />
              </p>
            ))}
          </div>
          <ArrowLink href={home} className="mt-8">
            <T value={UI.viewAllRoadmaps} />
          </ArrowLink>
        </div>
      </div>
    </>
  );
}
