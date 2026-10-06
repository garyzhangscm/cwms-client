const fs = require('node:fs');
const assert = require('node:assert/strict');
const ts = require('typescript');
const { of, map, Subject } = require('rxjs');

function loadClass(path, name, members, bindings) {
  const source = ts.createSourceFile(path, fs.readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true);
  const cls = source.statements.find(n => ts.isClassDeclaration(n) && n.name.text === name);
  const methods = cls.members.filter(n => n.name && members.includes(n.name.getText(source))).map(n => n.getText(source));
  const js = ts.transpile(`class Tested { ${methods.join('\n')} }`, { target: ts.ScriptTarget.ES2022 });
  return new Function(...Object.keys(bindings), js + '; return Tested;')(...Object.values(bindings));
}

class Params {
  constructor(values = {}) { this.values = values; }
  append(key, value) { return new Params({ ...this.values, [key]: value }); }
}
const Service = loadClass('src/app/routes/work-order/services/work-order.service.ts', 'WorkOrderService', ['getPageableWorkOrders'], { HttpParams: Params, map });
const Component = loadClass('src/app/routes/work-order/work-order/work-order.component.ts', 'WorkOrderWorkOrderComponent', ['hasSearchCriteria', 'clearSearchResults', 'resetSearchPage', 'searchFromFirstPage', 'resetForm', 'search', 'workOrderTableChanged', 'ngOnInit'], { formatDate: () => 'test date' });
const requests = [];
const service = new Service();
service.warehouseService = { getCurrentWarehouse: () => ({ id: 1 }) };
service.http = { get: (url, params) => { requests.push(params.values); return of({ data: { totalElements: 3, content: [] } }); } };
const c = new Component();
c.searchRequestVersion = 0;
c.messageService = { warning: () => {} };
c.workOrderService = service;
c.workOrderTable = { pi: 260, ps: 10 };
c.pageIndex = 260;
c.pageSize = 10;
c.searchForm = { value: { item: '5705067' }, reset() { this.value = {}; } };
c.calculateWorkOrderLineTotalQuantities = orders => orders;
c.refreshDetailInformation = () => {};
c.collapseAll = () => {};
c.i18n = { fanyi: () => '' };

c.searchFromFirstPage();
assert.equal(c.workOrderTable.pi, 1);
assert.equal(c.pageIndex, 1);
assert.equal(requests.length, 1);
assert.equal(requests[0].itemName, '5705067');
assert.equal(requests[0].pageIndex, 0);
assert.equal(requests[0].pageSize, 10);

// Ordinary page navigation must retain the requested page and filters.
c.workOrderTable.pi = 2;
c.workOrderTableChanged({ type: 'pi' });
assert.equal(requests[1].pageIndex, 1);
assert.equal(requests[1].itemName, '5705067');
c.workOrderTable.ps = 25;
c.workOrderTableChanged({ type: 'ps' });
assert.equal(requests[2].pageSize, 25);

c.resetForm();
assert.equal(c.workOrderTable.pi, 1);
assert.equal(c.pageIndex, 1);
assert.deepEqual(c.listOfAllWorkOrder, []);
assert.equal(requests.length, 3);

// Clearing can run before the table ViewChild exists.
const early = new Component();
early.pageIndex = 260;
early.searchRequestVersion = 0;
early.collapseAll = () => {};
early.searchForm = { reset() {} };
early.resetForm();
assert.equal(early.pageIndex, 1);
// Regression checks for empty searches and responses arriving after Reset.
const notices = [];
c.messageService = { warning: text => notices.push(text) };
c.searchForm.value = { number: '   ', item: '  ', status: null };
const beforeEmpty = requests.length;
c.searchFromFirstPage();
c.search();
c.workOrderTable.pi = 2;
c.workOrderTableChanged({ type: 'pi' });
assert.equal(requests.length, beforeEmpty);
assert.equal(notices.length, 1);
assert.equal(c.hasSearched, false);
assert.equal(c.workOrderTable.total, 0);
c.searchForm.value = { status: 'PENDING' };
c.searchFromFirstPage();
assert.equal(requests.at(-1).statusList, 'PENDING');
c.searchForm.value = { number: ' 2021010069-01 ', item: '' };
c.searchFromFirstPage();
assert.equal(requests.at(-1).number, '2021010069-01');
const delayed = new Subject();
c.workOrderService = { getPageableWorkOrders: () => delayed };
c.searchFromFirstPage();
c.resetForm();
delayed.next({ totalElements: 999, content: [{ id: 1 }] });
assert.deepEqual(c.listOfAllWorkOrder, []);
assert.equal(c.workOrderTable.total, 0);
assert.equal(c.hasSearched, false);
assert.equal(c.isSpinning, false);
// Returning from Complete with a work-order number still searches from page one.
c.searchForm.controls = { number: { setValue: value => { c.searchForm.value = { number: value }; } } };
c.titleService = { setTitle: () => {} };
c.activatedRoute = { queryParams: of({ number: '2021010069-01' }) };
c.workOrderService = service;
c.ngOnInit();
assert.equal(requests.at(-1).number, '2021010069-01');
assert.equal(requests.at(-1).pageIndex, 0);
// First visit without URL criteria must not load work orders.
const beforeInitial = requests.length;
c.resetForm();
c.activatedRoute = { queryParams: of({}) };
c.ngOnInit();
assert.equal(requests.length, beforeInitial);
console.log('PASS: empty and whitespace searches make no API calls; Reset clears results and ignores late responses; Item/status queries, pagination and completion return route work. API calls mocked.');
