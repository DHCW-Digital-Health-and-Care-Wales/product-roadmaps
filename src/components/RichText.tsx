import { useResolved } from '../lib/i18n';
import { parseTextBlocks } from '../lib/text';
import type { Localised } from '../lib/types';

/**
 * Sheet text as paragraphs and bullet lists (see `parseTextBlocks`), marking
 * English fallbacks with `lang="en"` like `<T>`.
 */
export function RichText({
  value,
  className = '',
}: {
  value: Localised;
  className?: string;
}) {
  const { text, lang } = useResolved(value);
  return (
    <div lang={lang} className={`space-y-2 ${className}`}>
      {parseTextBlocks(text).map((block, i) =>
        block.type === 'list' ? (
          // eslint-disable-next-line @eslint-react/no-array-index-key -- static text that never reorders, and items can repeat
          <ul key={i} className="list-disc space-y-0.5 pl-5">
            {block.items.map((item, j) => (
              // eslint-disable-next-line @eslint-react/no-array-index-key -- as above
              <li key={j}>{item}</li>
            ))}
          </ul>
        ) : (
          // eslint-disable-next-line @eslint-react/no-array-index-key -- as above
          <p key={i}>{block.text}</p>
        ),
      )}
    </div>
  );
}
