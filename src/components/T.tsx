import { resolve, useLanguage } from '../lib/i18n';
import type { Localised } from '../lib/types';

/**
 * Renders localised text, marking English fallbacks with `lang="en"` so screen
 * readers switch pronunciation (WCAG 3.1.2). Use `tr()` for attributes.
 */
export function T({ value }: { value: Localised }) {
  const { lang } = useLanguage();
  const resolved = resolve(value, lang);
  return resolved.lang === lang ? (
    resolved.text
  ) : (
    <span lang={resolved.lang}>{resolved.text}</span>
  );
}
