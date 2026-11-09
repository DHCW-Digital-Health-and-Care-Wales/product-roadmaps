import { useResolved } from '../lib/i18n';
import type { Localised } from '../lib/types';

/**
 * Renders localised text, marking English fallbacks with `lang="en"` so screen
 * readers switch pronunciation (WCAG 3.1.2). Use `tr()` for attributes.
 */
export function T({ value }: { value: Localised }) {
  const { text, lang } = useResolved(value);
  return lang ? <span lang={lang}>{text}</span> : text;
}
