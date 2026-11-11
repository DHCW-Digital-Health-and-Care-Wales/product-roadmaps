/**
 * Keeping people's place while the organisation filter changes the page:
 * holding a card still on screen, and moving focus somewhere sensible when the
 * control they used goes away.
 */
import { flushSync } from 'react-dom';

/** The organisation filter's disclosure (OrgFilter) and its dropdown. */
export const ORG_FILTER_ID = 'org-filter';
export const ORG_SELECT_ID = 'org-filter-organisation';

// Cards marked `data-filter-card` can be held still while the filter changes,
// and their `data-filter-focus` element takes focus when the control used goes.

/**
 * Runs `update` and renders it straight away, then scrolls so `element` is
 * where it was on screen, as content above it comes or goes. Instant, because
 * the page otherwise scrolls smoothly (index.css).
 */
export function keepInPlace(element: Element | undefined, update: () => void) {
  const before = element?.getBoundingClientRect().top;
  // Synchronously, as the new layout must exist to measure it.
  flushSync(update);
  if (!element?.isConnected || before === undefined) return;
  const moved = element.getBoundingClientRect().top - before;
  if (moved !== 0) window.scrollBy({ top: moved, behavior: 'instant' });
}

/** The first card whose top is on screen below the header, if it's showing. */
export function firstCardOnScreen(): Element | undefined {
  const top = document.querySelector('header')?.getBoundingClientRect().bottom;
  return Array.from(document.querySelectorAll('[data-filter-card]')).find(
    (card) => {
      const y = card.getBoundingClientRect().top;
      return y >= (top ?? 0) && y < window.innerHeight;
    },
  );
}

/** Focuses a card's focus target without scrolling the page. */
export function focusCard(card: Element | undefined): boolean {
  const target = card?.querySelector<HTMLElement>('[data-filter-focus]');
  target?.focus({ preventScroll: true });
  return Boolean(target);
}

/** Opens the filter's disclosure and focuses its dropdown. */
export function openOrgFilter({ scroll = false } = {}) {
  const details = document.getElementById(ORG_FILTER_ID);
  if (!(details instanceof HTMLDetailsElement)) return;
  details.open = true;
  if (scroll) details.scrollIntoView();
  document.getElementById(ORG_SELECT_ID)?.focus({ preventScroll: scroll });
}
