const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const ts=require('typescript');
const rx=require('rxjs');
const base='src/app/routes/qc/shift-report/';
const scope={exports:{},Intl,Date,...rx};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(base+'shift-report.model.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText,scope);
const validate=scope.exports.validateShiftReport;
const source=fs.readFileSync(base+'shift-report.component.ts','utf8');
const ast=ts.createSourceFile('component.ts',source,ts.ScriptTarget.Latest,true);
const component=ast.statements.find(n=>ts.isClassDeclaration(n));
const methods=component.members.filter(n=>(ts.isMethodDeclaration(n)||ts.isGetAccessorDeclaration(n))&&['search','clear','current','initializeRange','loadShifts','familyIds'].includes(n.name.getText(ast))).map(n=>n.getText(ast)).join('\n');
scope.validateShiftReport=validate;
vm.runInNewContext(ts.transpileModule('exports.TestComponent=class {'+methods+'}',{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText,scope);
const empty={snapshotId:'fixture-only',warehouseId:1,date:'2026-10-23',shift:'custom',schedule:null,timezone:'America/Chicago',startTime:'2026-10-23T11:30:00Z',endTime:'2026-10-25T23:45:12Z',generatedAt:'2026-10-26T00:00:00Z',rows:[],warnings:[],totals:{machines:0,firstSample:0,inline:0,finishedGoods:0,producedPallets:0,inspectedProducedPallets:0,inspectionRate:null}};
let cases=0;
const range={start:'2026-10-23T06:30',end:'2026-10-25T18:45:12'};
validate(empty,1,empty.date,'custom',range);cases++;
for(const change of [{end:'2026-10-25T18:45:11'},{start:'2026-10-23T11:30'},{end:'2026-10-24T18:45:12'}]){
 assert.throws(()=>validate(empty,1,empty.date,'custom',{...range,...change}));cases++;
}
assert.throws(()=>validate({...empty,schedule:{id:'1',start:'06:30:00',end:'18:30:00',nextDay:false}},1,empty.date,'custom',range));cases++;
function setup(){
 const c=new scope.exports.TestComponent();const requests=[];
 Object.assign(c,{selectedFamilyIds:[],itemFamilies:[],version:0,mode:'custom',date:'2026-10-23',shift:'1',shifts:[{id:'1',start:'18:30:00',end:'06:30:00',nextDay:true}],startLocal:range.start,endLocal:range.end,configWarehouse:1,warehouse:{getCurrentWarehouse:()=>({id:1,companyId:1})},t:k=>k,api:{get:(url,p)=>{requests.push({url,...p});return rx.of({data:structuredClone(empty)});}}});
 return {c,requests};
}
{
 const {c,requests}=setup();c.search();assert.equal(requests.length,1);
 assert.equal(requests[0].startLocal,range.start);assert.equal(requests[0].endLocal,range.end);
 assert.equal(requests[0].date,undefined);assert.equal(requests[0].shift,undefined);
 assert.equal(c.error,'');assert.equal(c.current,true);cases++;
 c.endLocal='2026-10-25T18:46';assert.equal(c.current,false);cases++;
 c.clear();assert.equal(c.report,undefined);cases++;
}
{
 const {c,requests}=setup();c.endLocal=c.startLocal;c.search();assert.equal(requests.length,0);assert.equal(c.error,'invalid-range');cases++;
}
{
 const {c,requests}=setup();c.mode='shift';c.api.get=(url,p)=>{requests.push(p);return rx.of({data:{...empty,shift:'1',schedule:c.shifts[0],endTime:'2026-10-24T11:30:00Z',startTime:'2026-10-23T23:30:00Z'}});};c.search();assert.equal(requests[0].date,'2026-10-23');assert.equal(requests[0].shift,'1');assert.equal(requests[0].startLocal,undefined);assert.equal(c.current,true);cases++;
}
{
 const {c}=setup();c.startLocal='';c.endLocal='';c.initializeRange();assert.equal(c.startLocal,'2026-10-23T18:30:00');assert.equal(c.endLocal,'2026-10-24T06:30:00');cases++;
}
{
 const {c}=setup();c.mode='shift';c.startLocal='';c.endLocal='';c.initializeRange();assert.equal(c.startLocal,'');cases++;
}
{
 const RealDate=Date;scope.Date=class extends RealDate {constructor(...args){super(...(args.length?args:['2026-10-24T00:30:00Z']));}};
 scope.validateShiftConfiguration=scope.exports.validateShiftConfiguration;
 const {c}=setup();const schedules=c.shifts;c.mode='shift';c.date='';c.startLocal='';c.endLocal='';c.api.get=()=>rx.of({data:{warehouseId:1,timezone:'America/Los_Angeles',shifts:schedules}});c.loadShifts();assert.equal(c.date,'2026-10-23');assert.equal(c.timezone,'America/Los_Angeles');cases++;
}
{
 const {c,requests}=setup();c.itemFamilies=[{id:2,name:'Plastic'},{id:3,name:'Packaging'}];c.selectedFamilyIds=[3,2,3];
 c.api.get=(url,p)=>{requests.push(p);return rx.of({data:{...empty,itemFamilyIds:[2,3],itemFamilyNames:['Plastic','Packaging']}});};
 c.search();assert.equal(requests[0].itemFamilyIds,'2,3');assert.equal(c.current,true);cases++;
 c.selectedFamilyIds=[];assert.equal(c.current,false);cases++;
}
{
 const {c,requests}=setup();c.selectedFamilyIds=[999];c.search();assert.equal(requests.length,0);cases++;
}
assert.throws(()=>validate({...empty,itemFamilyIds:[2],itemFamilyNames:['Plastic']},1,empty.date,'custom',range,[]));cases++;
console.log(`Passed ${cases} actual QC model/component checks; local wall clocks are sent unchanged and stale exports are blocked.`);
