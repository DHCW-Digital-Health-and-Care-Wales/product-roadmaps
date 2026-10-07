import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import { onNavigate, productHref } from '../lib/router';

export function NotFoundState({ slug }: { slug: string }) {
  const { lang } = useLanguage();
  const cy = lang === 'cy';

  return (
    <section className="bg-surface-subtle px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
      <div className="mx-auto max-w-content">
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
      </div>
    </section>
  );
}
