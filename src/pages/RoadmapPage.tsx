import type { Roadmap } from '../lib/types';
import { useLanguage } from '../lib/i18n';
import { RoadmapIntro } from '../components/RoadmapIntro';
import { VisionStatement } from '../components/VisionStatement';
import { HorizonExplainer } from '../components/HorizonExplainer';
import { DeliveredSection } from '../components/DeliveredSection';
import { CategorySection } from '../components/CategorySection';

/** A single product roadmap, built from one tab of the Google Sheet. */
export function RoadmapPage({ roadmap }: { roadmap: Roadmap }) {
  const { lang } = useLanguage();

  return (
    <>
      <RoadmapIntro meta={roadmap.meta} />
      <VisionStatement meta={roadmap.meta} />
      <HorizonExplainer roadmap={roadmap} />

      {roadmap.sections
        .filter((section) => section.placement === 'before')
        .map((section) => (
          <DeliveredSection key={section.id} section={section} />
        ))}

      <div id="roadmap" className="scroll-mt-28 bg-surface px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-content">
          <h2 className="sr-only">
            {lang === 'cy'
              ? 'Y trywydd yn \u00f4l gorwel'
              : 'The roadmap by horizon'}
          </h2>
          {roadmap.categories.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              roadmap={roadmap}
            />
          ))}
        </div>
      </div>

      {roadmap.sections
        .filter((section) => section.placement === 'after')
        .map((section) => (
          <DeliveredSection key={section.id} section={section} />
        ))}
    </>
  );
}
