import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import logoImage from '../assets/dhcw-logo.png';
import { useLanguage } from '../lib/i18n';
import type { Localised, OrgFilter } from '../lib/types';
import { onNavigate, pathFor, withOrgFilter } from '../lib/router';
import { UI } from '../lib/strings';
import { FilterChip, FilterStrip } from './HeaderFilter';
import { LanguageToggle } from './LanguageToggle';
import { T } from './T';

const NAV_LINKS: { href: string; label: Localised }[] = [
  { href: '#about', label: UI.navAbout },
  { href: '#roadmap', label: UI.navRoadmap },
];

/**
 * Fixed brand header: NHS Wales Blue bar with the DHCW logo (linking to all
 * roadmaps), in-page navigation on product pages, the organisation filter
 * while one is set, and the language toggle. Below `lg` the section links
 * move into a menu button, so the filter chip and language toggle fit on one
 * line; below `sm` the filter goes on a line of its own.
 */
export function SiteHeader({
  filter,
  showSectionLinks = false,
}: {
  filter: OrgFilter;
  showSectionLinks?: boolean;
}) {
  const { lang, tr } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navLinks = showSectionLinks ? NAV_LINKS : [];
  const home = withOrgFilter(pathFor(lang, null), filter);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-nhs-wales-blue text-white shadow-md">
      <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a
          href={home}
          onClick={onNavigate(home)}
          className="flex items-center"
          aria-label={tr(UI.homeLink)}
        >
          <img
            src={logoImage}
            alt={tr(UI.organisation)}
            className="h-12 w-auto object-contain sm:h-16"
          />
        </a>

        <div className="flex items-center gap-3">
          {navLinks.length > 0 ? (
            <nav aria-label={tr(UI.sectionsNav)} className="hidden lg:block">
              <ul className="flex items-center gap-2">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="rounded-sm px-3 py-2 text-sm font-medium transition-colors hover:bg-white hover:text-nhs-wales-blue"
                    >
                      <T value={link.label} />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          {filter.org ? <FilterChip org={filter.org} /> : null}
          <LanguageToggle />

          {navLinks.length > 0 ? (
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
              className="rounded-sm p-2 transition-colors hover:bg-white/15 lg:hidden"
            >
              <span className="sr-only">
                {tr(mobileMenuOpen ? UI.closeMenu : UI.openMenu)}
              </span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          ) : null}
        </div>
      </div>

      {filter.org ? <FilterStrip org={filter.org} /> : null}

      {mobileMenuOpen && navLinks.length > 0 && (
        <nav
          id="mobile-nav"
          aria-label={tr(UI.sectionsNav)}
          className="border-t border-white/20 px-4 pb-4 lg:hidden"
        >
          <ul className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-sm px-3 py-2 font-medium transition-colors hover:bg-white hover:text-nhs-wales-blue"
                >
                  <T value={link.label} />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
