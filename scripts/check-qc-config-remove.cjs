const fs=require('node:fs'),assert=require('node:assert/strict'),ts=require('typescript');
const rx=require('rxjs');
const source=ts.createSourceFile('page.ts',fs.readFileSync('src/app/routes/work-order/qc-rule-configuration/qc-rule-configuration.component.ts','utf8'),ts.ScriptTarget.Latest,true);
const cls=source.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='WorkOrderQcRuleConfigurationComponent');
const names=['removeQCRuleConfiguration','trackDetail','loadWarehouse','refreshDetailInformation','refreshDetailInformations','delay'];
const methods=cls.members.filter(n=>n.name&&names.includes(n.name.getText(source))).map(n=>n.getText(source));
const Checked=new Function('timeout','finalize','formatDate',ts.transpile('class Checked {'+methods.join('\n')+'}',{target:ts.ScriptTarget.ES2022})+';return Checked;')(()=>rx.timeout(5),rx.finalize,()=> 'test-time');
function setup(response=rx.of('deleted')){
 const c=new Checked();let submissions=0,reloads=0;
 c.isSpinning=false;c.displayOnly=false;c.loadingQCConfigurationDetailsRequest=0;c.detailLoadWarnings=0;
 c.listOfAllQCRuleConfiguration=[{id:161},{id:165},{id:171},{id:172}];
 c.i18n={fanyi:(key,args)=>key+JSON.stringify(args||{})};c.st={reload(){reloads++}};
 c.workOrderQcRuleConfigurationService={removeQCRuleConfiguration:()=>{submissions++;return response}};
 for(const name of ['loadOrder','loadCustomer','loadItem','loadItemFamily','loadInventoryStatus','loadInventoryLock'])c[name]=()=>{};
 return {c,submissions:()=>submissions,reloads:()=>reloads};
}
(async()=>{
 let x=setup();x.c.removeQCRuleConfiguration({id:161});assert.deepEqual(x.c.listOfAllQCRuleConfiguration.map(x=>x.id),[165,171,172]);assert.equal(x.c.isSpinning,false);assert.match(x.c.removeMessage,/qc-config.removed.*161/);assert.equal(x.reloads(),1);assert.equal(x.submissions(),1);
 const pending=new rx.Subject();x=setup(pending);x.c.removeQCRuleConfiguration({id:161});x.c.removeQCRuleConfiguration({id:165});assert.equal(x.submissions(),1);assert.equal(x.c.listOfAllQCRuleConfiguration.length,4);pending.next('deleted');pending.complete();assert.equal(x.c.isSpinning,false);assert.equal(x.c.listOfAllQCRuleConfiguration.length,3);
 for(const response of [rx.throwError(()=>new Error('reject')),rx.EMPTY]){x=setup(response);x.c.removeQCRuleConfiguration({id:161});assert.equal(x.c.isSpinning,false);assert.equal(x.c.listOfAllQCRuleConfiguration.length,4);assert.match(x.c.removeMessage,/remove-unknown/);assert.equal(x.reloads(),0);}
 x=setup(rx.NEVER);x.c.removeQCRuleConfiguration({id:161});await new Promise(r=>setTimeout(r,15));assert.equal(x.c.isSpinning,false);assert.equal(x.c.listOfAllQCRuleConfiguration.length,4);assert.equal(x.submissions(),1);assert.match(x.c.removeMessage,/remove-unknown/);
 x=setup();x.c.displayOnly=true;x.c.removeQCRuleConfiguration({id:161});assert.equal(x.submissions(),0);
 for(const response of [rx.throwError(()=>new Error('lookup failed')),rx.NEVER]){x=setup();x.c.localCacheService={getWarehouse:()=>response};await x.c.refreshDetailInformations([{id:165,warehouseId:1}]);assert.equal(x.c.loadingQCConfigurationDetailsRequest,0);assert.equal(x.c.detailLoadWarnings,1);assert.equal(x.reloads(),1);}
 x=setup();const row={id:165,warehouseId:1};x.c.localCacheService={getWarehouse:()=>rx.of({name:'WMEC'})};await x.c.refreshDetailInformations([row]);assert.equal(row.warehouse.name,'WMEC');assert.equal(x.c.loadingQCConfigurationDetailsRequest,0);assert.equal(x.c.detailLoadWarnings,0);
 console.log('PASS: confirmed row-only removal, indistinguishable rows retained, duplicate suppression, error/empty/timeout keeps data and unlocks UI, read-only guard, failed/timed-out reference loads cannot block table refresh. No live DELETE requests.');
})().catch(e=>{console.error(e);process.exitCode=1});
