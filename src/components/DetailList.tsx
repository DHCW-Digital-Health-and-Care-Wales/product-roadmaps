import type { ReactNode } from 'react';
import type { DetailLine } from '../lib/types';
import { T } from './T';

/** Builds nested lists from `level`, so "- " lines sit under the line above. */
export function DetailList({
  items,
  className = '',
}: {
  items: DetailLine[];
  className?: string;
}) {
  const build = (start: number, level: number): [ReactNode[], number] => {
    const nodes: ReactNode[] = [];
    let i = start;
    while (i < items.length && items[i].level >= level) {
      const index = i;
      let children: ReactNode = null;
      i++;
      if (i < items.length && items[i].level > level) {
        const [nested, next] = build(i, items[i].level);
        children = <ul className="mt-1 list-disc space-y-1 pl-5">{nested}</ul>;
        i = next;
      }
      nodes.push(
        <li key={index}>
          <T value={items[index].text} />
          {children}
        </li>,
      );
    }
    return [nodes, i];
  };

  return (
    <ul className={`list-disc space-y-1 pl-5 text-ink-900 ${className}`}>
      {build(0, 0)[0]}
    </ul>
  );
}
