import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import { INFO_PAGES } from '../lib/info-pages';
import { onNavigate, pathFor, type InfoPageId } from '../lib/router';
import { UI } from '../lib/strings';
import { T } from '../components/T';

/** The accessibility statement or privacy note, on a page of its own. */
export function InfoPage({ page }: { page: InfoPageId }) {
  const { lang } = useLanguage();
  const { heading, paragraphs } = INFO_PAGES[page];
  const home = pathFor(lang, null);

  return (
    <section className="px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
      <div className="mx-auto max-w-content">
        <a
          href={home}
          onClick={onNavigate(home)}
          className="inline-flex items-center gap-2 font-medium text-action underline underline-offset-4 hover:no-underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <T value={UI.backToRoadmaps} />
        </a>
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
