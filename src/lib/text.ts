/**
 * Text helpers shared by the app and the sheet sync in scripts/, so this file
 * must not import anything.
 */

/**
 * Lower-cases and removes accents, so Welsh letters such as ŵ and ŷ keep their
 * base letter.
 */
export const fold = (value: string) =>
  value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase();

/** Compares strings by code point, the same on the server and in browsers. */
export const compareText = (a: string, b: string) =>
  Number(a > b) - Number(a < b);

export type TextBlock =
  { type: 'paragraph'; text: string } | { type: 'list'; items: string[] };

const BULLET = /^[-•*]\s+/;

/**
 * Splits sheet text into paragraphs and bullet lists. Lines starting with
 * "- ", "• " or "* " are list items, with a trailing "," ";" or ", and"
 * removed; consecutive ones form one list. Every other non-blank line is its
 * own paragraph, so line breaks from the sheet are kept.
 */
export function parseTextBlocks(text: string): TextBlock[] {
  const blocks: TextBlock[] = [];
  let list: string[] = [];
  const flushList = () => {
    if (list.length) blocks.push({ type: 'list', items: list });
    list = [];
  };
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (BULLET.test(line)) {
      list.push(
        line
          .replace(BULLET, '')
          .replace(/(,\s*and|[,;])\s*$/, '')
          .trimEnd(),
      );
    } else {
      flushList();
      if (line) blocks.push({ type: 'paragraph', text: line });
    }
  }
  flushList();
  return blocks;
}
