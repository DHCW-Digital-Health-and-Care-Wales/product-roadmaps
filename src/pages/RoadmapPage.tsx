import type { Roadmap } from '../lib/types';
import { SECTIONS } from '../lib/content';
import { RoadmapIntro } from '../components/RoadmapIntro';
import { VisionStatement } from '../components/VisionStatement';
import { HorizonExplainer } from '../components/HorizonExplainer';
import { DeliveredSection } from '../components/DeliveredSection';
import { HorizonsSection } from '../components/HorizonsSection';

/** A single product roadmap, built from one tab of the Google Sheet. */
export function RoadmapPage({ roadmap }: { roadmap: Roadmap }) {
  const sections = (placement: 'before' | 'after') =>
    SECTIONS.filter((section) => section.placement === placement).map(
      (section) => (
        <DeliveredSection
          key={section.id}
          section={section}
          items={roadmap.items[section.id]}
        />
      ),
    );

  return (
    <>
      <RoadmapIntro meta={roadmap.meta} />
      <VisionStatement meta={roadmap.meta} />
      <HorizonExplainer />

      {sections('before')}

      <div id="roadmap" className="scroll-mt-28 bg-surface px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-content">
          <HorizonsSection roadmap={roadmap} />
        </div>
      </div>

      {sections('after')}
    </>
  );
}
