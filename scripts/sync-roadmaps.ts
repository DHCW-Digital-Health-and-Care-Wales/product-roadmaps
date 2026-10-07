/**
 * Downloads every published tab of the roadmap Google Sheet and writes the
 * parsed roadmaps to src/data/roadmaps.json. Run with `npm run sync`; the
 * nightly GitHub Action commits the result if it changed.
 */
import { writeFileSync } from 'node:fs';
import type { Roadmap } from '../src/lib/types.ts';
import { isHiddenTab, parseRoadmap } from './parse-roadmap.ts';

// "File > Share > Publish to web" link. Public by design, so not a secret.
const PUBLISHED_URL =
  process.env.SHEET_PUBLISHED_URL ||
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vR9s9HbHevAi6UFsCIDXPc0affffjfKp7lLqQUzLNYgwUe7PIHrI5G4V76Y30jMt5xgnI1DBykoFEm5/pub?output=csv';

const OUTPUT = new URL('../src/data/roadmaps.json', import.meta.url);
const BASE = PUBLISHED_URL.replace(/\/pub(html)?(\?.*)?$/, '/pub');

async function get(url: string, contentType: string): Promise<string> {
  const response = await fetch(url);
  const type = response.headers.get('content-type') ?? '';
  if (!response.ok || !type.includes(contentType)) {
    throw new Error(`Unexpected ${response.status} (${type}) from ${url}`);
  }
  return response.text();
}

// The published HTML index is the only keyless way to list tab names and gids.
async function listTabs(): Promise<{ name: string; gid: string }[]> {
  const html = await get(`${BASE}html`, 'text/html');
  const tabs = [
    ...html.matchAll(
      /\{name: "((?:[^"\\]|\\.)*)", pageUrl: "[^"]*", gid: "(\d+)"/g,
    ),
  ].map(([, name, gid]) => ({
    name: JSON.parse(`"${name.replace(/\\x([0-9a-f]{2})/gi, '\\u00$1')}"`),
    gid,
  }));
  if (tabs.length === 0) {
    throw new Error('No published tabs found; has the publish page changed?');
  }
  return tabs;
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char !== '"') field += char;
      else if (text[i + 1] === '"') field += text[++i];
      else quoted = false;
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field || row.length > 0) rows.push([...row, field]);
  return rows;
}

const tabs = (await listTabs()).filter((tab) => !isHiddenTab(tab.name));
const roadmaps: Roadmap[] = [];

for (const tab of tabs) {
  const csv = await get(
    `${BASE}?gid=${tab.gid}&single=true&output=csv`,
    'text/csv',
  );
  const roadmap = parseRoadmap({ name: tab.name, rows: parseCsv(csv) });
  if (!roadmap) {
    console.warn(`::warning title=${tab.name}::Tab has no rows; skipped`);
    continue;
  }
  if (roadmaps.some((r) => r.slug === roadmap.slug)) {
    throw new Error(`Two tabs share the URL slug "${roadmap.slug}"`);
  }
  roadmaps.push(roadmap);
}

if (roadmaps.length === 0) {
  throw new Error('No roadmaps found; refusing to overwrite the snapshot.');
}

writeFileSync(OUTPUT, `${JSON.stringify(roadmaps, null, 2)}\n`);
console.log(
  `Wrote ${roadmaps.length} roadmaps: ${roadmaps.map((r) => r.sheetName).join(', ')}`,
);
