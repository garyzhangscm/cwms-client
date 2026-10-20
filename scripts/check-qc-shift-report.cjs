const fs = require('node:fs');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const ts = require('typescript');
const { Subject } = require('rxjs');
function load(file, require) {
  const context = {exports: {}, require, Intl, Date, Number, Set, Error};
  vm.runInNewContext(ts.transpile(fs.readFileSync(file, 'utf8'), {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, experimentalDecorators: true
  }), context);
  return context.exports;
}
const model = load('src/app/routes/qc/shift-report/shift-report.model.ts', () => {throw Error('unexpected import');});
const sample = () => ({snapshotId: 'saved-result', warehouseId: 1, date: '2026-10-18', shift: '2', schedule: {id: '2',start: '04:00:00',end: '16:00:00',nextDay: false},
  timezone: 'America/Chicago', startTime: '2026-10-18T11:00:00Z', endTime: '2026-10-18T23:00:00Z',
  generatedAt: '2026-10-18T23:00:01Z', warnings: [], rows: [{product: 'P1', machine: 'M1', firstSample: 1, inline: 5, finishedGoods: 2, firstSampleDetails: [{id: 'sample:1', number: 'WQC1', timestamp: '2026-10-18T12:00:00Z', username: null, displayName: null, result: 'REGISTERED', workOrderNumber: 'WO1'}], inlineDetails: Array.from({length: 5}, (_, i) => ({id: 'request:' + i, number: 'QC' + i, timestamp: '2026-10-18T12:00:00Z', username: 'LYDIA', displayName: 'Lydia Solis', result: 'PASS', workOrderNumber: 'WO1'}))}],
  totals: {machines: 1, firstSample: 1, inline: 5, finishedGoods: 2, producedPallets: 4, inspectedProducedPallets: 2, inspectionRate: .5}});
const validate = value => model.validateShiftReport(value, 1, '2026-10-18', '2');
assert.equal(validate(sample()).totals.inspectionRate, .5);
for (const change of [
  value => value.warehouseId = 2, value => value.date = '2026-10-19', value => value.shift = '1',
  value => value.rows[0].firstSample = -1, value => value.totals.inline = 4,
  value => value.totals.inspectionRate = 2, value => value.totals.machines = 0,
  value => value.rows.push({...value.rows[0]}), value => value.snapshotId = '',
  value => value.rows[0].inlineDetails.pop(), value => value.rows[0].firstSampleDetails[0].displayName = 'Guessed name',
  value => value.rows[0].inlineDetails[1].id = 'request:0', value => value.rows[0].inlineDetails[0].timestamp = '2026-10-19T12:00:00Z',
  value => delete value.totals.producedPallets, value => value.warnings = [null]
]) { const value = sample(); change(value); assert.throws(() => validate(value)); }
const noPallets = sample(); Object.assign(noPallets.totals, {producedPallets: 0, inspectedProducedPallets: 0, inspectionRate: null});
assert.equal(validate(noPallets).totals.inspectionRate, null);

