import { UI } from '../lib/strings';
import { T } from './T';

/**
 * Accessibility statement. UK public sector sites need one. States the target
 * standard and known gaps.
 */
export function AccessibilityStatement() {
  const headingId = 'accessibility-heading';

  return (
    <section
      id="accessibility"
      aria-labelledby={headingId}
      className="scroll-mt-28 border-t border-border bg-surface-subtle px-4 py-12 sm:px-6"
    >
      <div className="mx-auto max-w-content">
        <h2 id={headingId} className="text-2xl font-bold text-heading">
          <T value={UI.accessibilityHeading} />
        </h2>
        <div className="mt-4 max-w-3xl space-y-4 leading-relaxed text-ink-900">
          <p>
            <T value={UI.accessibilityTarget} />
          </p>
          <p>
            <T value={UI.accessibilityBeta} />
          </p>
        </div>
      </div>
    </section>
  );
}
