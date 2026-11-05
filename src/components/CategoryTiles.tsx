import {
  CATEGORY_NAV_ID,
  categorySectionId,
  roadmapCount,
  type CategoryGroup,
} from '../lib/roadmap-helpers';
import { UI } from '../lib/strings';
import { CategoryIcon } from './CategoryIcon';
import { T } from './T';

/**
 * Jump links to each category's section, with its roadmap count. "Other
 * roadmaps" never has a link; nothing is shown if there are no links.
 */
export function CategoryTiles({ groups }: { groups: CategoryGroup[] }) {
  const tiles = groups.filter((group) => !group.isOther);
  if (tiles.length === 0) return null;

  return (
    <nav
      id={CATEGORY_NAV_ID}
      aria-labelledby={`${CATEGORY_NAV_ID}-heading`}
      className="mt-8"
    >
      <h2 id={`${CATEGORY_NAV_ID}-heading`} className="sr-only">
        <T value={UI.browseCategories} />
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map(({ category, roadmaps }) => (
          <li key={category.id}>
            <a
              href={`#${categorySectionId(category)}`}
              className="group flex h-full gap-3.5 rounded-card border border-border bg-surface px-5 py-4 text-ink-900 no-underline transition-shadow hover:border-border-strong hover:shadow-md"
            >
              <CategoryIcon category={category} size="small" />
              <span>
                <span className="block text-lg font-bold text-heading group-hover:underline">
                  <T value={category.label} />
                </span>
                <span className="mt-0.5 block text-sm text-ink-700">
                  <T value={category.description} />
                </span>
                <span className="mt-1.5 block text-sm text-ink-700">
                  <T value={roadmapCount(roadmaps.length)} />
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
