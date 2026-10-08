export interface AssignmentRow {
  id?: number;
  lineId?: number;
  line: string;
  number: string;
  item: string;
  description: string;
  status: string;
  workOrderId?: number;
}
export interface AssignmentGroup { key: string; line: string; rows: AssignmentRow[]; }
export function groupAssignments(rows: AssignmentRow[], filters: { line: string; number: string; item: string; status: string }): AssignmentGroup[] {
  const contains = (value: string, filter: string) => value.toLowerCase().includes(filter.trim().toLowerCase());
  const groups = new Map<string, AssignmentGroup>();
  for (const row of rows) {
    if (['COMPLETED', 'CLOSED', 'CANCELLED'].includes(row.status)) continue;
    if (!contains(row.line, filters.line) || !contains(row.number, filters.number) || !contains(row.item, filters.item)
      || (filters.status && row.status !== filters.status)) continue;
    const key = row.lineId ? String(row.lineId) : row.line;
    if (!groups.has(key)) groups.set(key, { key, line: row.line, rows: [] });
    groups.get(key)!.rows.push(row);
  }
  return [...groups.values()].sort((a, b) => a.line.localeCompare(b.line, undefined, { numeric: true }))
    .map(group => ({ ...group, rows: group.rows.sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true })) }));
}
