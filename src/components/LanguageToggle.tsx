import { LANGUAGES, rememberLang, useLanguage } from '../lib/i18n';
import { onNavigate, pathFor } from '../lib/router';

/**
 * Language toggle: links to this page in each language, so it works without
 * JavaScript. The current language is conveyed in text and by aria-current,
 * not by colour alone.
 */
export function LanguageToggle() {
  const { lang, route } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Dewis iaith / Choose language"
      className="inline-flex rounded-sm border border-white/40"
    >
      {LANGUAGES.map((option) => {
        const isActive = lang === option.value;
        const href = pathFor(option.value, route.slug);
        return (
          <a
            key={option.value}
            href={href}
            lang={option.value}
            hrefLang={option.value}
            onClick={(event) => {
              rememberLang(option.value);
              onNavigate(`${href}${window.location.hash}`, { scroll: false })(
                event,
              );
            }}
            aria-current={isActive ? 'page' : undefined}
            className={`relative px-3 py-1.5 text-sm font-medium transition-colors first:rounded-l-sm last:rounded-r-sm focus-visible:z-10 ${
              isActive
                ? 'bg-white text-nhs-wales-blue'
                : 'bg-transparent text-white hover:bg-white/15'
            }`}
          >
            {option.label}
          </a>
        );
      })}
    </div>
  );
}
