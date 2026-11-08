import type { OrganisationId, Roadmap, OrgFilter } from '../lib/types';
import { SECTIONS } from '../lib/content';
import { emptyText, filterItems } from '../lib/roadmap-helpers';
import type { View } from '../lib/router';
import { RoadmapIntro } from '../components/RoadmapIntro';
import { OrgFilterDisclosure } from '../components/OrgFilterDisclosure';
import {
  FilterAnnouncer,
  FilterBanner,
} from '../components/RoadmapFilterStatus';
import { VisionAndValue } from '../components/VisionAndValue';
import { HorizonExplainer } from '../components/HorizonExplainer';
import { RoadmapSection } from '../components/RoadmapSection';
import { RoadmapHorizons } from '../components/RoadmapHorizons';
import { RoadmapList } from '../components/RoadmapList';

/**
 * A single product roadmap, built from one tab of the Google Sheet, showing
 * only the items that match the organisation filter.
 */
export function RoadmapPage({
  roadmap,
  view,
  filter,
  organisations,
}: {
  roadmap: Roadmap;
  view: View;
  filter: OrgFilter;
  /** The organisations the filter offers. */
  organisations: readonly OrganisationId[];
}) {
  const sections = (placement: 'before' | 'after') =>
    SECTIONS.filter((section) => section.placement === placement).map(
      (section) => (
        <RoadmapSection
          key={section.id}
          section={section}
          items={filterItems(roadmap.items[section.id], filter)}
          total={roadmap.items[section.id].length}
          empty={emptyText(filter)}
        />
      ),
    );

  return (
    <>
      <FilterAnnouncer roadmap={roadmap} filter={filter} />
      <RoadmapIntro
        meta={roadmap.meta}
        filter={filter}
        controls={
          <OrgFilterDisclosure
            filter={filter}
            organisations={organisations}
            className="min-w-0 max-w-full"
          />
        }
      >
        <FilterBanner roadmap={roadmap} filter={filter} />
      </RoadmapIntro>
      <VisionAndValue meta={roadmap.meta} />
      <HorizonExplainer view={view} />

      {view === 'list' ? (
        <RoadmapList key={roadmap.slug} roadmap={roadmap} filter={filter} />
      ) : (
        <>
          {sections('before')}

          <div
            id="roadmap"
            className="scroll-mt-28 bg-surface px-4 py-8 sm:px-6"
          >
            <div className="mx-auto max-w-content">
              <RoadmapHorizons roadmap={roadmap} filter={filter} />
            </div>
          </div>

          {sections('after')}
        </>
      )}
    </>
  );
}