const api = {calls: [], get(url, params) {const subject = new Subject(); this.calls.push({url, params, subject}); return subject;}};
const raw = {calls: [], post(url, body) {const subject = new Subject(); this.calls.push({url, body, subject}); return subject;}};
const warehouse = {current: {id: 1, companyId: 8, timeZone: 'America/Chicago'}, getCurrentWarehouse() {return this.current;}};
const saves = [];
const injectable = {api, raw, warehouse, i18n: {fanyi: key => key, currentLang: 'en-US'}, title: {setTitle() {}}};
const component = load('src/app/routes/qc/shift-report/shift-report.component.ts', name => {
  if (name === '@angular/core') return {Component: () => cls => cls, inject: token => injectable[token]};
  if (name === '@angular/common/http') return {HttpClient: 'raw'};
  if (name === '@delon/theme') return {_HttpClient: 'api', ALAIN_I18N_TOKEN: 'i18n', TitleService: 'title'};
  if (name === '@core') return {};
  if (name === 'rxjs') return require('rxjs');
  if (name === 'file-saver') return {saveAs: (...args) => saves.push(args)};
  if (name.endsWith('warehouse.service')) return {WarehouseService: 'warehouse'};
  if (name === './shift-report.model') return model;
  throw Error(`Unexpected import ${name}`);
});
const page = new component.QcShiftReportComponent();
page.ngOnInit(); assert.equal(page.loadingShifts, true);
assert.equal(api.calls.at(-1).url, 'qc-shift-report/shifts');
api.calls.at(-1).subject.next({data: {warehouseId: 1, timezone: 'America/Chicago', shifts: [sample().schedule]}});
assert.equal(page.shift, '2'); assert.equal(page.loadingShifts, false);
assert.equal(page.shiftLabel(sample().schedule), '04:00:00–16:00:00');
api.calls.length = 0;
page.date = '2026-10-18';
page.search(); assert.equal(page.busy, true);
assert.equal(api.calls[0].params.warehouseId, 1); assert.equal(api.calls[0].params.companyId, 8);
api.calls[0].subject.next({data: sample()}); assert.equal(page.current, true); assert.equal(page.busy, false);
assert.equal(page.people(page.report.rows[0].inlineDetails)[0], 'Lydia Solis (5)');
assert.equal(page.people(page.report.rows[0].firstSampleDetails)[0], 'qc-shift.not-recorded (1)');
page.toggleDetails(page.report.rows[0], 'inline'); assert.equal(page.selectedRow, page.report.rows[0]);
page.toggleDetails(page.report.rows[0], 'inline'); assert.equal(page.selectedRow, undefined);
page.toggleDetails(page.report.rows[0], 'firstSample'); assert.equal(page.selectedKind, 'firstSample');
page.export(); assert.equal(raw.calls[0].body.snapshotId, 'saved-result');
assert.equal(Object.keys(raw.calls[0].body).sort().join(','), 'companyId,snapshotId,warehouseId');
raw.calls[0].subject.next('excel-bytes'); assert.equal(saves.length, 1);
page.export(); page.date = '2026-10-19'; page.clear(); raw.calls[1].subject.next('late-file');
assert.equal(saves.length, 1); assert.equal(page.report, undefined); assert.equal(page.selectedRow, undefined);
page.date = '2026-10-18'; page.search(); const old = api.calls.at(-1); page.search();
old.subject.next({data: sample()}); assert.equal(page.report, undefined);
api.calls.at(-1).subject.next({data: sample()}); assert.equal(page.current, true);
warehouse.current = {...warehouse.current, id: 2}; assert.equal(page.current, false); page.export(); assert.equal(raw.calls.length, 2);
warehouse.current = {...warehouse.current, id: 1}; page.search(); warehouse.current.id = 2;
api.calls.at(-1).subject.next({data: sample()}); assert.equal(page.report, undefined); assert.equal(page.busy, false);
warehouse.current.id = 1; page.search(); api.calls.at(-1).subject.error(Error('test failure'));
assert.equal(page.report, undefined); assert.equal(page.busy, false); assert.equal(page.error, 'qc-shift.failed');
page.search(); api.calls.at(-1).subject.next({data: sample()});
page.export('pdf'); assert.equal(raw.calls.at(-1).url, 'qc-shift-report/export-pdf');
assert.equal(raw.calls.at(-1).body.snapshotId, 'saved-result');
const beforePdf = raw.calls.length; page.export(); assert.equal(raw.calls.length, beforePdf);
raw.calls.at(-1).subject.next('pdf-bytes');
assert.equal(saves.at(-1)[1], 'QC_2026-10-18_2_shift.pdf');
page.export('pdf'); const pdfSaves = saves.length; page.clear(); raw.calls.at(-1).subject.next('late-pdf');
assert.equal(saves.length, pdfSaves);
page.loadShifts(); api.calls.at(-1).subject.next({data: {warehouseId: 1, timezone: 'UTC', shifts: []}});
assert.equal(page.shift, ''); assert.equal(page.error, 'qc-shift.config-failed');
page.search(); assert.equal(page.report, undefined);
page.ngOnDestroy();
console.log('PASS: report reconciliation, invalid/partial responses, zero denominator, scope checks, stale requests, failed requests and snapshot export');
