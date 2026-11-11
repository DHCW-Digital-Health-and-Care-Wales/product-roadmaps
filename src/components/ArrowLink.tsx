import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { onNavigate } from '../lib/router';

/**
 * A link onward to another page in the site, ending with a right arrow.
 * `clientSide` opens it without a reload; turn it off where the page should
 * load in full.
 */
export function ArrowLink({
  href,
  clientSide = true,
  className = '',
  children,
}: {
  href: string;
  clientSide?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      onClick={clientSide ? onNavigate(href) : undefined}
      className={`inline-flex items-center gap-2 font-medium text-action underline underline-offset-4 hover:no-underline ${className}`}
    >
      {children}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </a>
  );
}
