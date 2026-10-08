import logoImage from '../assets/dhcw-logo.png';
import { useLanguage } from '../lib/i18n';
import { UI } from '../lib/strings';
import { T } from './T';

const REPO_URL =
  'https://github.com/DHCW-Digital-Health-and-Care-Wales/product-roadmaps';
const FEEDBACK_URL = `${REPO_URL}/issues/new?template=roadmap-feedback.md`;

/**
 * Footer: feedback route, links to the accessibility statement and privacy
 * note, the licence and a link back to the GitHub repository.
 */
export function SiteFooter() {
  const { tr } = useLanguage();

  const links = [
    { href: FEEDBACK_URL, label: UI.giveFeedback, external: true },
    { href: '#accessibility', label: UI.accessibilityHeading, external: false },
    { href: '#privacy', label: UI.privacyHeading, external: false },
    {
      href: `${REPO_URL}/blob/main/LICENSE`,
      label: UI.licence,
      external: true,
    },
    { href: REPO_URL, label: UI.onGitHub, external: true },
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
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm underline underline-offset-4 hover:no-underline"
                  {...(link.external
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
