const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
const source=fs.readFileSync('src/app/routes/inventory/preprinted-lpns/preprinted-lpns.component.ts','utf8');
const exportsObject={},storage=new Map();
vm.runInNewContext(ts.transpile(source,{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,experimentalDecorators:true}),{
 exports:exportsObject,require:n=>n==='@angular/core'?{Component:()=>x=>x}:n==='rxjs'?{firstValueFrom:v=>v}:n.endsWith('report-type.enum')?{ReportType:{PREPRINTED_LPN_LABEL:'PREPRINTED_LPN_LABEL'}}:{},
 sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},console,Set,Error});
const Component=exportsObject.PreprintedLpnsComponent;
let calls=[],prints=[],fail=false,configured=true,warehouse={id:1,companyId:1};
const history={id:7,fileName:'batch.lbl',description:'LPN-1-L000000001 | 2'};
const http={get:async(url,params)=>{calls.push({url,params,method:'GET'});return{data:url==='resource/reports'?(configured?[{warehouseId:1}]:[]):url.includes('batch/next')?['L000000001','L000000002']:url.endsWith('/details')?{count:2}:{items:[history],hasMore:false}};},
 post:async(url,data,params)=>{calls.push({url,data,params,method:'POST'});if(fail)throw Error('timeout');return{data:url.endsWith('/range')?{fileName:'range.lbl'}:history};}};
(async()=>{
 const c=new Component(http,{getCurrentWarehouse:()=>warehouse},{getCurrentUsername:()=> 'TEST'}, {printFileByName:(...a)=>prints.push(a)},{success:()=>{}},{fanyi:x=>x});
 c.ngOnInit();await Promise.resolve();await Promise.resolve();c.count=2;await c.generate();
 assert.equal(c.selected.id,7);assert.equal(c.lpns.length,0);assert.equal(prints.length,0,'Generating labels must not print or create stock');
 assert(calls.some(x=>x.url==='common/system-controlled-number/lpn/batch/next'));
 assert(calls.every(x=>!/(inventory\/inventor|generate-manual-pick|picks\/)/.test(x.url)));
 await c.print({printerIndex:1,printerName:'TEST',physicalCopyCount:2,collated:false});assert.equal(prints.length,0);
 await c.print({printerIndex:1,printerName:'TEST',physicalCopyCount:1,collated:false});assert.equal(prints.length,1);assert.equal(prints[0][1],'range.lbl');
 fail=true;await c.generate();assert.equal(c.lpns.length,2);const allocations=calls.filter(x=>x.url.includes('batch/next')).length;
 fail=false;await c.generate();assert.equal(calls.filter(x=>x.url.includes('batch/next')).length,allocations,'Retry keeps allocated labels');
 configured=false;await c.generate();assert.equal(calls.filter(x=>x.url.includes('batch/next')).length,allocations,'Missing report does not consume LPNs');
 warehouse={id:2,companyId:1};const before=calls.length;await c.generate();assert.equal(calls.length,before);
 console.log('PASS: ordinary numbering, no inventory creation or automatic printing, one physical copy per LPN, exact range file reprint, timeout number reuse, template preflight and warehouse isolation');
})().catch(e=>{console.error(e);process.exitCode=1;});
