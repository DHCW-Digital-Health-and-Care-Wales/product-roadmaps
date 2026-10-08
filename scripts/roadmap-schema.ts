/**
 * Schema for src/data/roadmaps.json. The sync checks it before writing, and a
 * unit test checks the committed file, so a parser bug can't ship silently.
 */
import { z } from 'zod';
import {
  PLACEMENT_IDS,
  type Placement,
  type Roadmap,
} from '../src/lib/types.ts';

const localised = z.strictObject({ en: z.string(), cy: z.string() });

const isoDate = z.iso.date();

const item = z.strictObject({
  title: localised.refine((value) => value.en.trim() !== '', 'Empty title'),
  description: localised,
  outcome: localised.optional(),
  status: z.string().min(1).optional(),
  phase: z.string().min(1).optional(),
  labels: z.array(z.string().min(1)).min(1).optional(),
  details: z
    .array(z.strictObject({ text: localised, level: z.int().nonnegative() }))
    .min(1)
    .optional(),
});

const items = z.array(item);

const roadmap = z.strictObject({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid URL slug'),
  sheetName: z.string().min(1),
  meta: z.strictObject({
    title: localised,
    statusLabel: localised,
    lastUpdated: z.union([z.literal(''), isoDate]),
    colour: z.string().regex(/^#[0-9a-f]{6}$/i, 'Invalid hex colour'),
    vision: localised,
    serviceDescription: localised,
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
