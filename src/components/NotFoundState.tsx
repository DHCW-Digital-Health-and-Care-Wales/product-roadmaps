import { ArrowRight } from 'lucide-react';
import { fill } from '../lib/i18n';
import { onNavigate, productHref } from '../lib/router';
import { UI } from '../lib/strings';
import { T } from './T';

export function NotFoundState({ slug }: { slug: string }) {
  return (
    <section className="bg-surface-subtle px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
      <div className="mx-auto max-w-content">
        <h1 tabIndex={-1} className="text-3xl font-bold text-heading">
          <T value={UI.notFoundHeading} />
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-900">
          <T value={fill(UI.notFoundBody, { slug })} />
        </p>
        <a
          href={productHref(null)}
          onClick={onNavigate(null)}
          className="mt-6 inline-flex items-center gap-2 font-medium text-action underline underline-offset-4 hover:no-underline"
        >
          <T value={UI.viewAllRoadmaps} />
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
