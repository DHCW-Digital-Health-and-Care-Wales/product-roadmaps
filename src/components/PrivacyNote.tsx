import { UI } from '../lib/strings';
import { T } from './T';

/**
 * Privacy note. The site sets no cookies, counts visits with cookie-free
 * Simple Analytics and self-hosts its fonts, so there is nothing for visitors
 * to consent to.
 */
export function PrivacyNote() {
  const headingId = 'privacy-heading';

  return (
    <section
      id="privacy"
      aria-labelledby={headingId}
      className="scroll-mt-28 border-t border-border px-4 py-12 sm:px-6"
    >
      <div className="mx-auto max-w-content">
        <h2 id={headingId} className="text-2xl font-bold text-heading">
          <T value={UI.privacyHeading} />
        </h2>
        <div className="mt-4 max-w-3xl space-y-4 leading-relaxed text-ink-900">
          <p>
            <T value={UI.privacyTracking} />
          </p>
          <p>
            <T value={UI.privacyFonts} />
          </p>
        </div>
      </div>
    </section>
  );
}
