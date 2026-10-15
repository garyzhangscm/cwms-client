const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
const cache=new Map();
function load(file){
 file=path.resolve(file);if(cache.has(file))return cache.get(file);
 const out={exports:{}};cache.set(file,out.exports);
 const fakeCore={Component:()=>target=>target,inject:()=>({fanyi:key=>key}),ViewChild:()=>()=>{}};
 const req=name=>{
  if(name==='@angular/core')return fakeCore;
  if(name.startsWith('.')){let target=path.resolve(path.dirname(file),name);if(!target.endsWith('.ts'))target+='.ts';return load(target);}
  return new Proxy({},{get:()=>class{}});
 };
 vm.runInNewContext(ts.transpile(fs.readFileSync(file,'utf8'),{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,experimentalDecorators:true}),{exports:out.exports,require:req,setTimeout:()=>{}},{filename:file});return out.exports;
}
const {QcInspectByRequestComponent:Page}=load('src/app/routes/qc/inspect-by-request/inspect-by-request.component.ts');
let saves=[],notices=[],callbacks;
const api={saveQCInspectionRequest:(...args)=>{saves.push(args);return{subscribe:cb=>callbacks=cb};}};
const create=()=>new Page({}, {},{warning:m=>notices.push(m)}, {navigateByUrl:()=>{}},{getCurrentWarehouse:()=>({id:1})},{},api,{snapshot:{data:{}}});
function setup(actual){
 const p=create(),o={id:1,value:actual,qcInspectionResult:'PENDING',qcRuleItem:{enabled:true,checkPoint:'Packaging problem?',qcRuleItemType:'YESNO',expectedValue:'false',qcRuleItemComparator:'EQUAL'}};
 const g={qcInspectionRequestItemOptions:[o],qcInspectionResult:'PENDING'};
 p.qcInspectionRequest={id:1,qcInspectionRequestItems:[g],qcInspectionResult:'PENDING'};
 p.qcInspectionRequestItemOptionChanged(g,o);return{p,o};
}
let {p,o}=setup('YES');assert.equal(o.qcInspectionResult,'FAIL');
p.nextStep();assert.equal(p.stepIndex,0);assert.equal(notices.length,1);
o.exceptionNotes='Outer wrap torn';p.nextStep();assert.equal(p.stepIndex,1);
p.confirm();assert.equal(p.failureConfirmationVisible,true);assert.equal(saves.length,0);
p.failureConfirmationVisible=false;assert.equal(o.value,'YES');assert.equal(o.exceptionNotes,'Outer wrap torn');
p.confirm();p.confirm(true);assert.equal(saves.length,1);assert.equal(saves[0][1],true);assert.equal(saves[0][2],true);assert.equal(saves[0][3],false);assert.equal(p.qcInspectionRequest.qcInspectionResult,'FAIL');
p.confirm(true);assert.equal(saves.length,1);callbacks.error();assert.equal(p.isSpinning,false);assert.equal(o.exceptionNotes,'Outer wrap torn');
({p,o}=setup('NO'));assert.equal(o.qcInspectionResult,'PASS');p.nextStep();p.confirm();assert.equal(saves.length,2);assert.equal(p.failureConfirmationVisible,false);assert.equal(saves[1][2],false);
({p,o}=setup('YES'));o.exceptionNotes='  ';p.confirm(true);assert.equal(saves.length,2);
o.value='PENDING';p.qcInspectionRequestItemOptionChanged(p.qcInspectionRequest.qcInspectionRequestItems[0],o);assert.equal(o.booleanValue,undefined);assert.equal(p.qcInspectionRequest.qcInspectionResult,'PENDING');
console.log('PASS: actual inspection flow, failing No expectation, required notes before Next and save, one final confirmation, unchanged actual answers, acknowledged request, duplicate-click guard, request error recovery, passing answer and cleared pending value');
