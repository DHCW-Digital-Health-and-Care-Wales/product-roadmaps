import { describe, expect, it } from 'vitest';
import { formatCsv, parseCsv } from './csv.ts';

describe('parseCsv', () => {
  it('splits rows and fields', () => {
    expect(parseCsv('a,b\nc,d\n')).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
  });

  it('keeps the last row without a trailing newline', () => {
    expect(parseCsv('a,b\nc,d')).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
  });

  it('handles CRLF line endings', () => {
    expect(parseCsv('a,b\r\nc,d\r\n')).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
  });

  it('keeps commas, newlines and escaped quotes inside quoted fields', () => {
    expect(parseCsv('"x, y","line 1\nline 2","say ""hi"""\n')).toEqual([
      ['x, y', 'line 1\nline 2', 'say "hi"'],
    ]);
  });

  it('keeps empty fields', () => {
    expect(parseCsv(',a,,\n')).toEqual([['', 'a', '', '']]);
  });

  it('returns no rows for empty input', () => {
    expect(parseCsv('')).toEqual([]);
  });
});

describe('formatCsv', () => {
  it('writes plain fields unquoted', () => {
    expect(formatCsv([['a', 'b', ''], ['c']])).toBe('a,b,\nc\n');
  });

  it('quotes commas, newlines and quotes', () => {
    expect(formatCsv([['x, y', 'line 1\nline 2', 'say "hi"']])).toBe(
      '"x, y","line 1\nline 2","say ""hi"""\n',
    );
  });

  it('round-trips through parseCsv', () => {
    const rows = [
      ['a, b', 'c\r\nd', '"quoted"', ''],
      ['', '', '', 'é ŵ'],
    ];
    expect(parseCsv(formatCsv(rows))).toEqual(rows);
  });

  it('writes nothing for no rows', () => {
    expect(formatCsv([])).toBe('');
  });
});
