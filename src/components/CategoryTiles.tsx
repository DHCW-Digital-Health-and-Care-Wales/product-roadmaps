import {
  categorySectionId,
  roadmapCount,
  type CategoryTile,
} from '../lib/roadmap-helpers';
import { UI } from '../lib/strings';
import { CategoryIcon } from './CategoryIcon';
import { T } from './T';

const NAV_ID = 'categories';

/**
 * Jump links to each category's section, with the number of matches. A
 * category with no matches has no section, so its tile is not a link.
 * Nothing is shown if there are no tiles.
 */
export function CategoryTiles({ tiles }: { tiles: CategoryTile[] }) {
  if (tiles.length === 0) return null;

  return (
    <nav id={NAV_ID} aria-labelledby={`${NAV_ID}-heading`} className="mt-8">
      <h2 id={`${NAV_ID}-heading`} className="sr-only">
        <T value={UI.browseCategories} />
      </h2>
      <ul className="card-gap grid sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map(({ category, count }) => {
          const content = (
            <>
              <CategoryIcon category={category} size="small" />
              <span>
                <span
                  className={`block text-lg font-bold text-heading ${count ? 'group-hover:underline' : ''}`}
                >
                  <T value={category.label} />
                </span>
                <span className="mt-0.5 block text-sm text-ink-700">
                  <T value={category.description} />
                </span>
                <span className="mt-1.5 block text-sm text-ink-700">
                  <T value={roadmapCount(count)} />
                </span>
              </span>
            </>
          );
          const tileClass =
            'flex h-full gap-3.5 rounded-card border border-border bg-surface px-5 py-4 text-ink-900 no-underline';
          return (
            <li key={category.id}>
              {count ? (
                <a
                  href={`#${categorySectionId(category)}`}
                  className={`group ${tileClass} transition-shadow hover:border-border-strong hover:shadow-md`}
                >
                  {content}
                </a>
              ) : (
                <div className={`${tileClass} bg-surface-subtle`}>
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
