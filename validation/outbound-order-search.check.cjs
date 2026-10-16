// Runs the actual component methods with simulated requests; no business API calls.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const requireProject = createRequire(process.cwd() + '/package.json');
const ts = requireProject('typescript');
const rx = requireProject('rxjs');
const { TestScheduler } = requireProject('rxjs/testing');
const source = fs.readFileSync('src/app/routes/outbound/order/order.component.ts', 'utf8');
const ast = ts.createSourceFile('order.ts', source, ts.ScriptTarget.Latest, true);
const component = ast.statements.find(n => ts.isClassDeclaration(n) && n.name.text === 'OutboundOrderComponent');
const names = new Set(['search', 'resetForm', 'ngOnDestroy', 'cancelDetailLoading', 'trackOrderDetail', 'calculateQuantities', 'refreshDetailInformations', 'delay', 'loadOrderLineInfo', 'calculateOrderLineDisplayQuantity', 'calculateStatisticQuantities', 'removeOrder']);
const methods = component.members.filter(n => ts.isMethodDeclaration(n) && names.has(n.name.getText(ast))).map(n => n.getText(ast)).join('\n');
const output = ts.transpileModule('exports.SubjectUnderTest = class SubjectUnderTest {' + methods + '}', {compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const scope = {exports:{}, ...rx, formatDate:()=> 'now', console, setTimeout};
vm.runInNewContext(output, scope);
function setup() {
  const c = new scope.exports.SubjectUnderTest();
  const queries = [];
  Object.assign(c, {
    allocationSubscriptions:new Map(), restoreAllocationResults:()=>{}, searching:false, searchError:'', detailWarning:'', detailLoadVersion:0,
    detailSubscriptions:new rx.Subscription(), loadingOrderDetailsRequest:0,
    listOfAllOrders:[], listOfDisplayOrders:[], searchForm:{value:{},reset(){}},
    i18n:{fanyi:(_key,args)=>String(args.rowCount)}, st:{reload(){}},
    orderService:{getOrders:()=>{const s=new rx.Subject();queries.push(s);return s;}}
  });
  c.refreshDetailInformations=async()=>{};
  return {c,queries};
}
const {c,queries} = setup();
c.search(); assert.equal(c.searching,true);
queries[0].next([{id:1}]);queries[0].complete();
assert.equal(c.searching,false);assert.equal(c.listOfAllOrders.length,1);assert.equal(c.listOfAllOrders[0].totalLineCount,0);
c.search();queries[1].error(new Error('network'));
assert.equal(c.searching,false);assert.ok(c.searchError);assert.equal(c.listOfAllOrders.length,1);
c.search();c.search();assert.equal(queries[2].observed,false);
queries[2].next([{id:99}]);assert.equal(c.listOfAllOrders[0].id,1);
queries[3].next([{id:2,orderLines:[]}]);queries[3].complete();assert.equal(c.listOfAllOrders[0].id,2);
c.search();c.resetForm();assert.equal(queries.at(-1).observed,false);assert.equal(c.searching,false);assert.equal(c.listOfAllOrders.length,0);
const scheduler = new TestScheduler(()=>{});
scheduler.run(({flush})=>{c.search();flush();assert.equal(c.searching,false);assert.match(c.searchError,/timed out/);});
let detail = new rx.Subject();c.trackOrderDetail(detail,()=>{});assert.equal(c.loadingOrderDetailsRequest,1);detail.error(new Error('network'));assert.equal(c.loadingOrderDetailsRequest,0);assert.ok(c.detailWarning);
c.trackOrderDetail(rx.EMPTY,()=>{});assert.equal(c.loadingOrderDetailsRequest,0);
c.trackOrderDetail(rx.of({}),()=>{throw new Error('invalid detail');});assert.equal(c.loadingOrderDetailsRequest,0);
new TestScheduler(()=>{}).run(({flush})=>{c.trackOrderDetail(rx.NEVER,()=>{});flush();assert.equal(c.loadingOrderDetailsRequest,0);});
c.localCacheService={getItem:()=>rx.throwError(()=>new Error('item failed')),getInventoryStatus:()=>rx.throwError(()=>new Error('status failed'))};
c.loadOrderLineInfo({itemId:1,inventoryStatusId:1});assert.equal(c.loadingOrderDetailsRequest,0);
c.shipmentLineService={getShipmentLinesByOrder:()=>rx.throwError(()=>new Error('shipment failed'))};
c.pickService={getPicksByOrder:()=>rx.throwError(()=>new Error('picks failed'))};
c.calculateStatisticQuantities({id:1,orderLines:[]});assert.equal(c.loadingOrderDetailsRequest,0);
detail=new rx.Subject();c.trackOrderDetail(detail,()=>{});c.ngOnDestroy();assert.equal(detail.observed,false);assert.equal(c.loadingOrderDetailsRequest,0);
console.log('Passed: query success/error/timeout, latest search wins, Clear cancellation, missing arrays, detail errors/empty/timeout, shipment and item failure counters, teardown.');

// Background detail hydration must not scroll back to the top or revive an obsolete search.
(async () => {
  const {c} = setup();
  delete c.refreshDetailInformations;
  const reloads = [];
  c.st.reload = (...args) => reloads.push(args);
  c.refreshDetailInformation = () => {};
  await c.refreshDetailInformations([{id:1}]);
  assert.equal(reloads.length, 1);
  assert.equal(reloads[0][1].toTop, false);
  reloads.length = 0;
  c.refreshDetailInformation = () => { c.detailLoadVersion++; };
  await c.refreshDetailInformations([{id:2}]);
  assert.equal(reloads.length, 0);
  console.log('Passed: background detail refresh keeps scroll position and ignores obsolete searches.');
})().catch(error => { console.error(error); process.exitCode = 1; });

// The first delete click must issue one request and give immediate visible success/failure.
{
  const {c} = setup();
  const notices = [], requests = [];
  c.removingOrderIds = new Set();
  c.messageService = {success:message=>notices.push(['success',message]), error:message=>notices.push(['error',message])};
  let reloads = 0;
  c.search = () => reloads++;
  c.listOfAllOrders = [{id:1,number:'ORDER-1'},{id:2,number:'ORDER-2'}];
  c.listOfDisplayOrders = [...c.listOfAllOrders];
  c.orderService.removeOrder = () => {const result=new rx.Subject(); requests.push(result); return result;};
  c.removeOrder(c.listOfAllOrders[0]);
  c.removeOrder(c.listOfAllOrders[0]);
  assert.equal(requests.length,1); assert.equal(c.isSpinning,true);
  requests[0].next(null); requests[0].complete();
  assert.equal(c.listOfAllOrders.length,1); assert.equal(c.listOfAllOrders[0].id,2);
  assert.equal(c.listOfDisplayOrders.length,1); assert.equal(reloads,1);
  assert.equal(c.isSpinning,false); assert.equal(c.removingOrderIds.size,0); assert.equal(notices[0][0],'success');
  c.removeOrder(c.listOfAllOrders[0]); requests[1].error(new Error('rejected'));
  assert.equal(c.listOfAllOrders.length,1); assert.equal(c.isSpinning,false); assert.equal(notices.at(-1)[0],'error');
  c.orderService.removeOrder = () => rx.EMPTY;
  c.removeOrder(c.listOfAllOrders[0]); assert.equal(c.isSpinning,false); assert.equal(notices.at(-1)[0],'error');
  c.orderService.removeOrder = () => rx.NEVER;
  new TestScheduler(()=>{}).run(({flush}) => {c.removeOrder(c.listOfAllOrders[0]);flush();});
  assert.equal(c.isSpinning,false); assert.equal(c.removingOrderIds.size,0); assert.equal(c.listOfAllOrders.length,1);
  console.log('Passed: first delete issues one request, repeated click blocked, success removes row immediately, rejection/empty response/timeout restore UI.');
}
