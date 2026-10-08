import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { validateSnapshot } from './roadmap-schema.ts';

const committed: unknown = JSON.parse(
  readFileSync(new URL('../src/data/roadmaps.json', import.meta.url), 'utf8'),
);

const valid = () => structuredClone(validateSnapshot(committed));

describe('roadmap snapshot schema', () => {
  it('accepts the committed src/data/roadmaps.json', () => {
    expect(() => validateSnapshot(committed)).not.toThrow();
  });

  it('rejects an empty snapshot', () => {
    expect(() => validateSnapshot([])).toThrow();
  });

  it('rejects duplicate slugs', () => {
    const [a] = valid();
    expect(() => validateSnapshot([a, a])).toThrow(/Duplicate URL slugs/);
  });

  it('rejects an empty slug', () => {
    const data = valid();
    data[0].slug = '';
    expect(() => validateSnapshot(data)).toThrow(/slug/);
  });

  it('rejects an invalid date', () => {
    const data = valid();
    data[0].meta.lastUpdated = '2026-02-31';
    expect(() => validateSnapshot(data)).toThrow(/lastUpdated/);
  });

  it('rejects a colour that is not hex', () => {
    const data = valid();
    data[0].meta.colour = 'red; background: url(x)';
    expect(() => validateSnapshot(data)).toThrow(/hex colour/);
  });

  it('rejects a missing placement', () => {
    const data: unknown[] = valid();
    delete (data[0] as { items: Record<string, unknown> }).items.later;
    expect(() => validateSnapshot(data)).toThrow(/later/);
  });
});
