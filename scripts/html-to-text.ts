/**
 * Turns the rich text pasted into backlog descriptions (Word/Outlook/DevOps
 * HTML with inline styles) into plain text with line breaks. The site shows
 * descriptions as text, so markup would otherwise appear literally.
 */

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: ' ',
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
};

// Closing these starts a new line; so does <br>.
const LINE_END_TAGS =
  /<br\b[^>]*>|<\/(?:p|div|h[1-6]|pre|ul|ol|tr|table|blockquote|label)>/gi;

// Requires a letter after "<" so text such as "a < b" is not read as a tag.
const ANY_TAG = /<\/?[a-z][^>]*>|<!--[\s\S]*?-->/gi;

function decodeEntity(match: string, name: string): string {
  const named = NAMED_ENTITIES[name.toLowerCase()];
  if (named !== undefined) return named;
  const isHex = /^#x/i.test(name);
  const code = name.startsWith('#')
    ? Number.parseInt(name.slice(isHex ? 2 : 1), isHex ? 16 : 10)
    : NaN;
  return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
}

export function htmlToText(html: string): string {
  return html
    .replace(LINE_END_TAGS, '\n')
    .replace(/<li\b[^>]*>/gi, '\n- ')
    .replace(/<\/t[dh]>/gi, ' ')
    .replace(ANY_TAG, '')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, decodeEntity)
    .replace(/\u00a0/g, ' ')
    .split(/\r?\n/)
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
