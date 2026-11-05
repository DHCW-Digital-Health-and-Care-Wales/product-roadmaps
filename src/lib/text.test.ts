import { describe, expect, it } from 'vitest';
import { compareText, fold } from './text';

describe('fold', () => {
  it('lower-cases and removes accents', () => {
    expect(fold('Ŵyl Ŷd CAFÉ')).toBe('wyl yd cafe');
  });
});

describe('compareText', () => {
  it('orders by code point', () => {
    expect(['b', 'a', 'B', 'a'].sort(compareText)).toEqual([
      'B',
      'a',
      'a',
      'b',
    ]);
    expect(compareText('a', 'a')).toBe(0);
  });
});
