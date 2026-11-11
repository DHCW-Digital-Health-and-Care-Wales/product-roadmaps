import type { InfoPageId } from './router';
import { UI } from './strings';
import type { Localised } from './types';

/**
 * Accessibility statement (UK public sector sites need one) and privacy note
 * (no cookies, cookie-free Simple Analytics, self-hosted fonts, so nothing to
 * consent to), each on its own page.
 */
export const INFO_PAGES: Record<
  InfoPageId,
  { heading: Localised; paragraphs: Localised[] }
> = {
  accessibility: {
    heading: UI.accessibilityHeading,
    paragraphs: [UI.accessibilityTarget],
  },
  privacy: {
    heading: UI.privacyHeading,
    paragraphs: [UI.privacyTracking, UI.privacyFonts],
  },
};
