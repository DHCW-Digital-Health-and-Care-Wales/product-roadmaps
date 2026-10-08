import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';
import { UI } from '../lib/strings';
import { T } from './T';

/**
 * Back-to-top button (from the Figma design). Appears after scrolling and
 * returns focus management to the top of the page. Honours reduced-motion via
 * the global stylesheet.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(() => window.scrollY > 300);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <a
      href="#top"
      className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-heading px-4 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-action"
    >
      <ChevronUp className="h-5 w-5" aria-hidden="true" />
      <T value={UI.backToTop} />
    </a>
  );
}
