// Exercise the real service methods with simulated HTTP; never change business data.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const requireProject = createRequire(process.cwd() + '/package.json');
const ts = requireProject('typescript');
const rx = requireProject('rxjs');
const source = fs.readFileSync('src/app/routes/outbound/services/order.service.ts', 'utf8');
const ast = ts.createSourceFile('service.ts', source, ts.ScriptTarget.Latest, true);
const service = ast.statements.find(n => ts.isClassDeclaration(n) && n.name.text === 'OrderService');
const methods = service.members.filter(n => ts.isMethodDeclaration(n) && ['getOrders', 'normalizeOrderSearchNumber'].includes(n.name.getText(ast))).map(n => n.getText(ast)).join('\n');
class HttpParams {
  constructor(values = {}) { this.values = values; }
  append(key, value) { return this.set(key, value); }
  delete(key) { const values = {...this.values}; delete values[key]; return new HttpParams(values); }
  set(key, value) { return new HttpParams({...this.values, [key]:value}); }
}
const scope = {exports:{}, HttpParams, ...rx};
vm.runInNewContext(ts.transpileModule('exports.TestService = class {' + methods + '}', {compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText, scope);
function setup(responses) {
  const c = new scope.exports.TestService();
  const requests = [];
  c.http = {get: (url, params) => { requests.push({url, ...params.values}); return rx.of({data:responses.shift()}); }};
  c.warehouseService = {getCurrentWarehouse: () => ({id:7})};
  c.dateTimeService = {getLocalDateString: () => 'date'};
  return {c, requests};
}
function query(c, number, enabled = true) {
  let result;
  c.getOrders(number, false, 'OPEN', undefined, undefined, undefined, undefined, undefined, 12, undefined, undefined, undefined, undefined, 9, 'PO', enabled).subscribe(value => result = value);
  return result;
}
{
  const {c,requests} = setup([[{id:1,number:'E123'}]]);
  assert.equal(query(c,' E123\u00a0')[0].id,1);
  assert.equal(requests.length,1);assert.equal(requests[0].number,'E123');
}
{
  const {c,requests} = setup([[],[{id:1,number:'E123\u00a0'}, {id:2,number:'\u200bE123\u2060'}, {id:3,number:'E1234'}, {id:4,number:'XE123'}, {id:5,number:'E 123'}]]);
  const result = query(c,'\u200bE123\u00a0');
  assert.equal(result.map(row=>row.id).join(','),'1,2');
  assert.equal(requests.length,2);assert.equal(requests[1].number,undefined);
  for (const key of ['warehouseId','status','customerId','clientId','poNumber','loadDetails']) assert.equal(requests[1][key],requests[0][key]);
}
for (const number of [undefined,'\u00a0\u200b','E12*']) {
  const {c,requests}=setup([[]]);query(c,number);assert.equal(requests.length,1);
  if(number!=='E12*') assert.equal(requests[0].number,undefined);
}
{
  const {c,requests}=setup([[]]);query(c,'E123',false);assert.equal(requests.length,1);
}
{
  const {c}=setup([[]]);let failed=false;
  c.http.get=()=>rx.throwError(()=>new Error('network'));
  c.getOrders('E123',false,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,true).subscribe({error:()=>failed=true});
  assert.equal(failed,true);
}
console.log('Passed: normal exact lookup, NBSP/invisible edge fallback, full-number filtering, retained filters, blank/wildcard handling, opt-in scope, request errors.');
