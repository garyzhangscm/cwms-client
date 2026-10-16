// Source-grounded component checks using mock requests only.
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const {createRequire} = require('node:module');
const projectRequire = createRequire(process.cwd()+'/package.json');
const ts = projectRequire('typescript'), rx = projectRequire('rxjs');
const source = fs.readFileSync('src/app/routes/outbound/order-maintenance/order-maintenance.component.ts','utf8');
const ast = ts.createSourceFile('component.ts',source,ts.ScriptTarget.Latest,true);
const cls = ast.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='OutboundOrderMaintenanceComponent');
const names = ['onOrderNumberInput','validateOrderNumberInput','orderNumberChange','passValidation','nextStep','confirm'];
const methods = cls.members.filter(n=>ts.isMethodDeclaration(n)&&names.includes(n.name.getText(ast))).map(n=>n.getText(ast)).join('\n');
const scope = {exports:{},...rx,setTimeout:()=>{},console};
vm.runInNewContext(ts.transpileModule('exports.TestComponent=class {'+methods+'}',{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText,scope);
function setup(){
 const c=new scope.exports.TestComponent(), requests=[], writes=[], errors=[];
 Object.assign(c,{currentOrder:{number:'',shipToCustomer:{}},orderNumberValidationVersion:0,orderNumberValidateStatus:'warning',stepIndex:0,shipStageLocationStatus:'success',shipStageLocationGroupStatus:'success',existingCustomer:'true',isSpinning:false,
 orderService:{getOrders:()=>{const s=new rx.Subject();requests.push(s);return s;},addOrder:o=>{writes.push(o.number);return rx.of({});}},
 i18n:{fanyi:key=>key},messageService:{error:m=>errors.push(m),success:()=>{}},isOutsourcingOrder:()=>false,copyAddressInformation:()=>{}});
 return {c,requests,writes,errors};
}
for(const value of [' ABC DEF ','ABC\u00a0DEF','ABC\u200bDEF','ABC\tDEF','ABC\nDEF']){
 const {c,requests,writes}=setup();c.onOrderNumberInput(value);assert.equal(c.orderNumberValidateStatus,'whitespace');
 c.orderNumberChange({target:{value}});assert.equal(requests.length,0);c.nextStep();assert.equal(c.stepIndex,0);
 c.confirm();assert.equal(writes.length,0);assert.equal(c.isSpinning,false);
}
for(const value of ['  ABC-123  ','\u00a0\u200bABC-123\u2060']){
 const {c,requests,writes}=setup();c.onOrderNumberInput(value);const input={value};c.orderNumberChange({target:input});
 assert.equal(input.value,'ABC-123');assert.equal(c.currentOrder.number,'ABC-123');assert.equal(c.orderNumberValidateStatus,'validating');
 c.confirm();assert.equal(writes.length,0);requests[0].next([]);requests[0].complete();c.nextStep();assert.equal(c.stepIndex,1);
 c.confirm();assert.equal(writes.join(','),'ABC-123');
}
{
 const {c,requests}=setup();c.orderNumberChange({target:{value:'ABC'}});c.onOrderNumberInput('ABC DEF');requests[0].next([]);assert.equal(c.orderNumberValidateStatus,'whitespace');
}
{
 const {c,requests}=setup();c.orderNumberChange({target:{value:'ABC'}});requests[0].next([{id:2}]);assert.equal(c.orderNumberValidateStatus,'numberExists');
 c.orderNumberChange({target:{value:'ABC'}});requests[1].error(new Error('network'));assert.equal(c.orderNumberValidateStatus,'checkFailed');
}
{
 const {c,writes}=setup();c.currentOrder={id:2,number:'\u00a0EDIT-1 ',shipToCustomer:{}};c.orderNumberValidateStatus='success';c.confirm();assert.equal(writes[0],'EDIT-1');
 c.currentOrder.number='EDIT 1';c.confirm();assert.equal(writes.length,1);
}
{
 const {c,writes}=setup();c.currentOrder.number='\u00a0\u200b ';c.orderNumberValidateStatus='success';c.confirm();assert.equal(c.orderNumberValidateStatus,'required');assert.equal(writes.length,0);
}
console.log('Passed: edge trimming, internal whitespace errors, blank/pending/duplicate blocks, final save guard for create/edit, stale validation, failed uniqueness check; no business API calls.');
