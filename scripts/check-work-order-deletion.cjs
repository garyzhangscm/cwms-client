const fs = require('node:fs');
const assert = require('node:assert/strict');
const ts = require('typescript');
const { of, throwError, firstValueFrom, map, Subject } = require('rxjs');

function loadClass(path, name, members, bindings) {
  const source = ts.createSourceFile(path, fs.readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true);
  const cls = source.statements.find(n => ts.isClassDeclaration(n) && n.name.text === name);
  const methods = cls.members.filter(n => n.name && members.includes(n.name.getText(source))).map(n => n.getText(source));
  const js = ts.transpile(`class Tested { ${methods.join('\n')} }`, { target: ts.ScriptTarget.ES2022 });
  return new Function(...Object.keys(bindings), js + '; return Tested;')(...Object.values(bindings));
}
const deletionEnvironment = { production: true };
const Service = loadClass('src/app/routes/work-order/services/work-order.service.ts', 'WorkOrderService', ['removeWorkOrder', 'removeWorkOrders'], { map, environment: deletionEnvironment });
const Component = loadClass('src/app/routes/work-order/work-order/work-order.component.ts', 'WorkOrderWorkOrderComponent', ['canDeleteWorkOrder', 'deleteWorkOrder'], { firstValueFrom, WorkOrderStatus: { PENDING: 'PENDING' } });
const draft = { id: 2267, status: 'PENDING', producedQuantity: 0, number: 'WO-1', workOrderLines: [] };

(async () => {
  const requests = [];
  const service = new Service();
  service.warehouseService = { getCurrentWarehouse: () => ({ id: 1 }) };
  service.http = { delete: (url, params) => { requests.push({ url, params }); return of({ result: 0 }); } };
  assert.equal(await firstValueFrom(service.removeWorkOrder(draft)), undefined);
  assert.deepEqual(requests, [{ url: 'workorder/work-orders', params: { warehouseId: 1, workOrderIds: '2267' } }]);
  deletionEnvironment.production = false;
  await firstValueFrom(service.removeWorkOrder(draft));
  assert.equal(requests[1].url, 'workorder-deletion-test/work-orders', 'development cannot call legacy production DELETE');

  const c = new Component();
  c.deletingWorkOrderIds = new Set();
  assert(c.canDeleteWorkOrder(draft));
  for (const patch of [{ status: 'INPROCESS' }, { producedQuantity: 1 }, { productionLineAssignments: [{}] }, { assignments: [{}] }, { qcQuantityCompleted: 1 }, { workOrderLines: [{ expectedQuantity: 10, openQuantity: 9 }] }]) {
    assert.equal(c.canDeleteWorkOrder({ ...draft, ...patch }), false);
  }
  let modal, submitted = 0, refreshed = 0, success = 0, failure = 0;
  c.i18n = { fanyi: key => key };
  c.modalService = { confirm: options => { modal = options; } };
  c.messageService = { success: () => success++, error: () => failure++ };
  c.searchFromFirstPage = () => refreshed++;
  const pending = new Subject();
  c.workOrderService = { removeWorkOrder: () => { submitted++; return pending; } };
  c.deleteWorkOrder(draft, {});
  assert.equal(submitted, 0, 'opening a confirmation never submits DELETE');
  const confirmed = modal.nzOnOk();
  assert.equal(await modal.nzOnOk(), false, 'duplicate confirmation while submitting is ignored');
  assert.equal(submitted, 1);
  pending.next(undefined); pending.complete();
  assert.equal(await confirmed, true);
  assert.equal(refreshed, 1); assert.equal(success, 1);
  assert.equal(c.deletingWorkOrderIds.size, 0);

  c.workOrderService.removeWorkOrder = () => throwError(() => ({ statusText: 'Work order has inventory.' }));
  c.deleteWorkOrder(draft, {});
  assert.equal(await modal.nzOnOk(), false, 'backend rejection retains confirmation');
  assert.equal(failure, 1); assert.equal(refreshed, 1); assert.equal(success, 1);
  assert.equal(c.deletingWorkOrderIds.size, 0);
  console.log('PASS: correct warehouse-scoped deletion endpoint, confirmation before DELETE, ineligible visibility, duplicate protection, refresh on success and no false success after rejection. API calls mocked.');
})().catch(error => { console.error(error); process.exitCode = 1; });
