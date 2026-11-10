/**
 * Schema for .data/roadmaps.json. The sync checks it before writing, and a
 * unit test checks the example data, so a parser bug can't ship silently.
 */
import { z } from 'zod';
import {
  CATEGORY_IDS,
  ORGANISATION_IDS,
  PLACEMENT_IDS,
  type Placement,
  type Roadmap,
} from '../src/lib/types.ts';

const localised = z
  .strictObject({ en: z.string(), cy: z.string() })
  .refine(
    (value) => value.en.trim() !== '' || value.cy.trim() === '',
    'Welsh text with no English',
  );

const nonEmpty = localised.refine(
  (value) => value.en.trim() !== '',
  'Empty English text',
);

const isoDate = z.iso.date();

const item = z.strictObject({
  title: nonEmpty,
  description: localised,
  outcome: nonEmpty.optional(),
  phase: nonEmpty.optional(),
  labels: z.array(nonEmpty).min(1).optional(),
  details: z
    .array(z.strictObject({ text: nonEmpty, level: z.int().nonnegative() }))
    .min(1)
    .optional(),
  organisations: z.array(z.enum(ORGANISATION_IDS)).min(1).optional(),
});

const items = z.array(item);

const roadmap = z.strictObject({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid URL slug'),
  sheetName: z.string().min(1),
  meta: z.strictObject({
    title: nonEmpty,
    category: z.union([z.literal(''), z.enum(CATEGORY_IDS)]),
    family: localised,
    statusLabel: localised,
    lastUpdated: z.union([z.literal(''), isoDate]),
    colour: z.string().regex(/^#[0-9a-f]{6}$/i, 'Invalid hex colour'),
    vision: localised,
    serviceDescription: localised,
    productLead: z.string(),
  }),
  items: z.strictObject(
    Object.fromEntries(PLACEMENT_IDS.map((id) => [id, items])) as Record<
      Placement,
      typeof items
    >,
  ),
});

export const snapshotSchema = z
  .array(roadmap)
  .min(1)
  .refine(
    (roadmaps) => new Set(roadmaps.map((r) => r.slug)).size === roadmaps.length,
    'Duplicate URL slugs',
  ) satisfies z.ZodType<Roadmap[]>;

/** Throws a readable error if the snapshot doesn't match the schema. */
export function validateSnapshot(data: unknown): Roadmap[] {
  const result = snapshotSchema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `Invalid roadmap snapshot:\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}
