const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const requireProject = createRequire(process.cwd() + '/package.json');
const ts = requireProject('typescript');
const rx = requireProject('rxjs');
const source = fs.readFileSync('src/app/routes/outbound/services/pick.service.ts', 'utf8');
const ast = ts.createSourceFile('service.ts', source, ts.ScriptTarget.Latest, true);
const service = ast.statements.find(n => ts.isClassDeclaration(n) && n.name.text === 'PickService');
const names = ['getPicksByWorkOrder', 'getPicksByWorkOrderAndProductionLine', 'workOrderLineFilter', 'getPicks', 'getPicksByOrder'];
const methods = service.members.filter(n => ts.isMethodDeclaration(n) && names.includes(n.name.getText(ast))).map(n => n.getText(ast)).join('\n');
class HttpParams {
  constructor(values = {}) { this.values = values; }
  append(key, value) { return new HttpParams({...this.values, [key]:value}); }
}
const scope = {exports:{}, HttpParams, ...rx};
vm.runInNewContext(ts.transpileModule('exports.TestService = class {' + methods + '}', {compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText, scope);
function setup() {
  const c = new scope.exports.TestService();
  const requests = [];
  c.http = {get:(url,params) => {requests.push({url,...params.values});return rx.of({data:[{id:9}]});}};
  c.warehouseService = {getCurrentWarehouse:() => ({id:77})};
  return {c,requests};
}
let cases = 0;
for (const lines of [undefined,null,[],[{}],[{id:null}],[{id:undefined}],[null],[{id:0}],[{id:-1}],[{id:NaN}],[{id:1.5}]]) {
  for (const machine of [false,true]) {
    const {c,requests} = setup();const order={workOrderLines:lines};let result;
    (machine?c.getPicksByWorkOrderAndProductionLine(order,{inboundStageLocationId:51}):c.getPicksByWorkOrder(order)).subscribe(value=>result=value);
    assert.equal(result.length,0);assert.equal(requests.length,0);cases++;
  }
}
for (const machine of [false,true]) {
  const {c,requests}=setup();const order={workOrderLines:[{},null,{id:11},{id:22},{id:0}]};let result;
  (machine?c.getPicksByWorkOrderAndProductionLine(order,{inboundStageLocationId:51}):c.getPicksByWorkOrder(order)).subscribe(value=>result=value);
  assert.equal(result[0].id,9);assert.equal(requests.length,1);assert.equal(requests[0].workOrderLineIds,'11,22');assert.equal(requests[0].warehouseId,77);
  if(machine)assert.equal(requests[0].destinationLocationId,51);cases++;
}
{
  const {c,requests}=setup();c.getPicksByOrder(31).subscribe();assert.equal(requests[0].orderId,31);assert.equal(requests[0].warehouseId,77);cases++;
}
console.log(`Passed ${cases} actual work-order pick service cases; empty scope sends no HTTP request.`);
