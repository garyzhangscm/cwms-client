const fs = require('node:fs');
const assert = require('node:assert/strict');
const ts = require('typescript');
const { of, Subject, NEVER, throwError, firstValueFrom, timeout } = require('rxjs');
const path = 'src/app/routes/inbound/receipt/receipt.component.ts';
const source = ts.createSourceFile(path, fs.readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true);
const cls = source.statements.find(n => ts.isClassDeclaration(n) && n.name.text === 'InboundReceiptComponent');
const names = ['search', 'resetForm', 'searchFromFirstPage', 'refreshDetailInformations', 'ngOnDestroy', 'loadReceiptLineDetails', 'supplierDisplayName'];
const methods = cls.members.filter(n => n.name && names.includes(n.name.getText(source))).map(n => n.getText(source));
const Tested = new Function('firstValueFrom', 'timeout', 'formatDate', ts.transpile(`class Tested { ${methods.join('\n')} }`, { target: ts.ScriptTarget.ES2022 }) + ';return Tested;')(firstValueFrom, ms => timeout(Math.min(ms, 30)), () => 'now');
const tick = () => new Promise(r => setImmediate(r));
function setup() {
 const c = new Tested(); c.searchVersion = 0; c.receiptTablePI = 1; c.receiptTablePS = 10;
 c.loadingReceiptLineIds = new Set(); c.receiptLineLoads = new Map();
 c.detailLoadFailures = new Set(); c.validSuppliers = [];
 c.warehouseService = { getCurrentWarehouse: () => ({ id: 1 }) };
 c.receiptTable = { pi: 1, ps: 10 };
 c.searchForm = { getRawValue: () => ({ number: '', statusList: [], supplier: '', client: '' }), reset() {} };
 c.localCacheService = { getSupplier: id => of({ id, name: 'Supplier' }), getClient: id => of({ id }), getItem: id => of({ id }) };
 c.loadItemPackageType = () => {}; c.calculateReceiptLineDisplayQuantity = () => {};
 c.setupReceiptBillableActivities = () => {}; c.calculateQuantities = x => x;
 c.i18n = { fanyi: key => key }; c.messageService = { warning() {} };
 return c;
}
(async () => {
 let c = setup(); const pending = new Subject(); let calls = 0;
 c.localCacheService.getSupplier = () => { calls++; return pending; };
 const rows = [{ supplierId: 7, receiptLines: [] }, { supplierId: 7, receiptLines: [] }];
 let done = false; const loading = c.refreshDetailInformations(rows).then(x => { done = true; return x; });
 await tick(); assert.equal(done, false); assert.equal(calls, 1);
 pending.next({ id: 7, name: 'Loaded' }); pending.complete();
 assert.equal((await loading).size, 0); assert.equal(rows[1].supplier.name, 'Loaded');
 // Failed / indefinitely pending references finish and identify the failed IDs.
 c = setup(); c.localCacheService.getSupplier = () => NEVER;
 const failures = await c.refreshDetailInformations([{ supplierId: 8, receiptLines: [] }]);
 assert(failures.has('supplier:8'));
 c.localCacheService.getSupplier = () => throwError(() => Error('missing'));
 assert((await c.refreshDetailInformations([{ supplierId: 9, receiptLines: [] }])).has('supplier:9'));
 // Supplier options satisfy a reference without an extra request.
 c = setup(); c.validSuppliers = [{ id: 5, name: 'Known' }];
 c.localCacheService.getSupplier = () => { throw Error('unnecessary request'); };
 const known = [{ supplierId: 5, receiptLines: [] }]; await c.refreshDetailInformations(known); assert.equal(known[0].supplier.name, 'Known');
 // Clearing during a query invalidates delayed data, even during hydration.
 c = setup(); const late = new Subject(); c.localCacheService.getSupplier = () => late;
 c.receiptService = { getPageableReceipts: () => of({ content: [{ supplierId: 7, receiptLines: [] }], totalElements: 1 }) };
 c.search(); c.resetForm(); late.next({ id: 7 }); late.complete(); await tick();
 assert.deepEqual(c.listOfAllReceipts, []); assert.equal(c.searching, false);
 // Date endpoints are distinct; new searches start at page 1 and total is server total.
 c = setup(); const start = new Date(2026, 9, 1, 9); const end = new Date(2026, 9, 7, 18); const date = new Date(2026, 9, 7);
 c.searchForm.getRawValue = () => ({ number: 'R1', statusList: ['CLOSED'], supplier: 'S1', client: '4', checkInDateTimeRanger: [start, end], checkInDate: date });
 let args; c.receiptService = { getPageableReceipts: (...values) => { args = values; return of({ content: [], totalElements: 42 }); } };
 c.receiptTable.pi = 5; c.searchFromFirstPage(); await tick();
 assert.equal(args[4], start); assert.equal(args[5], end); assert.equal(args[6], date);
 assert.equal(args[9], '4'); assert.equal(args[10], 1); assert.equal(c.receiptTotal, 42);
 // List search must not wait for line Items; expanding hydrates the copied ST row.
 c = setup(); const itemPending = new Subject(); let itemCalls = 0;
 c.localCacheService.getItem = () => { itemCalls++; return itemPending; };
 const receipt = { id: 1, receiptLines: [{ id: 2, itemId: 3 }] };
 c.receiptService = { getPageableReceipts: (...args) => { assert.equal(args[1], false); return of({ content: [receipt], totalElements: 1 }); } };
 c.search(); await tick(); assert.equal(c.searching, false); assert.equal(itemCalls, 0);
 const rendered = structuredClone(receipt); rendered.expand = true;
 let updated; c.receiptTable.setRow = (row, values) => { updated = row; Object.assign(row, values); };
 const details = c.loadReceiptLineDetails(rendered); const duplicate = c.loadReceiptLineDetails(rendered);
 assert.equal(itemCalls, 1); assert(c.loadingReceiptLineIds.has(1));
 itemPending.next({ id: 3, name: 'Item name' }); itemPending.complete(); await details; await duplicate;
 assert.equal(updated, rendered); assert.equal(rendered.receiptLines[0].item.name, 'Item name'); assert.equal(rendered.expand, true);
 assert.equal(c.loadingReceiptLineIds.size, 0);
 assert.equal(c.supplierDisplayName({ name: '1002', description: 'Supplier company' }), 'Supplier company');
 assert.equal(c.supplierDisplayName({ name: '1002', description: '  ' }), '1002');
 // Bound concurrency across different reference IDs.
 c = setup(); let active = 0; let max = 0;
 c.localCacheService.getSupplier = id => new (require('rxjs').Observable)(subscriber => { active++; max = Math.max(max, active); setImmediate(() => { active--; subscriber.next({ id }); subscriber.complete(); }); });
 await c.refreshDetailInformations(Array.from({ length: 12 }, (_, i) => ({ supplierId: i + 1, receiptLines: [] })));
 assert.equal(max, 4);
 console.log('PASS: supplier hydration waits, reference deduplication, timeouts/failures, cached supplier options, stale results, range endpoints, page reset/total bounded concurrency, lazy line loading and supplier display names');
})().catch(e => { console.error(e); process.exit(1); });
