import { categorySectionId, type CategoryGroup } from '../lib/roadmap-helpers';
import { CategoryIcon } from './CategoryIcon';
import { ProductCard } from './ProductCard';
import { T } from './T';

/** One category's heading and roadmap cards. */
export function CategorySection({
  group: { category, roadmaps },
}: {
  group: CategoryGroup;
}) {
  const id = categorySectionId(category);
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="pt-10 [section+&]:pt-16"
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
      <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {roadmaps.map((roadmap) => (
          <ProductCard key={roadmap.slug} roadmap={roadmap} />
        ))}
      </ul>
    </section>
  );
}
