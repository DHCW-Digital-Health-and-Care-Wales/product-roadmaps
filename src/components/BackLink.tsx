import type { ReactNode } from 'react';
import { onNavigate } from '../lib/router';

/**
 * A link back to a page within the site, led by a left chevron as in the DHCW
 * design system's back link. The chevron is that design's filled shape rather
 * than lucide's stroked ChevronLeft. It is decorative, so the link's name is
 * just its text.
 */
export function BackLink({
  href,
  className = '',
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      onClick={onNavigate(href)}
      className={`inline-flex items-center gap-2 text-sm font-medium text-action underline underline-offset-4 hover:no-underline ${className}`}
    >
      <svg
        viewBox="0 0 7 12"
        aria-hidden="true"
        focusable="false"
        className="h-3 w-[7px] shrink-0 fill-current"
      >
        <path d="M0 6c0-.3.1-.5.3-.7l5-5a1 1 0 0 1 1.4 1.4L2.4 6l4.3 4.3a1 1 0 0 1-1.4 1.4l-5-5A1 1 0 0 1 0 6Z" />
      </svg>
      {children}
    </a>
  );
}
