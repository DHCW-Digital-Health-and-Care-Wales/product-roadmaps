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
  licence: { en: 'Licence', cy: 'Trwydded' },
  onGitHub: { en: 'This project on GitHub', cy: 'Y gwaith ar GitHub' },

  accessibilityHeading: {
    en: 'Accessibility statement',
    cy: 'Datganiad hygyrchedd',
  },
  accessibilityTarget: {
    en: 'We want as many people as possible to be able to use these roadmaps. We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA.',
    cy: 'Rydym am i gymaint o bobl â phosibl allu defnyddio’r trywyddion hyn. Rydym yn anelu at gydymffurfio â Chanllawiau Hygyrchedd Cynnwys Gwe (WCAG) 2.2 ar lefel AA.',
  },
  accessibilityBeta: {
    en: 'These roadmaps are in beta and still being tested, we welcome any feedback.',
    cy: 'Mae’r trywyddion hyn yn fersiwn beta ac maen nhw’n dal i gael eu profi. Rydym yn croesawu unrhyw adborth.',
  },

  privacyHeading: { en: 'Privacy', cy: 'Preifatrwydd' },
  privacyTracking: {
    en: 'This site sets no tracking cookies and uses no third-party analytics. We do not share any personal data.',
    cy: 'Nid yw’r safle hwn yn gosod cwcis tracio nac yn defnyddio dadansoddeg trydydd parti. Nid ydym yn rhannu unrhyw ddata personol.',
  },
  privacyFonts: {
    en: 'Fonts are self-hosted, so your visit is not shared with an external font service.',
    cy: 'Mae’r ffontiau’n cael eu gwesteia gennym ni ein hunain, felly nid yw eich ymweliad yn cael ei rannu â gwasanaeth ffont allanol.',
  },

  phaseBadge: { en: 'Beta', cy: 'Beta' },
  landingTitle: { en: 'Product roadmaps', cy: 'Trywyddion cynnyrch' },
  landingIntro: {
    en: 'See what Digital Health and Care Wales is working on now, what’s coming next and the direction we expect to take later.',
    cy: 'Gweld beth mae Iechyd a Gofal Digidol Cymru yn gweithio arno nawr, beth sy’n dod nesaf a’r cyfeiriad rydym yn disgwyl ei gymryd yn hwyrach.',
  },
  chooseProduct: { en: 'Choose a product', cy: 'Dewis cynnyrch' },
  noRoadmaps: {
    en: 'No roadmaps have been published yet.',
    cy: 'Does dim trywyddion wedi’u cyhoeddi eto.',
  },
  updated: { en: 'Updated', cy: 'Diweddarwyd' },
  viewRoadmap: { en: 'View roadmap', cy: 'Gweld y trywydd' },

  allRoadmaps: { en: 'All roadmaps', cy: 'Pob trywydd' },
  lastUpdated: { en: 'Last updated', cy: 'Diweddarwyd ddiwethaf' },
  vision: { en: 'Our vision', cy: 'Ein gweledigaeth' },
  value: { en: 'Our value', cy: 'Ein gwerth' },
  horizonsHeading: { en: 'Now, Next and Later', cy: 'Nawr, Nesaf a Hwyrach' },
  outcome: { en: 'Outcome:', cy: 'Canlyniad:' },
  nothingYet: {
    en: 'Nothing to show here yet.',
    cy: 'Dim byd i’w ddangos yma eto.',
  },

  notFoundHeading: {
    en: 'Roadmap not found',
    cy: 'Heb ddod o hyd i’r trywydd',
  },
  notFoundBody: {
    en: 'We couldn’t find a roadmap called “{slug}”. It may have moved or been removed.',
    cy: 'Ni allem ddod o hyd i drywydd o’r enw “{slug}”. Efallai ei fod wedi symud neu wedi’i ddileu.',
  },
  viewAllRoadmaps: { en: 'View all roadmaps', cy: 'Gweld pob trywydd' },
} satisfies Record<string, Localised>;
