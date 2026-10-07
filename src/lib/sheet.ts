/**
 * Loads every product roadmap from the public Google Sheet. The whole workbook
 * is fetched once as .xlsx so tab names are known without an API key; each tab
 * (except "Template" and tabs starting with "_") is one product roadmap.
 *
 * Sheet format: one header row, then one row per record. The "Type" column
 * says what the row is (Setting, Horizon, Category, Item, Section, Delivered).
 * See the "Template" tab and README.md for the full column guide.
 */
import { readWorkbook, type Worksheet } from './xlsx';
import type {
  Capabilities,
  Category,
  DeliveredSectionData,
  Horizon,
  Localised,
  Roadmap,
  RoadmapItem,
} from './types';

const DEFAULT_SHEET_ID = '1wuk_pK1LpfLKmdbg6WsY_qKeBC5lcN4rlsjqkAxtflw';
const SHEET_ID = import.meta.env.VITE_SHEET_ID || DEFAULT_SHEET_ID;

export const SHEET_URL = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(SHEET_ID)}/export?format=xlsx`;

const HORIZONS: Horizon[] = ['now', 'next', 'later'];

const DEFAULT_HORIZONS: Roadmap['horizons'] = [
  {
    id: 'now',
    label: { en: 'Now', cy: 'Nawr' },
    definition: {
      en: 'Work that is underway now and shaping the next changes to the service.',
      cy: '',
    },
  },
  {
    id: 'next',
    label: { en: 'Next', cy: 'Nesaf' },
    definition: {
      en: 'Work we expect to pick up soon as current delivery moves forward.',
      cy: '',
    },
  },
  {
    id: 'later',
    label: { en: 'Later', cy: 'Hwyrach' },
    definition: {
      en: 'Longer-term direction that will keep evolving as we learn more.',
      cy: '',
    },
  },
];

type Field =
  | 'type'
  | 'id'
  | 'group'
  | 'category'
  | 'status'
  | 'phase'
  | 'titleEn'
  | 'titleCy'
  | 'summaryEn'
  | 'summaryCy'
  | 'outcomeEn'
  | 'outcomeCy'
  | 'metric'
  | 'detailsHeadingEn'
  | 'detailsHeadingCy'
  | 'detailsEn'
  | 'detailsCy'
  | 'services'
  | 'colour';

const HEADERS: Record<string, Field> = {
  type: 'type',
  id: 'id',
  horizonsection: 'group',
  category: 'category',
  status: 'status',
  phase: 'phase',
  titleenglish: 'titleEn',
  titlewelsh: 'titleCy',
  summaryenglish: 'summaryEn',
  summarywelsh: 'summaryCy',
  outcomeenglish: 'outcomeEn',
  outcomewelsh: 'outcomeCy',
  metric: 'metric',
  detailsheadingenglish: 'detailsHeadingEn',
  detailsheadingwelsh: 'detailsHeadingCy',
  detailslistenglish: 'detailsEn',
  detailslistwelsh: 'detailsCy',
  services: 'services',
  colour: 'colour',
};

type Row = Partial<Record<Field, string>>;

const key = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const loc = (en = '', cy = ''): Localised => ({ en: en.trim(), cy: cy.trim() });

const hasText = (value?: Localised) => Boolean(value && value.en);

/** Sheets stores dates as serial day numbers; convert to YYYY-MM-DD. */
function toIsoDate(value: string): string {
  const serial = Number(value);
  if (value && Number.isFinite(serial) && serial > 20000 && serial < 80000) {
    const ms = Date.UTC(1899, 11, 30) + Math.round(serial) * 86_400_000;
    return new Date(ms).toISOString().slice(0, 10);
  }
  return value.trim();
}

/** Only allow plain hex colours so sheet content can't inject CSS. */
function safeColour(value = ''): string | undefined {
  const colour = value.trim();
  return /^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(colour) ? colour : undefined;
}

/** One list entry per line; leading "-" characters nest an entry. */
function parseDetails(row: Row): Capabilities | undefined {
  const split = (text = '') =>
    text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  const en = split(row.detailsEn);
  if (en.length === 0) return undefined;
  const cy = split(row.detailsCy);
  const strip = (line = '') => line.replace(/^-+\s*/, '');

  return {
    label: loc(row.detailsHeadingEn || 'More detail', row.detailsHeadingCy),
    items: en.map((line, index) => ({
      level: line.match(/^-*/)?.[0].length ?? 0,
      text: loc(strip(line), strip(cy[index])),
    })),
  };
}

function normaliseStatus(value = ''): string | undefined {
  const status = value.trim().toLowerCase().replace(/\s+/g, '-');
  return status || undefined;
}

function toItem(row: Row, fallbackCategory: string): RoadmapItem {
  const title = loc(row.titleEn, row.titleCy);
  const outcome = loc(row.outcomeEn, row.outcomeCy);
  const services = (row.services ?? '')
    .split(/[,\n]/)
    .map((service) => service.trim())
    .filter(Boolean);

  return {
    id: row.id?.trim() || slugify(title.en),
    title,
    summary: loc(row.summaryEn, row.summaryCy),
    outcome: hasText(outcome) ? outcome : undefined,
    categoryId: row.category?.trim() || fallbackCategory,
    status: normaliseStatus(row.status),
    phase: row.phase?.trim() || undefined,
    metric: row.metric?.trim() || undefined,
    capabilities: parseDetails(row),
    services: services.length > 0 ? services : undefined,
  };
}

function readRows(sheet: Worksheet): Row[] {
  const headerIndex = sheet.rows.findIndex((cells) =>
    cells.some((cell) => key(cell) === 'type'),
  );
  if (headerIndex === -1) return [];

  const columns = sheet.rows[headerIndex].map((cell) => HEADERS[key(cell)]);

  return sheet.rows
    .slice(headerIndex + 1)
    .map((cells) => {
      const row: Row = {};
      columns.forEach((field, index) => {
        if (field && cells[index]) row[field] = cells[index];
      });
      return row;
    })
    .filter((row) => row.type?.trim());
}

const SETTING_KEYS: Record<string, keyof Roadmap['meta']> = {
  title: 'title',
  statuslabel: 'statusLabel',
  lastupdated: 'lastUpdated',
  intro: 'intro',
  vision: 'vision',
  servicedescription: 'serviceDescription',
  horizonnote: 'horizonNote',
};

function warn(sheet: string, message: string) {
  if (import.meta.env.DEV) console.warn(`[sheet:${sheet}] ${message}`);
}

export function parseRoadmap(sheet: Worksheet): Roadmap | null {
  const rows = readRows(sheet);
  if (rows.length === 0) return null;

  const meta: Roadmap['meta'] = {
    title: loc(sheet.name),
    vision: loc(),
    serviceDescription: loc(),
    intro: loc(),
    horizonNote: loc(),
    lastUpdated: '',
    statusLabel: loc(),
  };
  const horizons = new Map<Horizon, Roadmap['horizons'][number]>();
  const categories: Category[] = [];
  const sections: DeliveredSectionData[] = [];
  const pendingItems: Row[] = [];
  const pendingDelivered: Row[] = [];

  for (const row of rows) {
    const type = key(row.type ?? '');
    if (type === 'setting') {
      const field = SETTING_KEYS[key(row.id ?? '')];
      if (!field) {
        warn(sheet.name, `Unknown setting "${row.id}"`);
      } else if (field === 'lastUpdated') {
        meta.lastUpdated = toIsoDate(row.summaryEn ?? '');
      } else {
        meta[field] = loc(row.summaryEn, row.summaryCy);
      }
    } else if (type === 'horizon') {
      const id = key(row.id ?? '') as Horizon;
      if (!HORIZONS.includes(id)) {
        warn(sheet.name, `Unknown horizon "${row.id}"`);
        continue;
      }
      const fallback = DEFAULT_HORIZONS.find((h) => h.id === id)!;
      const label = loc(row.titleEn, row.titleCy);
      const definition = loc(row.summaryEn, row.summaryCy);
      horizons.set(id, {
        id,
        label: hasText(label) ? label : fallback.label,
        definition: hasText(definition) ? definition : fallback.definition,
      });
    } else if (type === 'category') {
      const headline = loc(row.titleEn, row.titleCy);
      categories.push({
        id: row.id?.trim() || slugify(headline.en) || 'roadmap',
        label: row.phase?.trim() ?? '',
        headline,
        description: loc(row.summaryEn, row.summaryCy),
        accent: safeColour(row.colour) ?? '#325083',
      });
    } else if (type === 'section') {
      const heading = loc(row.titleEn, row.titleCy);
      sections.push({
        id: row.id?.trim() || slugify(heading.en),
        placement: key(row.group ?? '') === 'before' ? 'before' : 'after',
        heading,
        description: loc(row.summaryEn, row.summaryCy),
        items: [],
      });
    } else if (type === 'item') {
      pendingItems.push(row);
    } else if (type === 'delivered') {
      pendingDelivered.push(row);
    } else {
      warn(sheet.name, `Unknown row type "${row.type}"`);
    }
  }

  if (categories.length === 0) {
    categories.push({
      id: slugify(sheet.name) || 'roadmap',
      label: '',
      headline: meta.title,
      description: loc(),
      accent: '#325083',
    });
  }

  const items: RoadmapItem[] = [];
  for (const row of pendingItems) {
    const horizon = key(row.group ?? '') as Horizon;
    if (!HORIZONS.includes(horizon)) {
      warn(
        sheet.name,
        `Item "${row.titleEn}" has unknown horizon "${row.group}"`,
      );
      continue;
    }
    items.push({ ...toItem(row, categories[0].id), horizon });
  }

  for (const row of pendingDelivered) {
    const sectionId = row.group?.trim();
    const section =
      sections.find((s) => s.id === sectionId) ??
      (sectionId ? undefined : sections[0]);
    if (!section) {
      warn(
        sheet.name,
        `Delivered row "${row.titleEn}" has unknown section "${sectionId}"`,
      );
      continue;
    }
    section.items.push(toItem(row, categories[0].id));
  }

  return {
    slug: slugify(sheet.name),
    sheetName: sheet.name,
    meta,
    horizons: DEFAULT_HORIZONS.map((h) => horizons.get(h.id) ?? h),
    categories,
    items,
    sections,
  };
}

const isHiddenTab = (name: string) =>
  key(name) === 'template' || name.trim().startsWith('_');

let cache: Promise<Roadmap[]> | null = null;

/** Fetches and parses the workbook once per page load. */
export function loadRoadmaps(force = false): Promise<Roadmap[]> {
  if (!cache || force) {
    cache = fetch(SHEET_URL, { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Spreadsheet request failed (${response.status})`);
        }
        return response.arrayBuffer();
      })
      .then((data) =>
        readWorkbook(data)
          .filter((sheet) => !isHiddenTab(sheet.name))
          .map(parseRoadmap)
          .filter((roadmap): roadmap is Roadmap => roadmap !== null),
      );
    cache.catch(() => {
      cache = null;
    });
  }
  return cache;
}
