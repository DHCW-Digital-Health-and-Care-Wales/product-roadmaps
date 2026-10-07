import { AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';
import { useLanguage } from '../lib/i18n';
import { onNavigate, productHref } from '../lib/router';

function Panel({ children }: { children: ReactNode }) {
  return (
    <section className="bg-surface-subtle px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
      <div className="mx-auto max-w-content">{children}</div>
    </section>
  );
}

export function LoadingState() {
  const { lang } = useLanguage();

  return (
    <Panel>
      <div role="status" aria-live="polite">
        <span className="sr-only">
          {lang === 'cy'
            ? 'Wrthi’n llwytho’r trywyddion…'
            : 'Loading roadmaps…'}
        </span>
        <div aria-hidden="true" className="animate-pulse">
          <div className="h-6 w-28 rounded-full bg-surface-muted" />
          <div className="mt-4 h-9 w-2/3 max-w-lg rounded bg-surface-muted" />
          <div className="mt-4 h-5 w-full max-w-3xl rounded bg-surface-muted" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-56 rounded-card border border-border bg-surface"
              />
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { lang } = useLanguage();
  const cy = lang === 'cy';

  return (
    <Panel>
      <div
        role="alert"
        className="max-w-2xl rounded-card border border-border border-l-4 border-l-yellow bg-surface p-6 shadow-sm"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle
            className="mt-1 h-6 w-6 shrink-0 text-heading"
            aria-hidden="true"
          />
          <div>
            <h1 className="text-2xl font-bold text-heading">
              {cy
                ? 'Mae’n ddrwg gennym, nid oeddem yn gallu llwytho’r trywyddion'
                : 'Sorry, we couldn’t load the roadmaps'}
            </h1>
            <p className="mt-3 leading-relaxed text-ink-900">
              {cy
                ? 'Gwiriwch eich cysylltiad a rhowch gynnig arall arni. Os yw’r broblem yn parhau, dewch yn ôl yn nes ymlaen.'
                : 'Check your connection and try again. If the problem continues, please come back later.'}
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-5 inline-flex items-center gap-2 rounded bg-action px-4 py-2 font-medium text-white transition-colors hover:bg-heading"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              {cy ? 'Rhoi cynnig arall arni' : 'Try again'}
            </button>
          </div>
        </div>
      </div>
    </Panel>
  );
}

export function NotFoundState({ slug }: { slug: string }) {
  const { lang } = useLanguage();
  const cy = lang === 'cy';

  return (
    <Panel>
      <h1 className="text-3xl font-bold text-heading">
        {cy ? 'Heb ddod o hyd i’r trywydd' : 'Roadmap not found'}
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-900">
        {cy
          ? `Ni allem ddod o hyd i drywydd o’r enw “${slug}”. Efallai ei fod wedi symud neu wedi’i ddileu.`
          : `We couldn’t find a roadmap called “${slug}”. It may have moved or been removed.`}
      </p>
      <a
        href={productHref(null)}
        onClick={onNavigate(null)}
        className="mt-6 inline-flex items-center gap-2 font-medium text-action underline underline-offset-4 hover:no-underline"
      >
        {cy ? 'Gweld pob trywydd' : 'View all roadmaps'}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </a>
    </Panel>
  );
}
