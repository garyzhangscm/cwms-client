export interface QcShiftSchedule { id: string; start: string; end: string; nextDay: boolean; }
export interface QcShiftConfiguration { warehouseId: number; timezone: string; shifts: QcShiftSchedule[]; }
export function validateShiftConfiguration(value: QcShiftConfiguration, warehouseId: number): QcShiftConfiguration {
  const clock = (v: string): boolean => typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(v);
  if (!value || value.warehouseId !== warehouseId || !Array.isArray(value.shifts) || !value.shifts.length ||
      !value.shifts.every(s => typeof s.id === 'string' && /^[1-9]\d*$/.test(s.id) && clock(s.start) && clock(s.end) &&
        typeof s.nextDay === 'boolean' && (s.nextDay ? s.end <= s.start : s.end > s.start)) ||
      new Set(value.shifts.map(s => s.id)).size !== value.shifts.length) throw new Error('Invalid shift configuration');
  new Intl.DateTimeFormat('en-US', {timeZone: value.timezone});
  return value;
}

export interface QcShiftInspection {
  id: string; number: string; timestamp: string;
  username: string | null; displayName: string | null;
  result: 'REGISTERED' | 'PASS' | 'FAIL'; workOrderNumber: string;
}
export interface QcShiftRow {
  product: string;
  machine: string;
  firstSample: number;
  inline: number;
  finishedGoods: number;
  firstSampleDetails: QcShiftInspection[];
  inlineDetails: QcShiftInspection[];
}

export interface QcShiftReport {
  snapshotId: string;
  warehouseId: number;
  date: string;
  shift: string;
  schedule: QcShiftSchedule | null;
  timezone: string;
  startTime: string;
  endTime: string;
  generatedAt: string;
  rows: QcShiftRow[];
  totals: { machines: number; firstSample: number; inline: number; finishedGoods: number;
    producedPallets: number; inspectedProducedPallets: number; inspectionRate: number | null };
  warnings: string[];
}

/** Reject partial/malformed responses rather than presenting missing data as zero. */
export function validateShiftReport(value: QcShiftReport, warehouseId: number, date: string, shift: string, range?: {start: string; end: string}): QcShiftReport {
  const count = (v: unknown): boolean => Number.isSafeInteger(v) && Number(v) >= 0;
  if (!value || typeof value.snapshotId !== 'string' || !value.snapshotId || value.warehouseId !== warehouseId || value.date !== date || value.shift !== shift ||
      !value.timezone || !value.startTime || !value.endTime || !value.generatedAt ||
      !Array.isArray(value.rows) || !Array.isArray(value.warnings) || !value.warnings.every(x => typeof x === 'string') ||
      !value.totals || !value.rows.every(row => typeof row.product === 'string' && row.product.length > 0 &&
        typeof row.machine === 'string' && row.machine.length > 0 &&
        [row.firstSample, row.inline, row.finishedGoods].every(count))) throw new Error('Invalid report');
  if (shift === 'custom') {
    if (!range || value.schedule !== null) throw new Error('Invalid custom range');
    const local = (timestamp: string): string => {
      const parts = new Intl.DateTimeFormat('en-CA', {timeZone: value.timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'}).formatToParts(new Date(timestamp));
      const get = (key: string): string => parts.find(p => p.type === key)!.value;
      return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}`;
    };
    const seconds = (v: string): string => v.length === 16 ? v + ':00' : v;
    if (local(value.startTime) !== seconds(range.start) || local(value.endTime) !== seconds(range.end)) throw new Error('Range mismatch');
  } else {
    if (!value.schedule) throw new Error('Missing schedule');
    validateShiftConfiguration({warehouseId, timezone: value.timezone, shifts: [value.schedule]}, warehouseId);
    if (value.schedule.id !== shift) throw new Error('Invalid shift');
  }
  const totals = value.totals;
  if (![value.startTime, value.endTime, value.generatedAt].every(v => Number.isFinite(Date.parse(v))) ||
      Date.parse(value.startTime) >= Date.parse(value.endTime)) throw new Error('Invalid report times');
  try { new Intl.DateTimeFormat('en-US', {timeZone: value.timezone}); } catch { throw new Error('Invalid timezone'); }
  if (![totals.machines, totals.firstSample, totals.inline, totals.finishedGoods,
      totals.producedPallets, totals.inspectedProducedPallets].every(count)) throw new Error('Invalid totals');
  for (const field of ['firstSample', 'inline', 'finishedGoods'] as const) {
    if (value.rows.reduce((sum, row) => sum + row[field], 0) !== totals[field]) throw new Error('Totals do not reconcile');
  }
  if (new Set(value.rows.map(row => row.machine)).size !== totals.machines ||
      new Set(value.rows.map(row => JSON.stringify([row.product, row.machine]))).size !== value.rows.length ||
      totals.inspectedProducedPallets > totals.producedPallets ||
      (totals.producedPallets === 0 ? totals.inspectionRate !== null :
        typeof totals.inspectionRate !== 'number' || !Number.isFinite(totals.inspectionRate) ||
        Math.abs(totals.inspectionRate - totals.inspectedProducedPallets / totals.producedPallets) > 1e-10)) {
    throw new Error('Invalid coverage');
  }
  const identities = new Set<string>();
  for (const row of value.rows) {
    for (const field of ['firstSample', 'inline'] as const) {
      const details = row[`${field}Details`];
      if (!Array.isArray(details) || details.length !== row[field]) throw new Error('Missing inspection details');
      for (const entry of details) {
        if (!entry || typeof entry.id !== 'string' || !entry.id || identities.has(entry.id) ||
            typeof entry.number !== 'string' || !entry.number || typeof entry.workOrderNumber !== 'string' ||
            ![entry.username, entry.displayName].every(v => v === null || (typeof v === 'string' && v.trim().length > 0)) ||
            (entry.username === null && entry.displayName !== null) ||
            !Number.isFinite(Date.parse(entry.timestamp)) || Date.parse(entry.timestamp) < Date.parse(value.startTime) ||
            Date.parse(entry.timestamp) >= Date.parse(value.endTime) ||
            (field === 'firstSample' ? entry.result !== 'REGISTERED' : !['PASS', 'FAIL'].includes(entry.result))) {
          throw new Error('Invalid inspection detail');
        }
        identities.add(entry.id);
      }
    }
  }
  return value;
}
