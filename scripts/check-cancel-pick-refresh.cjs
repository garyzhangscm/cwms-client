const fs = require('node:fs');
const assert = require('node:assert/strict');
const ts = require('typescript');
const { of, Subject, throwError, firstValueFrom } = require('rxjs');
const path = 'src/app/routes/work-order/work-order/work-order.component.ts';
const source = ts.createSourceFile(path, fs.readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true);
const cls = source.statements.find(n => ts.isClassDeclaration(n) && n.name.text === 'WorkOrderWorkOrderComponent');
const methods = cls.members.filter(n => n.name && ['cancelPick', 'loadItemInformation'].includes(n.name.getText(source))).map(n => n.getText(source));
const Tested = new Function('firstValueFrom', 'ShortAllocationStatus', ts.transpile(`class Tested { ${methods.join('\n')} }`, { target: ts.ScriptTarget.ES2022 }) + ';return Tested;')(firstValueFrom, { CANCELLED: 'CANCELLED' });
function setup() {
  const c = new Tested();
  const item = { id: 4, name: 'Finished item', description: 'Description' };
  const order = { id: 390, itemId: 4, item, workOrderLines: [{ id: 10, itemId: 5, item: { id: 5 }, inventoryStatusId: 2, inventoryStatus: { id: 2 } }] };
  c.listOfAllWorkOrder = [order, { id: 391 }];
  c.searchRequestVersion = 1; c.cancellingPickIds = new Set();
  c.mapOfPicks = {}; c.mapOfShortAllocations = {}; c.expandSet = new Set([390]);
  c.messageService = { success() {} }; c.i18n = { fanyi: () => '' };
  c.calculateWorkOrderLineTotalQuantities = () => {};
  c.refreshDetailInformation = () => {};
  c.workOrderService = { getWorkOrder: () => of({ id: 390, itemId: 4, producedQuantity: 42, workOrderLines: [{ id: 10, itemId: 5, inventoryStatusId: 2, openQuantity: 20 }] }) };
  c.pickService = { cancelPick: () => of([]), getPicksByWorkOrder: () => of([{ id: 2 }]) };
  c.shortAllocationService = { getShortAllocationsByWorkOrder: () => of([{ status: 'CANCELLED' }, { status: 'OPEN' }]) };
  return { c, order, item };
}
(async () => {
  let { c, order, item } = setup();
  await c.cancelPick(order, { id: 1 }, false, false);
  assert.equal(c.listOfAllWorkOrder.length, 2);
  assert.equal(c.listOfAllWorkOrder[0], order);
  assert.equal(order.item, item);
  assert.equal(order.workOrderLines[0].item.id, 5);
  assert.equal(order.workOrderLines[0].inventoryStatus.id, 2);
  assert.equal(order.workOrderLines[0].openQuantity, 20);
  assert.equal(order.producedQuantity, 42);
  assert(c.expandSet.has(390));
  assert.deepEqual(c.mapOfPicks[390], [{ id: 2 }]);
  assert.deepEqual(c.mapOfShortAllocations[390], [{ status: 'OPEN' }]);
  assert.equal(c.cancellingPickIds.size, 0);

  // ST renders a deep-copied row. The action argument is not the source record.
  ({ c, order, item } = setup());
  const rendered = structuredClone(order);
  rendered.expand = true;
  const originalList = c.listOfAllWorkOrder;
  let rowUpdated;
  c.workOrderTable = { setRow: (row, values) => { rowUpdated = row; Object.assign(row, values); } };
  await c.cancelPick(rendered, { id: 1 }, false, false);
  assert.equal(rowUpdated, rendered);
  assert.equal(order.producedQuantity, 42);
  assert.equal(rendered.producedQuantity, 42);
  assert.equal(rendered.item.name, item.name);
  assert.equal(rendered.expand, true);
  assert.equal(c.listOfAllWorkOrder, originalList);
  assert.deepEqual(c.mapOfPicks[390], [{ id: 2 }]);
  assert.deepEqual(c.mapOfShortAllocations[390], [{ status: 'OPEN' }]);

  // A removed row must not be recreated by a delayed response.
  ({ c, order } = setup());
  c.listOfAllWorkOrder = [];
  await c.cancelPick(structuredClone(order), { id: 1 }, false, false);
  assert.deepEqual(c.listOfAllWorkOrder, []);
  assert.equal(c.mapOfPicks[390], undefined);

  ({ c, order } = setup());
  const pending = new Subject(); let calls = 0;
  c.pickService.cancelPick = () => { calls++; return pending; };
  const first = c.cancelPick(order, { id: 1 }, false, false);
  await c.cancelPick(order, { id: 1 }, true, true);
  assert.equal(calls, 1); assert(c.cancellingPickIds.has(1));
  pending.error(new Error('cancel failed')); await first;
  assert.equal(c.cancellingPickIds.size, 0);
  assert.equal(c.mapOfPicks[390], undefined);

  ({ c, order } = setup());
  const delayed = new Subject();
  c.workOrderService.getWorkOrder = () => delayed;
  const refresh = c.cancelPick(order, { id: 1 }, false, false);
  await Promise.resolve(); c.searchRequestVersion++;
  delayed.next({ id: 390, itemId: 999, workOrderLines: [] });
  await refresh;
  assert.equal(order.itemId, 4); assert.equal(c.mapOfPicks[390], undefined);
  assert.equal(c.cancellingPickIds.size, 0);

  ({ c, order } = setup());
  c.workOrderService.getWorkOrder = () => throwError(() => new Error('refresh failed'));
  await c.cancelPick(order, { id: 1 }, false, false);
  assert.equal(order.itemId, 4);
  assert.deepEqual(c.mapOfPicks[390], [{ id: 2 }]);
  assert.equal(c.cancellingPickIds.size, 0);

  ({ c, order } = setup()); let itemIds;
  c.itemService = { getItemsByIdList: ids => { itemIds = ids; return of([]); } };
  c.setupWorkOrderItems = () => {}; c.loadDefaultStockUoms = () => {};
  c.loadItemInformation([order, { itemId: undefined }, { itemId: 9 }]);
  assert.equal(itemIds, '9');
  console.log('PASS: Cancel Pick refresh preserves metadata, page and expansion; duplicate/error/stale guards and missing Item lookup.');
})().catch(err => { console.error(err); process.exitCode = 1; });
