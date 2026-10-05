const fs = require('node:fs');
const assert = require('node:assert/strict');
const ts = require('typescript');
const rx = require('rxjs');
const { TestScheduler } = require('rxjs/testing');
function loadClass(path, name, members, bindings) {
  const source = ts.createSourceFile(path, fs.readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true);
  const cls = source.statements.find(n => ts.isClassDeclaration(n) && n.name.text === name);
  const selected = cls.members.filter(n => n.name && members.includes(n.name.getText(source))).map(n => n.getText(source));
  const js = ts.transpile(`class Tested { ${selected.join('\n')} }`, { target: ts.ScriptTarget.ES2022 });
  return new Function(...Object.keys(bindings), js + '; return Tested;')(...Object.values(bindings));
}
class Params { set() { return this; } }
const Receipt = loadClass('src/app/routes/work-order/services/production-label-receipt.service.ts', 'ProductionLabelReceiptService', ['waitForReceipt'], { HttpParams: Params, ...rx });
const job = { transactionId: 12, warehouseId: 1, workOrderId: 4, labels: [{ lpn: 'L1', quantity: 100 }] };
const inventory = (overrides = {}) => ({ lpn: 'L1', createInventoryTransactionId: 12, workOrderId: 4, quantity: 100, ...overrides });
function runReceipt(label, response, expectedTime, expectedError = false) {
  const clock = new TestScheduler(assert.deepEqual); let calls = 0, time, error;
  clock.run(() => {
    const service = new Receipt(); service.http = { get: () => response(calls++, clock) };
    service.waitForReceipt(job).subscribe({ next: () => { time = clock.now(); }, error: e => { error = e; } });
  });
  if (expectedError) { assert(error, label); assert.equal(time, undefined); }
  else { assert.equal(error, undefined, label); assert.equal(time, expectedTime, label); }
  return calls;
}
assert.equal(runReceipt('ready immediately', () => rx.of({ data: [inventory()] }), 0), 1);
assert.equal(runReceipt('old LPN is not this receipt', n => rx.of({ data: [inventory({createInventoryTransactionId:n ? 12 : 11})] }), 750), 2);
runReceipt('wrong work order', n => rx.of({data:[inventory({workOrderId:n ? 4 : 9})]}), 750);
runReceipt('wrong exact LPN', n => rx.of({data:[inventory({lpn:n ? 'L1' : 'L10'})]}), 750);
runReceipt('transient lookup failure', n => n ? rx.of({data:[inventory()]}) : rx.throwError(()=>new Error('offline')), 750);
runReceipt('pending remains unconfirmed on deadline', () => rx.of({data:[]}), undefined, true);
assert.equal(runReceipt('slow request does not overlap', (n, clock) => rx.timer(2000,clock).pipe(rx.map(()=>({data:n ? [inventory()] : []}))), 4250), 2);
const cancelClock = new TestScheduler(assert.deepEqual);let cancelCalls = 0;
cancelClock.run(()=> { const s=new Receipt(); s.http={get:()=>{cancelCalls++;return rx.of({data:[]});}};const subscription=s.waitForReceipt(job).subscribe();cancelClock.schedule(()=>subscription.unsubscribe(),500); });
assert.equal(cancelCalls,1);
assert.throws(()=>new Receipt().waitForReceipt({...job,transactionId:0}));
const Printing = loadClass('src/app/routes/common/services/printing.service.ts','PrintingService',['printReportHistoryFromLocalAsync'],{HttpParams:Params,environment:{api:{baseUrl:'/'}},...rx});
(async()=>{
 const p = new Printing(); let printed=0;let downloads=0;
 p.warehouseService={getCurrentWarehouse:()=>({companyId:1,id:1})};p.companyService={getCurrentCompany:()=>({id:1})};p.tokenService={get:()=>({token:'test'})};p.getCurrentStationDefaultLabelPrinter=()=>'';p.getAllLocalPrinters=()=>[];
 p.lodop=Object.fromEntries(['SET_LICENSES','PRINT_INIT','SET_PRINTER_INDEX','ADD_PRINT_PDF','SET_PRINT_COPIES','SET_PRINT_MODE'].map(k=>[k,()=>{}]));p.lodop.PRINT=()=>{printed++;return 'task-id';};
 p.binaryHttp={get:()=>{downloads++;return rx.of(Uint8Array.from(Buffer.from('%PDF-1.4\ntest')).buffer);}};
 await p.printReportHistoryFromLocalAsync({fileName:'test.pdf',type:'label'});assert.equal(printed,1);
 const controller=new AbortController();controller.abort();await assert.rejects(()=>p.printReportHistoryFromLocalAsync({fileName:'test.pdf',type:'label'},2,controller.signal));assert.equal(printed,1);
 p.binaryHttp.get=()=>rx.of(Uint8Array.from(Buffer.from('{"error":"no PDF"}')).buffer);await assert.rejects(()=>p.printReportHistoryFromLocalAsync({fileName:'test.pdf',type:'label'}));assert.equal(printed,1);
 const Dashboard = loadClass('src/app/routes/work-order/production-line-dashboard/production-line-dashboard.component.ts','WorkOrderProductionLineDashboardComponent',['printConfirmedProduction','persistPendingLabelJob','saveWorkOrderProduceResults'],{...rx,PrintingStrategy:{LOCAL_PRINTER_SERVER_DATA:'local'}});
 const dashboard=new Dashboard();dashboard.printAbort=new AbortController();dashboard.printedLpns=new Set();dashboard.labelReports=new Map();dashboard.warehouseService={getCurrentWarehouse:()=>({id:1})};dashboard.refresh=()=>{};
 let generated=0;let labelCalls=[];let failSecond=true;
 dashboard.workOrderService={generatePrePrintLPNLabel:(_,lpn)=>{generated++;return rx.of({fileName:lpn+'.pdf'});}};
 dashboard.printingService={printReportHistoryFromLocalAsync:async report=>{labelCalls.push(report.fileName);if(report.fileName==='L2.pdf'&&failSecond)throw new Error('download failed');}};
 const batch={...job,labels:[...job.labels,{lpn:'L2',quantity:100}]};dashboard.pendingLabelJob=batch;
 await dashboard.printConfirmedProduction(batch);assert.equal(dashboard.productionJobRetry,true);assert.equal(dashboard.printedLpns.has('L1'),true);
 failSecond=false;await dashboard.printConfirmedProduction(batch);assert.deepEqual(labelCalls,['L1.pdf','L2.pdf','L2.pdf']);assert.equal(generated,2);assert.equal(dashboard.pendingLabelJob,undefined);
 const submitting=new Dashboard();let submissions=0;submitting.isProducing=false;submitting.produceInventoryModal={destroy:()=>{},updateConfig:()=>{}};submitting.warehouseConfiguration={newLPNPrintLabelAtProducingFlag:true,printingStrategy:'local'};submitting.printedLpns=new Set();submitting.labelReports=new Map();submitting.persistPendingLabelJob=()=>{};submitting.continueProductionLabelJob=()=>{};
 submitting.workOrderProduceTransactionService={saveWorkOrderProduceTransaction:()=>{submissions++;return rx.of({id:12,warehouseId:1,workOrder:{id:4},workOrderProducedInventories:[{lpn:'L1',quantity:100}]});}};
 submitting.saveWorkOrderProduceResults({productionLine:{name:'B02'}});submitting.saveWorkOrderProduceResults({productionLine:{name:'B02'}});assert.equal(submissions,1);assert.equal(submitting.pendingLabelJob.workOrderId,4);assert.equal(submitting.pendingLabelJob.transactionId,12);
 console.log('PASS: receipt correlation, immediate success, delayed success, query errors, deadline, no overlap, cancellation, async PDF validation and no print after cancellation/error. All API and printer calls mocked.');
})().catch(e=>{console.error(e);process.exitCode=1;});
