interface CsvCell { value: string; start: number; end: number; }
interface CsvRecord { cells: CsvCell[]; line: number; }
export interface OrderImportIssue { line: number; reason: 'required' | 'whitespace'; }
export interface PreparedOrderCsv { content: string; trimmedRows: number; issues: OrderImportIssue[]; }

// Retain the original CSV bytes-as-text outside edited order cells, including quotes,
// leading zeroes, addresses, CRLFs, and embedded newlines in other fields.
function parseCsv(text: string): CsvRecord[] {
  const records: CsvRecord[] = [];
  let position = text.startsWith('\uFEFF') ? 1 : 0;
  let line = 1;
  while (position < text.length) {
    const record: CsvRecord = { cells: [], line };
    for (;;) {
      const start = position;
      let value = '';
      if (text[position] === '"') {
        ++position;
        let closed = false;
        while (position < text.length) {
          const char = text[position++];
          if (char === '"') {
            if (text[position] === '"') { value += '"'; ++position; }
            else { closed = true; break; }
          } else {
            value += char;
            if (char === '\n' || (char === '\r' && text[position] !== '\n')) ++line;
          }
        }
        if (!closed || (position < text.length && ![',', '\r', '\n'].includes(text[position]))) {
          throw new Error('invalidCsv');
        }
      } else {
        while (position < text.length && ![',', '\r', '\n'].includes(text[position])) {
          if (text[position] === '"') throw new Error('invalidCsv');
          value += text[position++];
        }
      }
      record.cells.push({ value, start, end: position });
      if (text[position] === ',') { ++position; continue; }
      if (text[position] === '\r' || text[position] === '\n') {
        if (text[position++] === '\r' && text[position] === '\n') ++position;
        ++line;
      }
      break;
    }
    records.push(record);
  }
  return records;
}

export function prepareOrderImportCsv(text: string, mappings: ReadonlyMap<string, string>): PreparedOrderCsv {
  const records = parseCsv(text);
  if (!records.length) throw new Error('missingColumn');
  const names = new Set(['order']);
  for (const [name, alias] of mappings) {
    if (name.toLowerCase() === 'order' && alias) names.add(alias.toLowerCase());
  }
  const columns = records[0].cells.map((cell, index) => names.has(cell.value.toLowerCase()) ? index : -1).filter(index => index >= 0);
  if (columns.length !== 1) throw new Error(columns.length ? 'ambiguousColumn' : 'missingColumn');
  const column = columns[0];
  const issues: OrderImportIssue[] = [];
  const edits: Array<{start: number; end: number; text: string}> = [];
  for (const record of records.slice(1)) {
    if (record.cells.every(cell => !cell.value.trim())) continue;
    const cell = record.cells[column];
    const number = (cell?.value ?? '').replace(/^[\s\u200B\u2060]+|[\s\u200B\u2060]+$/g, '');
    if (!number || /[\s\u200B\u2060]/.test(number)) {
      issues.push({ line: record.line, reason: number ? 'whitespace' : 'required' });
    } else if (cell && number !== cell.value) {
      const quoted = text[cell.start] === '"';
      edits.push({ start: cell.start, end: cell.end, text: quoted ? `"${number.replace(/"/g, '""')}"` : number });
    }
  }
  if (issues.length) return { content: text, trimmedRows: 0, issues };
  let content = text;
  for (const edit of edits.reverse()) content = content.slice(0, edit.start) + edit.text + content.slice(edit.end);
  return { content, trimmedRows: edits.length, issues };
}
