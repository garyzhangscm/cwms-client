const fs = require('node:fs');
const assert = require('node:assert/strict');
const ts = require('typescript');
const vm = require('node:vm');
const exportsBox = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/app/routes/work-order/production-line-assignments/batch-deassign.workflow.ts', 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { exports: exportsBox });
const { BatchDeassignWorkflow, materialPayload } = exportsBox;
function setup({ shared = false, writeFail = false, storageFail = false } = {}) {
  const rows = [1,2].map(id => ({ id, workOrderId: id + 10, lineId: id + 20, line: 'CM' + id, number: 'WO' + id, item: 'ABC', description: '', status: 'INPROCESS' }));
  const calls = [], guard = new Set(), successful = [];
  let active = true, readNumber = 0, changed = false;
  const adapter = {
    current: () => active, uncertain: key => guard.has(key),
    markUncertain: key => { if (storageFail) throw new Error('storage'); guard.add(key); },
    success: row => successful.push(row.id),
    read: async row => { readNumber++; return { assignment: { id: row.id, workOrderId: row.workOrderId, productionLine: { id: row.lineId } },
      order: { id: row.workOrderId, status: 'INPROCESS' }, line: { id: row.lineId, inboundStageLocationId: 100 + row.lineId },
      inventories: [{ id: shared ? 1 : row.id, lpn: 'L' + row.id, quantity: changed ? 9 : 10, item: { id: 50 }, locationId: 100 + row.lineId, virtual: false }],
      picks: [{ id: row.id, quantity: 10, pickedQuantity: 0, destinationLocationId: 100 + row.lineId }] }; },
    write: async (snapshot, materials) => { calls.push({ id: snapshot.assignment.id, quantities: materials.map(m => m.quantity), ids: materials.map(m => m.id) }); if (writeFail) throw new Error('timeout'); }
  };
  const workflow = new BatchDeassignWorkflow(adapter);
  const confirm = () => workflow.entries.forEach(e => e.confirmed = true);
  return { rows, calls, guard, successful, workflow, confirm, setChanged: () => changed = true, stop: () => active = false, reads: () => readNumber };
}
(async () => {
  let s = setup(); await s.workflow.prepare(s.rows); assert.equal(s.calls.length, 0); assert.equal(s.workflow.ready, false);
  s.confirm(); s.workflow.entries[0].materials[0].remaining = 0;
  assert.equal(materialPayload(s.workflow.entries[0]).length, 1); assert.equal(materialPayload(s.workflow.entries[0])[0].quantity, 0);
  await Promise.all([s.workflow.submit(), s.workflow.submit()]);
  assert.equal(s.calls.length, 2); assert.equal(s.calls[0].ids[0], 1); assert.equal(s.calls[0].quantities[0], 0); assert.equal(s.successful.length, 2);
  await s.workflow.submit(); assert.equal(s.calls.length, 2); assert.equal(s.reads(), 6);
  s = setup({ shared: true }); await s.workflow.prepare(s.rows); assert(s.workflow.entries.every(e => e.state === 'blocked' && e.reason === 'batch-deassign.shared-inventory')); s.confirm(); await s.workflow.submit(); assert.equal(s.calls.length, 0);
  s = setup(); await s.workflow.prepare(s.rows); s.confirm(); s.setChanged(); await s.workflow.submit(); assert.equal(s.calls.length, 0); assert(s.workflow.entries.every(e => e.state === 'blocked')); assert.equal(s.workflow.processing, false);
  s = setup({ writeFail: true }); await s.workflow.prepare(s.rows); s.confirm(); await s.workflow.submit(); assert.equal(s.calls.length, 1); assert.equal(s.workflow.entries[0].state, 'unknown'); assert.equal(s.workflow.entries[1].state, 'pending'); assert.equal(s.guard.size, 1);
  await s.workflow.prepare(s.rows); assert.equal(s.workflow.entries[0].state, 'unknown'); s.confirm(); await s.workflow.submit(); assert.equal(s.calls.length, 1);
  s = setup({ storageFail: true }); await s.workflow.prepare(s.rows); s.confirm(); await s.workflow.submit(); assert.equal(s.calls.length, 0); assert.equal(s.workflow.entries[0].reason, 'batch-deassign.storage-failed');
  s = setup(); await s.workflow.prepare(s.rows); s.confirm(); s.stop(); await s.workflow.submit(); assert.equal(s.calls.length, 0);
  s = setup(); await s.workflow.prepare(s.rows); s.confirm(); for (const invalid of [-1,11,null,1.5,NaN]) { s.workflow.entries[0].materials[0].remaining = invalid; assert.equal(s.workflow.ready, false); assert.throws(() => materialPayload(s.workflow.entries[0])); }
  // A failed read is not a confirmed absence of remaining inventory.
  s = setup(); s.workflow.adapter.read = async () => { throw new Error('offline'); }; await s.workflow.prepare(s.rows); assert(s.workflow.entries.every(e => e.state === 'blocked')); s.confirm(); await s.workflow.submit(); assert.equal(s.calls.length, 0);
  console.log('PASS: no writes on preparation, explicit zero payload, bounded independent results, duplicate inventory blocking, stale preflight, double-click guard, uncertain outcome persistence, storage and context failures, quantity validation');
})().catch(error => { console.error(error); process.exit(1); });
