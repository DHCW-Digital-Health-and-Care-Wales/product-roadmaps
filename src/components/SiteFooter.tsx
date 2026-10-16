import logoImage from '../assets/dhcw-logo.png';
import { useLanguage } from '../lib/i18n';
import {
  dataPathFor,
  onNavigate,
  pathFor,
  useHasJs,
  type View,
} from '../lib/router';
import type { Localised } from '../lib/types';
import { UI } from '../lib/strings';
import { T } from './T';

const REPO_URL =
  'https://github.com/DHCW-Digital-Health-and-Care-Wales/product-roadmaps';
const FEEDBACK_URL = `${REPO_URL}/issues/new?template=roadmap-feedback.md`;

interface FooterLink {
  key: string;
  href: string;
  label: Localised;
  /** `app` links switch the page in place, so they need JavaScript. */
  kind: 'external' | 'page' | 'app';
}

/**
 * Footer: feedback route, links to the accessibility statement and privacy
 * note, the licence and a link back to the GitHub repository. On a roadmap
 * page (`dataSlug`) it also links to that roadmap's published JSON and to the
 * other layout (cards or list).
 */
export function SiteFooter({
  dataSlug,
  view,
}: {
  dataSlug?: string;
  view: View;
}) {
  const { lang, tr } = useLanguage();
  const hasJs = useHasJs();
  const toList = view !== 'list';
  const links: FooterLink[] = [
    {
      key: 'feedback',
      href: FEEDBACK_URL,
      label: UI.giveFeedback,
      kind: 'external',
    },
    {
      key: 'accessibility',
      href: '#accessibility',
      label: UI.accessibilityHeading,
      kind: 'page',
    },
    {
      key: 'privacy',
      href: '#privacy',
      label: UI.privacyHeading,
      kind: 'page',
    },
    ...(dataSlug
      ? [
          {
            key: 'data',
            href: dataPathFor(dataSlug),
            label: UI.roadmapData,
            kind: 'page' as const,
          },
          ...(hasJs
            ? [
                {
                  key: 'layout',
                  href: `${pathFor(lang, dataSlug)}${toList ? '?view=list' : ''}`,
                  label: toList ? UI.listViewLink : UI.cardViewLink,
                  kind: 'app' as const,
                },
              ]
            : []),
        ]
      : []),
    {
      key: 'licence',
      href: `${REPO_URL}/blob/main/LICENSE`,
      label: UI.licence,
      kind: 'external',
    },
    { key: 'github', href: REPO_URL, label: UI.onGitHub, kind: 'external' },
  ];

  return (
    <footer className="bg-nhs-wales-blue px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-content">
        <img
          src={logoImage}
          alt={tr(UI.organisation)}
          className="h-12 w-auto object-contain"
        />
        <nav aria-label={tr(UI.footerNav)} className="mt-6">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {links.map((link) => (
              <li key={link.key}>
                <a
                  href={link.href}
                  onClick={
                    link.kind === 'app'
                      ? onNavigate(link.href, { scroll: false })
                      : undefined
                  }
                  className="text-sm underline underline-offset-4 hover:no-underline"
                  {...(link.kind === 'external'
                    ? { target: '_blank', rel: 'noreferrer' }
                    : {})}
                >
                  <T value={link.label} />
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <p className="mt-6 text-sm text-white/80">
          <T value={UI.organisationFooter} />
        </p>
      </div>
    </footer>
  );
}
