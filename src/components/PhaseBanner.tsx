import { UI } from '../lib/strings';
import { T } from './T';

/** GOV.UK-style phase banner: the beta tag with a line about the service. */
export function PhaseBanner() {
  return (
    <p className="flex items-center gap-3 border-b border-border pb-3 text-ink-900">
      <strong className="inline-flex shrink-0 items-center rounded-full bg-heading px-3 py-1 text-sm font-medium text-white">
        <T value={UI.phaseBadge} />
      </strong>
      <span>
        <T value={UI.phaseBannerText} />
      </span>
    </p>
  );
}
