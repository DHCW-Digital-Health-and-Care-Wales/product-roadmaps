import { useEffect, useState, type MouseEvent } from 'react';
import { ChevronUp } from 'lucide-react';
import { UI } from '../lib/strings';
import { T } from './T';

/**
 * Back-to-top button (from the Figma design). Appears after scrolling and
 * scrolls back to the top of the page. Honours reduced-motion via
 * the global stylesheet. On short screens (such as 400% zoom) it shrinks to
 * just the icon, keeping its text for screen readers.
 */
export function BackToTop() {
  // Starts hidden so the prerendered HTML matches; shows on the first scroll.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // iOS Safari doesn't reliably scroll to the empty, zero-size #top anchor (and
  // does nothing if the hash is already #top), so scroll explicitly. The href
  // stays as the fallback without JavaScript.
  const scrollToTop = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    // Preventing the default also skips the browser's focus-start update, so do it.
    document.getElementById('top')?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, left: 0 });
  };

  if (!visible) {
    return null;
  }

  return (
    <a
      href="#top"
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-heading px-4 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-action short:bottom-2 short:right-2 short:p-2"
    >
      <ChevronUp className="h-5 w-5" aria-hidden="true" />
      <span className="short:sr-only">
        <T value={UI.backToTop} />
      </span>
    </a>
  );
}
