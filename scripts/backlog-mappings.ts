/**
 * Column mappings for backlog exports with different layouts. The mapping is
 * chosen by the CSV file name (without extension, case-insensitive), falling
 * back to DEFAULT_MAPPING, or forced with `--mapping <name>`.
 *
 * To support a new export, add an entry keyed by its file name, e.g.
 *
 *   example: { ...DEFAULT_MAPPING, domain: { value: 'Product' }, status: 'Stage' }
 */
import { DEFAULT_MAPPING, type BacklogMapping } from './backlog.ts';

/** Shared by the WRRS and WCRS onboarding exports, which only differ in name. */
const ONBOARDING_MAPPING: BacklogMapping = {
  title: 'Item (REQUIRED)',
  description: 'Description',
  domain: '',
  status: 'Status',
  statuses: {
    'in discovery': 'Now',
    'in development': 'Now',
    testing: 'Now',
    uat: 'Now',
    pipeline: 'Next',
    'in delay': 'Later',
    'on hold': 'Not doing',
    removed: 'Not doing',
    done: 'Recently delivered',
  },
  labels: ['Supplier', 'Health Organisation'],
};

export const MAPPINGS: Record<string, BacklogMapping> = {
  default: DEFAULT_MAPPING,
  wrrs: {
    ...ONBOARDING_MAPPING,
    domain: { value: 'WRRS' },
    only: { column: 'Child of', blank: true },
  },
  wcrs: { ...ONBOARDING_MAPPING, domain: { value: 'WCRS' } },
  medicinesdiagnostics: {
    ...DEFAULT_MAPPING,
    domain: 'Service',
    only: { column: 'Visibility', includes: 'External' },
    statuses: { ...DEFAULT_MAPPING.statuses, complete: 'Recently delivered' },
    labels: ['Corresponding National Programme', 'NHS Organisation', 'Product'],
  },
};

export function pickMapping(file: string, name?: string): BacklogMapping {
  const key = (
    name ?? file.replace(/^.*[\\/]/, '').replace(/\.csv$/i, '')
  ).toLowerCase();
  const mapping = MAPPINGS[key];
  if (mapping) return mapping;
  if (name) {
    throw new Error(
      `Unknown mapping "${name}"; known: ${Object.keys(MAPPINGS).join(', ')}`,
    );
  }
  return DEFAULT_MAPPING;
}
