import type { Roadmap } from '../lib/types';
import { SECTIONS } from '../lib/content';
import { RoadmapIntro } from '../components/RoadmapIntro';
import { VisionAndValue } from '../components/VisionAndValue';
import { HorizonExplainer } from '../components/HorizonExplainer';
import { RoadmapSection } from '../components/RoadmapSection';
import { RoadmapHorizons } from '../components/RoadmapHorizons';

/** A single product roadmap, built from one tab of the Google Sheet. */
export function RoadmapPage({ roadmap }: { roadmap: Roadmap }) {
  const sections = (placement: 'before' | 'after') =>
    SECTIONS.filter((section) => section.placement === placement).map(
      (section) => (
        <RoadmapSection
          key={section.id}
          section={section}
          items={roadmap.items[section.id]}
        />
      ),
    );

  return (
    <>
      <RoadmapIntro meta={roadmap.meta} />
      <VisionAndValue meta={roadmap.meta} />
      <HorizonExplainer />

      {sections('before')}

      <div id="roadmap" className="scroll-mt-28 bg-surface px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-content">
          <RoadmapHorizons roadmap={roadmap} />
        </div>
      </div>

      {sections('after')}
    </>
  );
}
