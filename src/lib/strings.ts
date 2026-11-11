/**
 * Interface text (headings, links, labels and accessible names) in one place
 * for translators. Roadmap content lives in the sheet; text shared by every
 * roadmap lives in src/lib/content.ts. Use `{name}` for values filled in with
 * `fill()` from src/lib/i18n.ts.
 */
import type { Localised } from './types';

export const UI = {
  siteTitle: { en: 'DHCW roadmaps', cy: 'Trywyddion IGDC' },
  skipLink: { en: 'Skip to content', cy: 'Neidio i’r prif gynnwys' },
  backToTop: { en: 'Back to top', cy: 'Nôl i’r brig' },
  organisation: {
    en: 'Digital Health and Care Wales',
    cy: 'Iechyd a Gofal Digidol Cymru',
  },
  organisationFooter: {
    en: 'Digital Health and Care Wales',
    cy: 'Digital Health and Care Wales / Iechyd a Gofal Digidol Cymru',
  },

  homeLink: {
    en: 'Digital Health and Care Wales roadmaps home',
    cy: 'Hafan trywyddion Iechyd a Gofal Digidol Cymru',
  },
  sectionsNav: { en: 'Roadmap sections', cy: 'Adrannau’r trywydd' },
  navAbout: { en: 'About this roadmap', cy: 'Am y trywydd hwn' },
  navRoadmap: { en: 'The roadmap', cy: 'Y trywydd' },
  openMenu: { en: 'Open menu', cy: 'Agor y ddewislen' },
  closeMenu: { en: 'Close menu', cy: 'Cau’r ddewislen' },

  footerNav: { en: 'Footer links', cy: 'Dolenni troedyn' },
  giveFeedback: { en: 'Give feedback', cy: 'Rhoi adborth' },
  roadmapData: { en: 'Roadmap data (JSON)', cy: 'Data’r trywydd (JSON)' },
  licence: { en: 'Licence', cy: 'Trwydded' },
  onGitHub: { en: 'This project on GitHub', cy: 'Y gwaith ar GitHub' },
  listViewLink: { en: 'List view', cy: 'Golwg rhestr' },
  cardViewLink: { en: 'Card view', cy: 'Golwg cardiau' },

  accessibilityHeading: {
    en: 'Accessibility statement',
    cy: 'Datganiad hygyrchedd',
  },
  accessibilityTarget: {
    en: 'We want as many people as possible to be able to use these roadmaps. We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA.',
    cy: 'Rydym am i gymaint o bobl â phosibl allu defnyddio’r trywyddion hyn. Rydym yn anelu at gydymffurfio â Chanllawiau Hygyrchedd Cynnwys Gwe (WCAG) 2.2 ar lefel AA.',
  },
  privacyHeading: { en: 'Privacy', cy: 'Preifatrwydd' },
  privacyTracking: {
    en: 'This site sets no cookies. We use Simple Analytics, a privacy-first service that does not use cookies or collect personal data, to count visits.',
    cy: 'Nid yw’r safle hwn yn gosod cwcis. Rydym yn defnyddio Simple Analytics, gwasanaeth sy’n rhoi blaenoriaeth i breifatrwydd ac nad yw’n defnyddio cwcis nac yn casglu data personol, i gyfrif ymweliadau.',
  },
  privacyFonts: {
    en: 'Fonts are self-hosted, so your visit is not shared with an external font service.',
    cy: 'Mae’r ffontiau’n cael eu gwesteia gennym ni ein hunain, felly nid yw eich ymweliad yn cael ei rannu â gwasanaeth ffont allanol.',
  },

  phaseBadge: { en: 'Beta', cy: 'Beta' },
  phaseBannerText: {
    en: 'This is a new service. We’re still working on ways to improve it.',
    cy: 'Mae hwn yn wasanaeth newydd. Rydym yn dal i weithio ar ffyrdd o’i wella.',
  },
  landingTitle: { en: 'Product roadmaps', cy: 'Trywyddion cynnyrch' },
  // Also the landing page's meta description, so keep it short.
  landingIntro: {
    en: 'These roadmaps show what we’re working on, what we currently expect to do next and where we think we’re heading. They are not fixed plans and will change as we learn.',
    cy: 'Mae’r trywyddion hyn yn dangos yr hyn rydym yn gweithio arno, yr hyn rydym yn disgwyl ei wneud nesaf ar hyn o bryd a ble rydym yn meddwl ein bod yn anelu. Nid cynlluniau sefydlog yw’r rhain a byddant yn newid wrth i ni ddysgu.',
  },
  aboutRoadmapsHeading: {
    en: 'About these roadmaps',
    cy: 'Am y trywyddion hyn',
  },
  aboutRoadmapsOpen: {
    en: 'We believe being open about our plans is better than waiting until everything is perfect. These roadmaps will evolve as we learn, priorities change and we hear from the people who use and depend on our services.',
    cy: 'Rydym yn credu bod bod yn agored am ein cynlluniau yn well nag aros nes bod popeth yn berffaith. Bydd y trywyddion hyn yn esblygu wrth i ni ddysgu, wrth i flaenoriaethau newid ac wrth i ni glywed gan y bobl sy’n defnyddio ac yn dibynnu ar ein gwasanaethau.',
  },
  aboutRoadmapsBeta: {
    en: 'The roadmaps are also in beta. We are continuing to refine and develop their content so they give our users and our partners what they need to understand our mission and priorities.',
    cy: 'Mae’r trywyddion hefyd mewn beta. Rydym yn parhau i fireinio a datblygu eu cynnwys fel eu bod yn rhoi’r hyn sydd ei angen ar ein defnyddwyr a’n partneriaid iddynt ddeall ein cenhadaeth a’n blaenoriaethau.',
  },
  aboutRoadmapsFeedback: {
    en: 'We’d really like to know what you think. Your feedback will help us improve both these roadmaps and how we communicate our plans.',
    cy: 'Byddem wrth ein bodd yn gwybod beth yw eich barn. Bydd eich adborth yn ein helpu i wella’r trywyddion hyn a’r ffordd rydym yn cyfathrebu ein cynlluniau.',
  },
  browseCategories: { en: 'Browse by category', cy: 'Pori yn ôl categori' },
  searchRoadmaps: { en: 'Search roadmaps', cy: 'Chwilio trywyddion' },
  findProduct: { en: 'Find a product', cy: 'Dod o hyd i gynnyrch' },
  findProductHint: {
    en: 'Search by name, product family or description',
    cy: 'Chwilio yn ôl enw, teulu cynnyrch neu ddisgrifiad',
  },
  // Welsh uses the singular noun after a number, so "{count} trywydd".
  roadmapCount: { en: '{count} roadmaps', cy: '{count} trywydd' },
  roadmapCountOne: { en: '1 roadmap', cy: '1 trywydd' },
  showingRoadmaps: {
    en: 'Showing {shown} of {total} roadmaps',
    cy: 'Yn dangos {shown} o {total} trywydd',
  },
  noMatches: {
    en: 'No roadmaps match your search. Try a different word.',
    cy: 'Does dim trywyddion yn cyfateb i’ch chwiliad. Rhowch gynnig ar air gwahanol.',
  },
  noRoadmaps: {
    en: 'No roadmaps have been published yet.',
    cy: 'Does dim trywyddion wedi’u cyhoeddi eto.',
  },

  // The organisation filter. {organisation} is a name from ORGANISATIONS.
  filterByOrganisation: {
    en: 'Filter by organisation',
    cy: 'Hidlo yn ôl sefydliad',
  },
  filteredByOrganisation: {
    en: 'Filtered by organisation: {organisation}',
    cy: 'Wedi’i hidlo yn ôl sefydliad: {organisation}',
  },
  filteredBy: {
    en: 'Filtered by: {organisation}',
    cy: 'Wedi’i hidlo yn ôl: {organisation}',
  },
  organisationLabel: { en: 'Organisation', cy: 'Sefydliad' },
  organisationHint: {
    en: 'Show only roadmaps and work for this organisation',
    cy: 'Dangos trywyddion a gwaith ar gyfer y sefydliad hwn yn unig',
  },
  allOrganisations: { en: 'All organisations', cy: 'Pob sefydliad' },
  includeAllWales: {
    en: 'Include all-Wales work',
    cy: 'Cynnwys gwaith Cymru gyfan',
  },
  includeAllWalesHint: {
    en: 'Work for every organisation in Wales, such as national systems',
    cy: 'Gwaith ar gyfer pob sefydliad yng Nghymru, fel systemau cenedlaethol',
  },
  clearFilter: { en: 'Clear filter', cy: 'Clirio’r hidlydd' },
  clear: { en: 'Clear', cy: 'Clirio' },
  showingRoadmapsFor: {
    en: 'Showing {shown} of {total} roadmaps for {organisation}',
    cy: 'Yn dangos {shown} o {total} trywydd ar gyfer {organisation}',
  },
  showingRoadmapsForWithNational: {
    en: 'Showing {shown} of {total} roadmaps for {organisation}, including all-Wales work',
    cy: 'Yn dangos {shown} o {total} trywydd ar gyfer {organisation}, gan gynnwys gwaith Cymru gyfan',
  },
  noMatchesFor: {
    en: 'No roadmaps match your search for {organisation}. Try a different word.',
    cy: 'Does dim trywyddion yn cyfateb i’ch chwiliad ar gyfer {organisation}. Rhowch gynnig ar air gwahanol.',
  },
  noWorkFor: {
    en: 'No roadmaps have work for {organisation} yet.',
    cy: 'Does dim trywyddion â gwaith ar gyfer {organisation} eto.',
  },
  showAllOrganisations: {
    en: 'Show all organisations',
    cy: 'Dangos pob sefydliad',
  },
  // A product card's share of items, e.g. "5 of 9" then "items for Powys".
  countOf: { en: '{shown} of {total}', cy: '{shown} o {total}' },
  // After a filtered count in the list view's "At a glance", e.g. "2 of 5".
  ofTotal: { en: 'of {total}', cy: 'o {total}' },
  itemsFor: {
    en: 'items for {organisation}',
    cy: 'eitem ar gyfer {organisation}',
  },
  updated: { en: 'Updated', cy: 'Diweddarwyd' },
  viewRoadmap: { en: 'View roadmap', cy: 'Gweld y trywydd' },

  allRoadmaps: { en: 'All roadmaps', cy: 'Pob trywydd' },
  lastUpdated: { en: 'Last updated', cy: 'Diweddarwyd ddiwethaf' },
  status: { en: 'Status', cy: 'Statws' },
  productLead: { en: 'Product lead', cy: 'Arweinydd cynnyrch' },
  vision: { en: 'Our vision', cy: 'Ein gweledigaeth' },
  value: { en: 'Our value', cy: 'Ein gwerth' },
  horizonsHeading: { en: 'Now, Next and Later', cy: 'Nawr, Nesaf a Hwyrach' },
  outcome: { en: 'Outcome', cy: 'Canlyniad' },
  tags: { en: 'Tags:', cy: 'Tagiau:' },
  atAGlance: { en: 'At a glance', cy: 'Cipolwg' },
  openAll: { en: 'Open all', cy: 'Agor y cyfan' },
  closeAll: { en: 'Close all', cy: 'Cau’r cyfan' },
  nothingYet: {
    en: 'Nothing to show here yet.',
    cy: 'Dim byd i’w ddangos yma eto.',
  },
  nothingFor: {
    en: 'Nothing for {organisation} here.',
    cy: 'Dim byd ar gyfer {organisation} yma.',
  },
  showHiddenItems: {
    en: 'Show {count} hidden items',
    cy: 'Dangos {count} eitem gudd',
  },
  showHiddenItemsOne: {
    en: 'Show 1 hidden item',
    cy: 'Dangos 1 eitem gudd',
  },
  showingItemsFor: {
    en: 'Showing {shown} of {total} items for {organisation}',
    cy: 'Yn dangos {shown} o {total} eitem ar gyfer {organisation}',
  },
  showingItemsForWithNational: {
    en: 'Showing {shown} of {total} items for {organisation}, including all-Wales work',
    cy: 'Yn dangos {shown} o {total} eitem ar gyfer {organisation}, gan gynnwys gwaith Cymru gyfan',
  },
  showingAllItems: {
    en: 'Showing all {total} items',
    cy: 'Yn dangos pob un o’r {total} eitem',
  },
  includesAllWales: {
    en: 'Includes work for all of Wales.',
    cy: 'Mae’n cynnwys gwaith ar gyfer Cymru gyfan.',
  },
  filterHelp: {
    en: 'The count next to each heading shows how many items match. Select an organisation on any card to switch to it.',
    cy: 'Mae’r rhif wrth ymyl pob pennawd yn dangos faint o eitemau sy’n cyfateb. Dewiswch sefydliad ar unrhyw gerdyn i newid iddo.',
  },
  showAllItems: { en: 'Show all items', cy: 'Dangos pob eitem' },
  organisationsLabel: { en: 'Organisations:', cy: 'Sefydliadau:' },
  // Hidden text before an organisation pill's name.
  filterByPill: { en: 'Filter by', cy: 'Hidlo yn ôl' },
  showAllItemsAgain: {
    en: 'Show all items again',
    cy: 'Dangos pob eitem eto',
  },
  showOnlyWorkFor: {
    en: 'Show only work for {organisation}',
    cy: 'Dangos gwaith ar gyfer {organisation} yn unig',
  },

  notFoundHeading: {
    en: 'Roadmap not found',
    cy: 'Heb ddod o hyd i’r trywydd',
  },
  notFoundBody: {
    en: 'We couldn’t find a roadmap called “{slug}”. It may have moved or been removed.',
    cy: 'Ni allem ddod o hyd i drywydd o’r enw “{slug}”. Efallai ei fod wedi symud neu wedi’i ddileu.',
  },
  notFoundGeneric: {
    en: 'We couldn’t find that page. It may have moved or been removed.',
    cy: 'Ni allem ddod o hyd i’r dudalen honno. Efallai ei bod wedi symud neu wedi’i dileu.',
  },
  viewAllRoadmaps: { en: 'View all roadmaps', cy: 'Gweld pob trywydd' },
} satisfies Record<string, Localised>;
