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
import type { Localised } from './types';

export type Lang = 'cy' | 'en';

/**
 * The default interface language. English for now so content can be reviewed
 * quickly. To make the site Welsh-first later, flip this single value to 'cy'.
 */
export const DEFAULT_LANGUAGE: Lang = 'en';

/** Query-string key used to share and persist the language choice. */
export const LANG_PARAM = 'lang';

/** Same-site storage key for remembering the choice without cookies. */
export const LANG_STORAGE_KEY = 'dhcw-product-roadmaps-lang';

const missingWelsh = new Set<string>();

function isLang(value: string | null): value is Lang {
  return value === 'cy' || value === 'en';
}

/**
 * The initial language from, in order: the URL query parameter (so a link can be
 * shared in a given language), a same-site stored preference, then the default.
 * `explicit` is false only for the default, which is never written back so
 * first-time visitors keep clean URLs. No third-party cookies are used.
 */
export function readInitialLang(): { lang: Lang; explicit: boolean } {
  // The build-time prerender has no window.
  if (typeof window === 'undefined') {
    return { lang: DEFAULT_LANGUAGE, explicit: false };
  }

  const fromUrl = new URLSearchParams(window.location.search).get(LANG_PARAM);
  if (isLang(fromUrl)) {
    return { lang: fromUrl, explicit: true };
  }

  try {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (isLang(stored)) {
      return { lang: stored, explicit: true };
    }
  } catch {
    // Storage may be unavailable (private mode); fall through to the default.
  }

  return { lang: DEFAULT_LANGUAGE, explicit: false };
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
  setLang: (lang: Lang) => void;
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
