import type { Category } from '../lib/content';

const SIZES = {
  small: { circle: 'h-10 w-10', icon: 'h-5 w-5' },
  large: { circle: 'h-12 w-12', icon: 'h-6 w-6' },
};

/** A category's icon, white on its colour. Decorative. */
export function CategoryIcon({
  category,
  size,
}: {
  category: Category;
  size: keyof typeof SIZES;
}) {
  const { icon: Icon, colour } = category;
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full text-white ${SIZES[size].circle}`}
      style={{ backgroundColor: colour }}
    >
      <Icon className={SIZES[size].icon} />
    </span>
  );
}
