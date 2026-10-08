import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Localised } from '../lib/types';
import {
  LANG_PARAM,
  LANG_STORAGE_KEY,
  LanguageContext,
  readInitialLang,
  t,
  type Lang,
} from '../lib/i18n';

/**
 * Provides the active language and a translation helper, and keeps the document
 * `lang` attribute, the URL and the stored preference in sync.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(readInitialLang);
  const [lang, setLang] = useState<Lang>(initial.lang);
  // Track whether the URL param should be written. We only write it when the
  // user has actively chosen a language (or when an explicit choice was already
  // present on load), so first-time visitors don't see ?lang=en appended to
  // every URL they share.
  const [writeUrlParam, setWriteUrlParam] = useState(initial.explicit);

  useEffect(() => {
    document.documentElement.lang = lang;

    // Persisting the default would make every later visit look explicit.
    if (!writeUrlParam) return;

    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // Ignore storage failures; the choice still applies for this session.
    }

    const url = new URL(window.location.href);
    url.searchParams.set(LANG_PARAM, lang);
    window.history.replaceState({}, '', url);
  }, [lang, writeUrlParam]);

  const chooseLang = useCallback((next: Lang) => {
    setWriteUrlParam(true);
    setLang(next);
  }, []);

  const value = useMemo(
    () => ({
      lang,
      setLang: chooseLang,
      tr: (localised: Localised) => t(localised, lang),
    }),
    [lang, chooseLang],
  );

  return <LanguageContext value={value}>{children}</LanguageContext>;
}
