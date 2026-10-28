const fs=require('fs'),vm=require('vm'),assert=require('assert');
const ts=require('/app/node_modules/typescript');
const source=fs.readFileSync('/app/src/app/routes/outbound/order/order.component.ts','utf8');
const start=source.indexOf('  openingUnpickId:');const end=source.indexOf('  cancelShortAllocation(',start);
assert(start>0&&end>start);
const code=ts.transpileModule('class Harness { '+source.slice(start,end)+' }; globalThis.Harness=Harness;', {compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText;
const context={setTimeout,Promise,UntypedFormControl:class {constructor(v){this.value=v.value;}}};vm.createContext(context);vm.runInContext(code,context);
async function main(){
 const h=new context.Harness();let modals=0,sends=0,refresh=0,subscriber,config;
 h.fb={group:v=>({value:Object.fromEntries(Object.entries(v).map(([k,v])=>[k,v instanceof Array?v[0]:v.value]))})};
 const messages=[];h.messageService={success:s=>messages.push(s),error:s=>messages.push(s),warning:s=>messages.push(s)};
 h.i18n={fanyi:s=>s};h.search=()=>refresh++;h.modalService={create:c=>{modals++;config=c;return {destroy(){},updateConfig(v){Object.assign(config,v);}}}};
 h.inventoryService={unpick:()=>{sends++;return {subscribe:s=>subscriber=s}}};
 const inv={id:9,lpn:'LPN-TEST',quantity:36,locationName:'STAGE'};
 h.openUnpickModal({},inv,null,null);assert.equal(h.openingUnpickId,9);
 h.openUnpickModal({},inv,null,null);await new Promise(r=>setTimeout(r,10));assert.equal(modals,1);assert.equal(h.openingUnpickId,null);assert.equal(h.unpickForm.value.itemNumber,'—');
 assert.equal(await config.nzOnOk(),false);assert.equal(sends,0);
 h.unpickForm.value.destinationLocation=' C1 ';const pending=config.nzOnOk();assert.equal(sends,1);assert.equal(config.nzCancelDisabled,true);
 assert.equal(await config.nzOnOk(),false);assert.equal(sends,1);
 subscriber.error();assert.equal(await pending,false);assert.equal(config.nzCancelDisabled,false);assert(messages.some(x=>x.includes('could not be confirmed')));
 const done=config.nzOnOk();subscriber.next();assert.equal(await done,true);assert.equal(refresh,1);
 console.log('PASS Unpick feedback: immediate busy state, one modal, missing details, validation, duplicate submit, failure retention and successful refresh');
}
main().catch(e=>{console.error(e);process.exit(1)});
