import { describe, expect, it } from 'vitest';
import { compareText, fold, parseTextBlocks } from './text';

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

describe('parseTextBlocks', () => {
  it('returns nothing for empty text', () => {
    expect(parseTextBlocks('')).toEqual([]);
    expect(parseTextBlocks(' \n\n ')).toEqual([]);
  });

  it('makes each other line its own paragraph, skipping blank lines', () => {
    expect(parseTextBlocks('One\nTwo\n\n  Three  ')).toEqual([
      { type: 'paragraph', text: 'One' },
      { type: 'paragraph', text: 'Two' },
      { type: 'paragraph', text: 'Three' },
    ]);
  });

  it('turns "- ", "• " and "* " lines into one list', () => {
    expect(parseTextBlocks('Intro:\n- one\n• two\n * three')).toEqual([
      { type: 'paragraph', text: 'Intro:' },
      { type: 'list', items: ['one', 'two', 'three'] },
    ]);
  });

  it('removes a trailing comma, semicolon or ", and" from list items', () => {
    expect(
      parseTextBlocks('- apples,\n- pears ;\n- plums, and\n- figs.'),
    ).toEqual([{ type: 'list', items: ['apples', 'pears', 'plums', 'figs.'] }]);
  });

  it('keeps commas in paragraphs and dashes without a space', () => {
    expect(parseTextBlocks('First,\n-not a bullet')).toEqual([
      { type: 'paragraph', text: 'First,' },
      { type: 'paragraph', text: '-not a bullet' },
    ]);
  });

  it('ends a list at a blank line or a plain line', () => {
    expect(parseTextBlocks('- a\nAfter\n- b\n\n- c')).toEqual([
      { type: 'list', items: ['a'] },
      { type: 'paragraph', text: 'After' },
      { type: 'list', items: ['b'] },
      { type: 'list', items: ['c'] },
    ]);
  });
});
