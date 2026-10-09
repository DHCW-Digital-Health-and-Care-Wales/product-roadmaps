import { useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Localised } from '../lib/types';
import { DEFAULT_LANGUAGE, LanguageContext, t } from '../lib/i18n';
import { useRoute, type Route } from '../lib/router';

/**
 * Provides the current route, its language (from the URL path) and a
 * translation helper, and keeps the document `lang` attribute in sync. The
 * prerender passes `serverRoute` because there is no URL to read.
 */
export function LanguageProvider({
  serverRoute,
  children,
}: {
  serverRoute?: Route;
  children: ReactNode;
}) {
  const route = useRoute(serverRoute);
  const lang = route.lang ?? DEFAULT_LANGUAGE;

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      route,
      tr: (localised: Localised) => t(localised, lang),
    }),
    [lang, route],
  );

  return <LanguageContext value={value}>{children}</LanguageContext>;
}
