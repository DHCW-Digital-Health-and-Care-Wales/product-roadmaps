import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import logoImage from '../assets/dhcw-logo.png';
import { useLanguage } from '../lib/i18n';
import type { Localised } from '../lib/types';
import { onNavigate, productHref } from '../lib/router';
import { UI } from '../lib/strings';
import { LanguageToggle } from './LanguageToggle';
import { T } from './T';

const NAV_LINKS: { href: string; label: Localised }[] = [
  { href: '#about', label: UI.navAbout },
  { href: '#roadmap', label: UI.navRoadmap },
];

/**
 * Fixed brand header: NHS Wales Blue bar with the DHCW logo (linking to all
 * roadmaps), in-page navigation on product pages and the language toggle.
 * Collapses to a menu button on narrow screens.
 */
export function SiteHeader({
  showSectionLinks = false,
}: {
  showSectionLinks?: boolean;
}) {
  const { tr } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navLinks = showSectionLinks ? NAV_LINKS : [];

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-nhs-wales-blue text-white shadow-md">
      <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a
          href={productHref(null)}
          onClick={onNavigate(null)}
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
            <nav aria-label={tr(UI.sectionsNav)} className="hidden md:block">
              <ul className="flex items-center gap-2">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="rounded px-3 py-2 text-sm font-medium transition-colors hover:bg-white hover:text-nhs-wales-blue"
                    >
                      <T value={link.label} />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          <LanguageToggle />

          {navLinks.length > 0 ? (
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
              className="rounded p-2 transition-colors hover:bg-white/15 md:hidden"
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

      {mobileMenuOpen && navLinks.length > 0 && (
        <nav
          id="mobile-nav"
          aria-label={tr(UI.sectionsNav)}
          className="border-t border-white/20 px-4 pb-4 md:hidden"
        >
          <ul className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded px-3 py-2 font-medium transition-colors hover:bg-white hover:text-nhs-wales-blue"
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
