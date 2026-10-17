// Only mocked HTTP calls: these checks never write to a server.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const ts = require('typescript');
const { of, map } = require('rxjs');
const cases = [
 ['src/app/routes/auth/services/user.service.ts','UserService','resetPassword', ['10','test-only-password',true], 'resource/users/10/password-reset?companyId=1'],
 ['src/app/routes/work-order/services/work-order-complete-transaction.service.ts','WorkOrderCompleteTransactionService','saveWorkOrderCompleteTransaction', [{}], 'workorder/work-order-complete-transactions?warehouseId=1'],
 ['src/app/routes/work-order/services/work-order.service.ts','WorkOrderService','removeWorkOrders', [[{id:10}]], 'workorder/work-orders'],
];
for (const production of [false,true]) {
 for (const [file,name,method,args,url] of cases) {
  const ast=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true);
  const cls=ast.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text===name);
  const member=cls.members.find(n=>n.name?.getText(ast)===method).getText(ast);
  const js=ts.transpile(`class Tested { ${member} }`,{target:ts.ScriptTarget.ES2022});
  const Tested=new Function('environment','map',js+'; return Tested;')({production},map);
  const service=new Tested(); const requests=[];
  service.companyService={getCurrentCompany:()=>({id:1})};
  service.warehouseService={getCurrentWarehouse:()=>({id:1})};
  service.http={post:(...args)=>{requests.push(args);return of({data:{}});},delete:(...args)=>{requests.push(args);return of({data:{}});}};
  service[method](...args).subscribe();assert.equal(requests.length,1);assert.equal(requests[0][0],url);
  if(method==='removeWorkOrders')assert.deepEqual(requests[0][1],{warehouseId:1,workOrderIds:'10'});
 }
}
const proxy=require('../proxy.conf.js');
assert.ok(['http:', 'https:'].includes(new URL(proxy['/api/**'].target).protocol), 'shared backend gateway must be configured');
assert.ok(!Object.keys(proxy).some(key=>/password-reset-test|completion-test|deletion-test/.test(key)));
console.log('PASS: test and production share reset, completion and guarded deletion routes; no legacy preview proxy. All HTTP calls mocked.');
