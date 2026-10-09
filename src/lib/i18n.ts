/**
 * Bilingual helpers.
 *
 * The content model is language-keyed. English is the working default for this
 * pass. Welsh is treated no less favourably structurally: every string has a
 * Welsh slot, and when it is empty the UI falls back to English so nothing
 * breaks. In development we collect which strings are still missing Welsh so
 * the translation work is easy to complete later.
 */
import { createContext, useContext } from 'react';
import type { Route } from './router';
import type { Localised } from './types';

export type Lang = 'cy' | 'en';

/** Welsh first, as on other bilingual Welsh public sector sites. */
export const LANGUAGES: { value: Lang; label: string }[] = [
  { value: 'cy', label: 'Cymraeg' },
  { value: 'en', label: 'English' },
];

/**
 * The default interface language. English for now so content can be reviewed
 * quickly. To make the site Welsh-first later, flip this single value to 'cy'.
 */
export const DEFAULT_LANGUAGE: Lang = 'en';

/** Same-site storage key for remembering the choice without cookies. */
export const LANG_STORAGE_KEY = 'dhcw-product-roadmaps-lang';

const missingWelsh = new Set<string>();

export function isLang(value: string | null): value is Lang {
  return value === 'cy' || value === 'en';
}

/** Remembers a language chosen with the toggle, for visits to the site root. */
export function rememberLang(lang: Lang) {
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // Storage may be unavailable (private mode); the URL still has the choice.
  }
}

/**
 * The language to send a visitor at the site root to: their earlier choice,
 * then a Welsh browser language, then the default.
 */
export function preferredLang(): Lang {
  try {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (isLang(stored)) return stored;
  } catch {
    // Fall through when storage is unavailable.
  }
  const welsh = navigator.languages.some((tag) => /^cy\b/i.test(tag));
  return welsh ? 'cy' : DEFAULT_LANGUAGE;
}

/**
 * Resolve a language-keyed value to a display string, falling back to English
 * when the requested language is empty.
 */
export function t(value: Localised, lang: Lang): string {
  return resolve(value, lang).text;
}

/** Like `t()`, but also reports which language the text is actually in. */
export function resolve(
  value: Localised,
  lang: Lang,
): { text: string; lang: Lang } {
  const requested = value[lang];
  if (requested && requested.trim() !== '') {
    return { text: requested, lang };
  }

  if (lang === 'cy' && import.meta.env.DEV) {
    const english = value.en;
    if (english && !missingWelsh.has(english)) {
      missingWelsh.add(english);
      console.warn(
        `[i18n] Missing Welsh translation, falling back to English: "${english}"`,
      );
    }
  }

  return { text: value.en, lang: 'en' };
}

/** Replaces `{name}` placeholders in both languages. */
export function fill(
  value: Localised,
  vars: Record<string, string>,
): Localised {
  const sub = (text: string) =>
    text.replace(/\{(\w+)\}/g, (match, name: string) => vars[name] ?? match);
  return { en: sub(value.en), cy: sub(value.cy) };
}

/** The set of English strings still awaiting Welsh, for dev tooling. */
export function getMissingWelsh(): string[] {
  return Array.from(missingWelsh);
}

export interface LanguageContextValue {
  lang: Lang;
  route: Route;
  tr: (value: Localised) => string;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);

/** Access the active language and translation helper. */
export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
