/**
 * Minimal .xlsx reader: returns every worksheet as a grid of strings, in tab
 * order. Only cell values are read; formatting is ignored.
 */
import { strFromU8, unzipSync } from 'fflate';

export interface Worksheet {
  name: string;
  rows: string[][];
}

const REL_NS =
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

function parseXml(files: Record<string, Uint8Array>, path: string) {
  const file = files[path];
  if (!file) return null;
  return new DOMParser().parseFromString(strFromU8(file), 'application/xml');
}

function byTag(node: Document | Element, tag: string): Element[] {
  return Array.from(node.getElementsByTagNameNS('*', tag));
}

/** Text of a shared/inline string, ignoring phonetic runs. */
function stringText(node: Element): string {
  return byTag(node, 't')
    .filter((t) => (t.parentNode as Element | null)?.localName !== 'rPh')
    .map((t) => t.textContent ?? '')
    .join('');
}

function columnIndex(ref: string): number {
  let index = 0;
  for (const char of ref.replace(/\d+$/, '')) {
    index = index * 26 + (char.charCodeAt(0) - 64);
  }
  return index - 1;
}

function resolveTarget(target: string): string {
  if (target.startsWith('/')) return target.slice(1);
  return `xl/${target}`;
}

export function readWorkbook(data: ArrayBuffer): Worksheet[] {
  const files = unzipSync(new Uint8Array(data), {
    filter: (file) => file.name.endsWith('.xml') || file.name.endsWith('.rels'),
  });

  const workbook = parseXml(files, 'xl/workbook.xml');
  const rels = parseXml(files, 'xl/_rels/workbook.xml.rels');
  if (!workbook || !rels) {
    throw new Error('The spreadsheet export is not a valid .xlsx file.');
  }

  const targets = new Map(
    byTag(rels, 'Relationship').map((rel) => [
      rel.getAttribute('Id'),
      rel.getAttribute('Target') ?? '',
    ]),
  );

  const shared = parseXml(files, 'xl/sharedStrings.xml');
  const sharedStrings = shared ? byTag(shared, 'si').map(stringText) : [];

  return byTag(workbook, 'sheet').map((sheet) => {
    const name = sheet.getAttribute('name') ?? '';
    const relId =
      sheet.getAttributeNS(REL_NS, 'id') ?? sheet.getAttribute('r:id');
    const doc = parseXml(files, resolveTarget(targets.get(relId) ?? ''));
    const rows: string[][] = [];

    for (const row of doc ? byTag(doc, 'row') : []) {
      const rowIndex = Number(row.getAttribute('r')) - 1;
      const cells: string[] = [];
      byTag(row, 'c').forEach((cell, position) => {
        const ref = cell.getAttribute('r');
        const col = ref ? columnIndex(ref) : position;
        const type = cell.getAttribute('t');
        const raw = byTag(cell, 'v')[0]?.textContent ?? '';
        let value: string;
        if (type === 's') value = sharedStrings[Number(raw)] ?? '';
        else if (type === 'inlineStr') value = stringText(cell);
        else if (type === 'b') value = raw === '1' ? 'TRUE' : 'FALSE';
        else value = raw;
        cells[col] = value;
      });
      rows[Number.isNaN(rowIndex) ? rows.length : rowIndex] = Array.from(
        cells,
        (value) => value ?? '',
      );
    }

    return { name, rows: Array.from(rows, (row) => row ?? []) };
  });
}
