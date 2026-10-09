const fs = require('node:fs');
const assert = require('node:assert/strict');
const ts = require('typescript');
const vm = require('node:vm');
function load(path) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText, { exports });
  return exports;
}
const { groupAssignments } = load('src/app/routes/work-order/production-line-assignments/production-line-assignments.data.ts');
const empty = { line: '', number: '', item: '', status: '' };
const row = (lineId, line, number, status = 'INPROCESS') => ({ lineId, line, number, status, item: 'ABC', description: 'Item' });
const rows = [row(2, 'B10', 'WO2'), row(1, 'B2', 'WO3'), row(1, 'B2', 'WO1'),
  row(3, 'C1', 'DONE', 'COMPLETED'), row(3, 'C1', 'CLOSED', 'CLOSED'), row(3, 'C1', 'CANCEL', 'CANCELLED'), row(4, 'D1', 'UNKNOWN', '')];
let result = groupAssignments(rows, empty);
assert.equal(result.length, 3);
assert.equal(result[0].line, 'B2');
assert.equal(result[0].rows.length, 2);
assert.equal(result[0].rows[0].number, 'WO1');
assert.equal(result[2].rows[0].number, 'UNKNOWN');
assert.equal(groupAssignments(rows, { ...empty, line: ' b2 ', number: 'wo3', item: 'abc', status: 'INPROCESS' })[0].rows.length, 1);
assert.equal(groupAssignments(rows, { ...empty, status: 'PENDING' }).length, 0);
assert.equal(rows[1].number, 'WO3'); // Original result order is untouched.
const { organizeWorkspaceMenu } = load('src/app/core/startup/workspace-menu.ts');
const acl = { role: ['/work-order/production-line'] };
const input = [{ i18n: 'menu.main.work-order', children: [{ text: 'Production Line', link: '/work-order/production-line', acl }] }];
const menu = organizeWorkspaceMenu(input);
const links = menu[0].children[0].children[0].children;
assert.equal(links.length, 2);
assert.equal(links[0].link, '/work-order/production-line-assignments');
assert.equal(links[0].acl, acl);
assert.equal(links[1].i18n, 'line-assignments.settings');
assert.equal(organizeWorkspaceMenu(menu)[0].children[0].children[0].children.length, 2);
assert.equal(organizeWorkspaceMenu([{ i18n: 'menu.main.work-order', children: [{ link: '/work-order/work-order' }] }])[0].children[0].children[0].children.length, 1);
console.log('PASS: active assignments, grouping, filters, natural sorting, unknown status and inherited menu permissions');
