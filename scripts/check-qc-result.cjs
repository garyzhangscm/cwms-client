const fs = require('node:fs');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync('src/app/routes/qc/qc-result/qc-result.presentation.ts', 'utf8');
const context = { exports: {} };
vm.runInNewContext(ts.transpile(source, { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }), context);
const { presentCheck, presentQcRecord } = context.exports;
const t = key => key;
const option = (kind, actual, result = 'PASS', enabled = true) => ({
  qcRuleItem: { checkPoint: 'Weight', qcRuleItemType: kind, qcRuleItemComparator: 'EQUAL', expectedValue: kind === 'YESNO' ? 'false' : '0', enabled },
  qcInspectionResult: result, ...actual
});
let check = presentCheck(option('NUMBER', { doubleValue: 0 }), t);
assert.equal(check.actual, '0'); assert.equal(check.hasActual, true); assert.equal(check.needsReview, false);
check = presentCheck(option('YESNO', { booleanValue: false }), t);
assert.equal(check.actual, 'qc-view.no'); assert.equal(check.standard, '= qc-view.no'); assert.equal(check.needsReview, false);
check = presentCheck(option('YESNO', { booleanValue: true }), t); assert.equal(check.actual, 'qc-view.yes');
for (const value of [undefined, null, '']) {
 check = presentCheck(option('STRING', { stringValue: value }), t);
 assert.equal(check.actual, 'qc-view.not-recorded'); assert.equal(check.needsReview, true); assert.equal(check.result, 'PASS');
}
check = presentCheck(option('NUMBER', {}, 'FAIL'), t); assert.equal(check.result, 'FAIL'); assert.equal(check.needsReview, true);
check = presentCheck(option('NUMBER', {}, 'PENDING'), t); assert.equal(check.needsReview, false);
check = presentCheck(option('NUMBER', { doubleValue: 1 }, 'PASS', false), t);
assert.equal(check.skipped, false); assert.equal(check.currentlyDisabled, true); assert.equal(check.result, 'PASS');
for (const result of ['SKIPPED', 'NOT_APPLY', 'CANCELLED']) {
 check = presentCheck(option('NUMBER', {}, result), t); assert.equal(check.skipped, true); assert.equal(check.needsReview, false);
}
check = presentCheck({ qcInspectionResult: 'UNKNOWN' }, t);
assert.equal(check.resultLabel, 'UNKNOWN'); assert.equal(check.tone, 'neutral'); assert.equal(check.actual, 'qc-view.not-recorded');
const record = {
 number: 'QC1', type: 'BY_ITEM', item: { name: 'RESIN', description: 'Resin' }, qcInspectionResult: 'PASS',
 inventory: { id: 2, lpn: 'L2' }, inventories: [{ id: 2, lpn: 'L2' }, { id: 3, lpn: 'L3' }],
 qcInspectionRequestItems: [{ qcRule: { name: 'RAW' }, qcInspectionResult: 'PASS', qcInspectionRequestItemOptions: [
   option('NUMBER', {}, 'PASS', false), option('NUMBER', { doubleValue: 0 }, 'PASS'), option('YESNO', {}, 'SKIPPED')
 ] }]
};
const before = JSON.stringify(record); const view = presentQcRecord(record, t);
assert.equal(JSON.stringify(record), before); assert.equal(view.allInventories.length, 2);
assert.equal(view.view.lpns, 'L2, L3'); assert.equal(view.view.itemNumber, 'RESIN');
assert.equal(view.view.groups[0].checks.length, 2); assert.equal(view.view.groups[0].excluded.length, 1);
assert.equal(view.view.pass, 2); assert.equal(view.view.review, 1); assert.equal(view.qcInspectionResult, 'PASS');
let empty = presentQcRecord({ qcInspectionResult: 'PENDING', inventory: { id: 4, lpn: 'L4', item: { name: 'I4' } } }, t);
assert.equal(empty.view.itemNumber, 'I4'); assert.equal(empty.view.total, 0); assert.equal(empty.allInventories.length, 1);
empty = presentQcRecord({ qcInspectionResult: 'PENDING', workOrder: { item: { name: 'WO-ITEM' } } }, t);
assert.equal(empty.view.itemNumber, 'WO-ITEM');
empty = presentQcRecord({ qcInspectionResult: 'PASS', workOrderQCSample: { number: 'S1', workOrder: { number: 'WO1', item: { name: 'SAMPLE-ITEM' } } } }, t);
assert.equal(empty.view.itemNumber, 'SAMPLE-ITEM'); assert.equal(empty.workOrder.number, 'WO1'); assert.equal(empty.view.typeLabel, 'qc-view.type-BY_WORK_ORDER_SAMPLING');
console.log('PASS: zero/false values, missing values and warnings, immutable recorded decisions, disabled historical checks retained, explicit excluded statuses, unknown results, inventory deduplication, item fallbacks, null collections');
