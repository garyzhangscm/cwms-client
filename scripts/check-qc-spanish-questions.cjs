const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
const cache=new Map(),i18n={fanyi:key=>key,currentLang:'en-US'};
function load(file){
 file=path.resolve(file);if(cache.has(file))return cache.get(file);
 const out={exports:{}};cache.set(file,out.exports);
 const req=name=>{
  if(name==='@angular/core')return{Component:()=>t=>t,inject:()=>i18n,ViewChild:()=>()=>{}};
  if(name.startsWith('.')){let target=path.resolve(path.dirname(file),name);if(!target.endsWith('.ts'))target+='.ts';return load(target);}
  return new Proxy({},{get:()=>class{}});
 };
 vm.runInNewContext(ts.transpile(fs.readFileSync(file,'utf8'),{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,experimentalDecorators:true}),{exports:out.exports,require:req,setTimeout:()=>{}},{filename:file});return out.exports;
}
const {localizedQcQuestion:question}=load('src/app/routes/qc/models/qc-question-text.ts');
const {QC_QUESTION_ES_FALLBACK:catalog}=load('src/app/routes/qc/models/qc-question-es-fallback.ts');
const {QcInspectByRequestComponent:Page}=load('src/app/routes/qc/inspect-by-request/inspect-by-request.component.ts');
const page=new Page({}, {}, {warning(){}}, {}, {}, {}, {}, {snapshot:{data:{}}});
let checks=0;
for(const [identity,text] of Object.entries(catalog)){
 const rule=Object.freeze({id:Number(identity),checkPoint:text.english});
 const before=JSON.stringify(rule);
 for(const lang of ['es-ES','es-MX','ES-US'])assert.equal(question(rule,lang),text.spanish);
 for(const lang of ['en-US','zh-CN'])assert.equal(question(rule,lang),text.english);
 assert.equal(question({...rule,checkPointEs:'  '},'es-ES'),text.english);
 assert.equal(question({...rule,checkPointEs:null},'es-ES'),text.english);
 assert.equal(question({...rule,checkPointEs:'Traducción actualizada'},'es-ES'),'Traducción actualizada');
 assert.equal(question({...rule,checkPoint:text.english+' edited'},'es-ES'),text.english+' edited');
 assert.equal(question({...rule,id:999999},'es-ES'),text.english);
 assert.equal(JSON.stringify(rule),before);checks++;
}
// Exercise the unchanged real inspection calculation for both positive and negative standards.
for(const expected of ['true','false'])for(const answer of ['YES','NO','PENDING']){
 const outputs=[];
 for(const lang of ['en-US','es-ES']){
  i18n.currentLang=lang;
  const rule=Object.freeze({id:16,checkPoint:catalog[16].english,qcRuleItemType:'YESNO',qcRuleItemComparator:'EQUAL',expectedValue:expected,enabled:true});
  const option={id:16,value:answer,qcInspectionResult:'PENDING',qcRuleItem:rule};
  const group={qcInspectionRequestItemOptions:[option],qcInspectionResult:'PENDING'};
  page.qcInspectionRequest={qcInspectionRequestItems:[group],qcInspectionResult:'PENDING'};
  question(rule,lang);page.qcInspectionRequestItemOptionChanged(group,option);
  outputs.push(JSON.stringify({actual:option.booleanValue,result:option.qcInspectionResult,overall:page.qcInspectionRequest.qcInspectionResult,standard:rule.expectedValue,comparator:rule.qcRuleItemComparator}));
 }
 assert.equal(outputs[0],outputs[1]);
 const result=JSON.parse(outputs[1]).result;
 assert.equal(result,answer==='PENDING'?'PENDING':((answer==='YES')===(expected==='true')?'PASS':'FAIL'));
}
for(const file of ['qc-rule-configuration/qc-rule-configuration.component.html','qc-rule-configuration-maintenance/qc-rule-configuration-maintenance.component.html']){
 const html=fs.readFileSync('src/app/routes/work-order/'+file,'utf8');assert(!html.includes('{{ qcRuleItem.checkPoint }}'));assert(html.includes('{{ qcRuleItem | qcQuestion }}'));
}
for(const file of ['inspect-by-request/inspect-by-request.component.html','inspect-inventory/inspect-inventory.component.html'])assert(fs.readFileSync('src/app/routes/qc/'+file,'utf8').includes('option.qcRuleItem | qcQuestion'));
console.log(`PASS: ${checks} audited questions, missing-field DTO compatibility, explicit-clear/edited-text guards, ES variants, English fallback, immutable standards and actual positive/negative/Pending results`);
