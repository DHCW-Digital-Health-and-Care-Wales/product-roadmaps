import type { ReactNode } from 'react';
import type { RoadmapMeta } from '../lib/types';
import { T } from './T';

/**
 * A roadmap's family name beside a swatch in the roadmap's colour, shared by
 * the landing page card and the roadmap page so the two always match.
 * `children` go straight after the name, inside the same text span.
 */
export function FamilyLabel({
  meta,
  as: Tag = 'p',
  className = '',
  children,
}: {
  meta: Pick<RoadmapMeta, 'family' | 'colour'>;
  as?: 'p' | 'span';
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Tag
      className={`flex items-center gap-2 text-sm font-medium text-ink-700 ${className}`}
    >
      <span
        aria-hidden="true"
        className="h-3 w-3 shrink-0 rounded-xs border border-black/10"
        style={{ backgroundColor: meta.colour }}
      />
      <span>
        <T value={meta.family} />
        {children}
      </span>
    </Tag>
  );
}
