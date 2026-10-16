// Verify actual CSV preparation and upload guards without any business requests.
const fs=require('node:fs'), vm=require('node:vm'), assert=require('node:assert/strict');
const {createRequire}=require('node:module');const req=createRequire(process.cwd()+'/package.json');
const ts=req('typescript'),rx=req('rxjs');
const utility={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/app/routes/util/utils/order-import-csv.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText,utility);
const prepare=utility.exports.prepareOrderImportCsv;
const csv='\uFEFForder,item,quantity,address,po\r\n" \u00a0000123\u200b ",0012,1.00,"A, B",00045\r\nABC,0007,2,"Line 1\r\nLine 2",00046\r\n';
const result=prepare(csv,new Map());assert.equal(result.trimmedRows,1);assert.equal(result.content,csv.replace('" \u00a0000123\u200b "','"000123"'));assert.equal(result.issues.length,0);
for(const space of [' ','\u00a0','\u200b','\u2060','\t','\n']){const r=prepare(`order,item\n"ABC${space}123",001\n`,new Map());assert.equal(r.issues[0].line,2);assert.equal(r.issues[0].reason,'whitespace');assert.equal(r.trimmedRows,0);}
assert.equal(prepare('order,item\n,0001',new Map()).issues[0].reason,'required');
assert.equal(prepare('Order ID,item\r\n Q-1 ,01',new Map([['order','Order ID']])).content,'Order ID,item\r\nQ-1,01');
assert.throws(()=>prepare('item,quantity\n1,2',new Map()),/missingColumn/);
assert.throws(()=>prepare('order,order\nA,B',new Map()),/ambiguousColumn/);
for(const text of ['order,item\n"ABC,01','order,item\nAB"C,01','order,item\n"ABC"oops,01'])assert.throws(()=>prepare(text,new Map()),/invalidCsv/);
const mixed='order,item\n A ,01\nB B,02\n';const blocked=prepare(mixed,new Map());assert.equal(blocked.content,mixed);assert.equal(blocked.trimmedRows,0);
const multiline=prepare('order,address\r\nA,"a\r\nb"\r\nB B,x',new Map());assert.equal(multiline.issues[0].line,4);
assert.equal(prepare('order,item\n\n A ,"say ""hello"""\n',new Map()).content,'order,item\n\nA,"say ""hello"""\n');
const source=fs.readFileSync('src/app/routes/util/file-upload/file-upload.component.ts','utf8');const ast=ts.createSourceFile('component.ts',source,ts.ScriptTarget.Latest,true);const cls=ast.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='UtilFileUploadComponent');
const names=['beforeUpload','transformUploadFile','prepareOrderFile'];const members=cls.members.filter(n=>n.name&&names.includes(n.name.getText(ast))).map(n=>n.getText(ast)).join('\n');
const scope={exports:{},...rx,prepareOrderImportCsv:prepare,File,TextDecoder};vm.runInNewContext(ts.transpileModule('exports.C=class {'+members+'}',{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText,scope);
function setup(){const c=new scope.exports.C();Object.assign(c,{selectedFileUploadType:{name:'orders'},columnMappingsReady:true,columnMappingVersion:1,fileUploadTypeColumnMappings:new Map(),preparedOrderFiles:new WeakMap(),msg:{info(){}},i18n:{fanyi:(key,args)=>key+JSON.stringify(args||{})}});return c;}
(async()=>{
 let c=setup(),f=new File(['order,item\nA A,001'],'invalid.csv');assert.equal(await rx.firstValueFrom(c.beforeUpload(f)),false);assert.ok(c.orderImportValidationError.includes('invalidRows'));assert.equal(c.preparedOrderFiles.has(f),false);
 c=setup();f=new File([csv],'valid.csv');assert.equal(await rx.firstValueFrom(c.beforeUpload(f)),true);assert.equal(new TextDecoder('utf-8',{ignoreBOM:true}).decode(await c.transformUploadFile(f).arrayBuffer()),result.content);
 c=setup();f=new File(['invalid'],'test.xlsx');assert.equal(await rx.firstValueFrom(c.beforeUpload(f)),false);assert.ok(c.orderImportValidationError.includes('csvRequired'));
 c=setup();c.columnMappingsReady=false;assert.equal(await rx.firstValueFrom(c.beforeUpload(new File(['order\nA'],'x.csv'))),false);
 c=setup();assert.equal(await rx.firstValueFrom(c.beforeUpload(new File([new Uint8Array([0xff])],'x.csv'))),false);
 c=setup();c.selectedFileUploadType={name:'items'};assert.equal(c.beforeUpload(f),true);assert.equal(c.transformUploadFile(f),f);
 c=setup();let resolveRead;f={name:'x.csv',arrayBuffer:()=>new Promise(resolve=>resolveRead=resolve)};const pending=rx.firstValueFrom(c.beforeUpload(f));c.columnMappingVersion++;resolveRead(new TextEncoder().encode('order\nA').buffer);assert.equal(await pending,false);
 console.log('Passed: CSV edge cleanup, all internal whitespace blocked, blank IDs, exact alias mapping, ambiguous/missing headers, malformed CSV, multiline line numbers, no partial uploads, UTF-8 checks, actual transformed payload, unchanged other import types, changed-mapping race; no HTTP requests.');
})().catch(error=>{console.error(error);process.exitCode=1;});
