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
