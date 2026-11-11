import { categorySectionId, type CategoryGroup } from '../lib/roadmap-helpers';
import type { OrgFilter } from '../lib/types';
import { CategoryIcon } from './CategoryIcon';
import { ProductCard } from './ProductCard';
import { T } from './T';

/** One category's heading and roadmap cards. */
export function CategorySection({
  group: { category, roadmaps },
  filter,
}: {
  group: CategoryGroup;
  filter: OrgFilter;
}) {
  const id = categorySectionId(category);
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      // The margin keeps the gap above the heading when a tile jumps here.
      className="scroll-mt-(--block-gap)"
    >
      <div className="flex items-center gap-3.5">
        <CategoryIcon category={category} size="large" />
        <div>
          <h2 id={`${id}-heading`} className="text-2xl font-bold text-heading">
            <T value={category.label} />
          </h2>
          <p className="mt-0.5 text-ink-700">
            <T value={category.description} />
          </p>
        </div>
      </div>
      <ul className="mt-6 card-gap grid sm:grid-cols-2 lg:grid-cols-3">
        {roadmaps.map((roadmap) => (
          <ProductCard key={roadmap.slug} roadmap={roadmap} filter={filter} />
        ))}
      </ul>
    </section>
  );
}
