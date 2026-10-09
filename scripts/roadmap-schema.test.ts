import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { validateSnapshot } from './roadmap-schema.ts';

const example: unknown = JSON.parse(
  readFileSync(
    new URL('../e2e/fixtures/roadmaps.json', import.meta.url),
    'utf8',
  ),
);

const valid = () => structuredClone(validateSnapshot(example));

describe('roadmap snapshot schema', () => {
  it('accepts the example data', () => {
    expect(() => validateSnapshot(example)).not.toThrow();
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

  it('rejects plain strings for phase and labels', () => {
    const data = valid();
    const item = data[0].items.now[0] as unknown as Record<string, unknown>;
    item.phase = 'Beta';
    item.labels = ['Web'];
    expect(() => validateSnapshot(data)).toThrow(/phase[\s\S]*labels/);
  });

  it('rejects Welsh with no English', () => {
    const data = valid();
    data[0].items.now[0].description = { en: '', cy: 'Disgrifiad' };
    expect(() => validateSnapshot(data)).toThrow(/Welsh text with no English/);
  });

  it('rejects an empty detail line', () => {
    const data = valid();
    data[0].items.now[0].details = [{ level: 0, text: { en: '', cy: '' } }];
    expect(() => validateSnapshot(data)).toThrow(/Empty English text/);
  });
});
