/* Run with Node in a checkout containing its normal TypeScript dependencies. No sockets or real order writes. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const ts=require('typescript');const root=path.resolve(__dirname,'../src/app/routes/outbound/order-pdf-import');
const cache=new Map();let count=0;function ok(test,message){assert.ok(test,message);count++;}
function load(file){file=path.resolve(file);if(!file.endsWith('.ts'))file+='.ts';if(cache.has(file))return cache.get(file);
 const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,experimentalDecorators:true}}).outputText;
 const module={exports:{}};cache.set(file,module.exports);
 const req=name=>{
  if(name==='@env/environment')return {environment:{production:false}};
  if(name==='@angular/core')return {Component:()=>c=>c,Injectable:()=>c=>c};
  if(name==='rxjs')return {firstValueFrom:async x=>await x,timeout:()=>x=>x};
  if(name.startsWith('.'))return load(path.resolve(path.dirname(file),name));
  throw new Error('Unexpected runtime dependency '+name);
 };
 vm.runInThisContext('(function(require,module,exports){'+out+'\n})',{filename:file})(req,module,module.exports);cache.set(file,module.exports);return module.exports;
}
const {parsePdfOrder,positiveInteger}=load(root+'/pdf-order-parser');const {unitChoices,suggestUnit,baseQuantity}=load(root+'/pdf-order-units');
function words(text,x,y,width=text.length*6){return {text,x,y,width};}
const synthetic={page:1,words:[
 words('Invoice',760,60),words('No.',810,60),words('DEMO-INV-001',755,80),
 words('Ship',500,140),words('To:',530,140),words('DEMO CUSTOMER INC',500,160),
 words('100 Demo Street',500,180),words('Demo City, CA, 90000',500,200),words('United States',500,220),
 words('Item',80,310),words('Code',110,310),words('Quantity',220,310),words('Carton Packing',350,310),words('Description',565,310),words('Customer Po',790,310),
 words('ITEM-DEMO-001',40,350,110),words('1872',260,350,35),words('468',390,350,28),words('Mainstays 11G Lift Top trash',530,350,220),words('PO-DEMO-001',790,350,80),words('can',535,365),
 words('Total Shipped:',70,430),words('1872',300,430),words('EA',365,430)
]};
const sample=process.argv[2]?JSON.parse(fs.readFileSync(process.argv[2],'utf8')):[synthetic];
const expected=process.argv[3]?JSON.parse(fs.readFileSync(process.argv[3],'utf8')):{number:'DEMO-INV-001',poNumber:'PO-DEMO-001',code:'ITEM-DEMO-001',customer:'DEMO CUSTOMER INC',city:'Demo City',state:'CA',postcode:'90000'};
const d=parsePdfOrder(sample);ok(d.number===expected.number,'invoice number');ok(d.poNumber===expected.poNumber,'PO');
ok(d.lines.length===1,'one source line');ok(d.lines[0].quantity===1872,'quantity, not cartons');ok(d.lines[0].cartons==='468','cartons separate');
ok(d.lines[0].code===expected.code,'exact code');ok(d.lines[0].unit==='EA','EA unit');ok(d.lines[0].description.includes('can'),'wrapped description');ok(d.customer===expected.customer,'ship-to, not bill-to');ok(d.city===expected.city&&d.state===expected.state&&d.postcode===expected.postcode,'US address');
for(const value of ['0','-1','1.5','1e3','12,34','NaN'])ok(positiveInteger(value)===null,'reject invalid integer '+value);
ok(positiveInteger('1,872')===1872,'comma thousands');
const mixed=structuredClone(synthetic);mixed.page=2;mixed.words.find(w=>w.text==='DEMO-INV-001').text='DEMO-INV-002';assert.throws(()=>parsePdfOrder([synthetic,mixed]),/more than one invoice/);count++;
const mismatch=structuredClone(synthetic);mismatch.words.find(w=>w.text==='1872'&&w.y===430).text='1900';ok(parsePdfOrder([mismatch]).warnings.some(w=>w.includes('Total Shipped')),'total mismatch flagged');
const unsupported=parsePdfOrder([{page:1,words:[words('Unknown form',20,30)]}]);ok(unsupported.lines.length===0&&unsupported.warnings.length>0,'unsupported layout does not invent items');
const item={id:9,name:'ITEM-DEMO-001',description:'Sample',companyId:1,itemPackageTypes:[{id:1,name:'Standard',stockItemUnitOfMeasure:{quantity:1,unitOfMeasure:{name:'PCS'}},itemUnitOfMeasures:[{id:12,quantity:4,unitOfMeasure:{name:'CTNS'}}]}]};
const choices=unitChoices(item);ok(baseQuantity(1872,choices.find(c=>c.key===suggestUnit(choices,'EA')))===1872,'explicit each-to-piece review conversion');
ok(baseQuantity(468,choices.find(c=>c.name==='CTNS'))===1872,'configured carton conversion');ok(suggestUnit(choices,'UNKNOWN')==='','unknown unit not guessed');ok(baseQuantity(0,choices[0])===null,'zero cannot be created');
const {OrderPdfImportComponent}=load(root+'/order-pdf-import.component');
const obs=value=>({pipe:()=>Promise.resolve(value)});const failure=()=>({pipe:()=>Promise.reject(new Error('simulated timeout'))});
function component(){let writes=0,go=0;let wh=1;const services={
 orders:{getOrders:()=>obs([]),addOrder:()=>{writes++;return obs({id:10});}},items:{getItem:()=>obs(item)},
 warehouse:{getCurrentWarehouse:()=>({id:wh})},company:{getCurrentCompany:()=>({id:1})},user:{getCurrentUsername:()=> 'TEST'},router:{navigate:async()=>{go++;return true;}}
 };
 const c=new OrderPdfImportComponent({}, {}, {},services.items,{},services.orders,services.warehouse,services.company,services.user,services.router);
 c.context='1:1:TEST';c.referencesReady=true;c.permission=true;c.customers=[{id:1,name:d.customer}];c.customerId=1;c.statuses=[{id:1}];c.statusId=1;c.draft=structuredClone(d);
 const row={...d.lines[0],sourceQuantity:d.lines[0].quantity,candidates:[item],item,choices,unitKey:suggestUnit(choices,'EA'),loading:false,error:'',version:0,attributes:{}};c.lines=[row];
 return {c,services,writes:()=>writes,go:()=>go,warehouse:id=>wh=id};
}
(async()=>{
 let t=component();ok(t.c.issues.length===0,'valid reviewed fixture');await t.c.confirmCreate();ok(t.writes()===0,'no create without acknowledgement');
 t.c.reviewed=true;await t.c.confirmCreate();ok(t.writes()===1&&t.go()===1,'one confirmed write');t.c.reviewed=true;await t.c.confirmCreate();ok(t.writes()===1,'double click cannot resend');
 t=component();t.services.orders.getOrders=()=>obs([{number:d.number}]);t.c.reviewed=true;await t.c.confirmCreate();ok(t.writes()===0&&t.c.error.includes('already exists'),'duplicate blocked');
 t=component();t.services.orders.addOrder=()=>{t.services.called=true;return failure();};t.c.reviewed=true;await t.c.confirmCreate();ok(t.c.locked&&t.c.error.includes('will not send it again'),'uncertain write stays locked');t.c.reviewed=true;await t.c.confirmCreate();ok(t.c.locked,'cannot retry timed-out write');
 t=component();t.c.lines[0].item=undefined;ok(t.c.issues.some(s=>s.includes('Line 1')),'unmatched item blocked');
 t=component();t.c.permission=false;t.c.reviewed=true;await t.c.confirmCreate();ok(t.writes()===0,'missing permission blocked');
 t=component();t.c.draft.number='BAD NUMBER';ok(t.c.issues.some(s=>s.includes('without spaces')),'internal whitespace blocked');
 t=component();t.c.draft.number='  '+d.number+'  ';t.c.reviewed=true;await t.c.confirmCreate();ok(t.writes()===1&&t.c.draft.number===d.number,'edge whitespace trimmed');
 t=component();t.warehouse(2);t.c.reviewed=true;await t.c.confirmCreate();ok(t.writes()===0,'warehouse change blocked');
 t=component();t.c.reviewed=true;t.c.changed();ok(!t.c.reviewed,'edits invalidate acknowledgement');
 t=component();t.c.lines[0].quantity=40;ok(t.c.lines[0].sourceQuantity===1872,'source quantity retained after edit');
 t=component();let resolveRead;t.c.reader={read:()=>new Promise(resolve=>{resolveRead=resolve;})};const task=t.c.selectFile({target:{files:[{name:'demo.pdf'}],value:'demo.pdf'}});t.c.cancel();resolveRead({pages:[synthetic],previews:[],ocrPages:0});await task;ok(!t.c.busy&&!t.c.draft,'cancel discards late recognition results');
 t=component();t.services.items.getItem=()=>obs({...item,itemPackageTypes:[]});t.c.reviewed=true;await t.c.confirmCreate();ok(t.writes()===0&&t.c.error.includes('packaging'),'changed packaging blocks write');
 const {PdfImportReaderService}=load(root+'/pdf-import-reader.service');const reader=new PdfImportReaderService();
 await assert.rejects(reader.read({size:16*1024*1024},false,new AbortController().signal,()=>{}),/15 MB/);count++;
 await assert.rejects(reader.read(new File(['Not a PDF'],'demo.pdf'),false,new AbortController().signal,()=>{}),/not a PDF/);count++;
 console.log(`PASS ${count} parser, quantity, permission, confirmation, duplicate and uncertain-write checks; all services mocked, no production writes.`);
})().catch(e=>{console.error(e);process.exit(1);});
