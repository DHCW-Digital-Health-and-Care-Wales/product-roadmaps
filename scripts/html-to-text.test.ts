import { describe, expect, it } from 'vitest';
import { htmlToText } from './html-to-text.ts';

describe('htmlToText', () => {
  it('returns plain text unchanged', () => {
    expect(htmlToText('Just text')).toBe('Just text');
  });

  it('removes tags and their inline styles', () => {
    expect(
      htmlToText(
        '<div><span style="color:rgb(1, 2, 3);">Hello</span> <b>world</b></div>',
      ),
    ).toBe('Hello world');
  });

  it('starts a new line at each block end and <br>', () => {
    expect(htmlToText('<div>One</div><div>Two<br>Three</div><p>Four</p>')).toBe(
      'One\nTwo\nThree\nFour',
    );
  });

  it('keeps one blank line between paragraphs but no more', () => {
    expect(
      htmlToText('<p>One</p><div><br></div><div><br></div><p>Two</p>'),
    ).toBe('One\n\nTwo');
  });

  it('turns list items into dashes', () => {
    expect(htmlToText('Steps:<ol><li>First</li><li>Second</li></ol>')).toBe(
      'Steps:\n- First\n- Second',
    );
  });

  it('keeps cells in a table row on one line', () => {
    expect(
      htmlToText(
        '<table><tr><td>A</td><td>B</td></tr><tr><td>C</td></tr></table>',
      ),
    ).toBe('A B\nC');
  });

  it('decodes named and numeric entities', () => {
    expect(
      htmlToText(
        'a&nbsp;&amp;&nbsp;b &lt;c&gt; &quot;d&quot; &#39;e&#39; &#x2019;',
      ),
    ).toBe('a & b <c> "d" \'e\' \u2019');
  });

  it('does not read decoded entities as tags', () => {
    expect(htmlToText('&lt;div&gt;kept&lt;/div&gt;')).toBe('<div>kept</div>');
  });

  it('leaves unknown or invalid entities and bare "<" alone', () => {
    expect(htmlToText('&bogus; &#99999999; 1 < 2 and 3 > 2')).toBe(
      '&bogus; &#99999999; 1 < 2 and 3 > 2',
    );
  });

  it('drops images, comments and links but keeps link text', () => {
    expect(
      htmlToText(
        'A<img src="x.png" alt="Image"><!-- note -->B<a href="y">C</a>',
      ),
    ).toBe('ABC');
  });

  it('collapses spaces, tabs and non-breaking spaces', () => {
    expect(htmlToText('  a \t b&nbsp;&nbsp;c  ')).toBe('a b c');
  });

  it('returns an empty string for markup with no text', () => {
    expect(htmlToText('<div><br></div><p>&nbsp;</p>')).toBe('');
  });
});
