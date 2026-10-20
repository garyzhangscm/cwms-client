const fs=require('node:fs'),assert=require('node:assert/strict'),ts=require('typescript'),rx=require('rxjs');
function source(file){return ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true)}
const page=source('src/app/routes/qc/qc-rule/qc-rule.component.ts');
const cls=page.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='QcQcRuleComponent');
const method=cls.members.find(n=>n.name&&n.name.getText(page)==='removeQCRule').getText(page);
const Checked=new Function('timeout','finalize','formatDate',ts.transpile('class Checked {'+method+'}',{target:ts.ScriptTarget.ES2022})+';return Checked;')(()=>rx.timeout(5),rx.finalize,()=> 'test-time');
function setup(response){const c=new Checked();let calls=0,reloads=0;c.isSpinning=false;c.displayOnly=false;c.listOfAllQCRules=[{id:8,name:'WP-00020-25'},{id:5,name:'QC_FG'}];c.st={reload(){reloads++}};c.i18n={fanyi:(key,args)=>key+JSON.stringify(args)};c.qcRuleService={removeQCRule:rule=>{assert.equal(rule.id,8);calls++;return response}};return{c,calls:()=>calls,reloads:()=>reloads}}
(async()=>{
 let x=setup(rx.of('deleted'));x.c.removeQCRule(x.c.listOfAllQCRules[0]);assert.deepEqual(x.c.listOfAllQCRules.map(x=>x.id),[5]);assert.equal(x.c.isSpinning,false);assert.match(x.c.removeMessage,/qc-rule.removed.*WP-00020-25/);assert.equal(x.reloads(),1);
 x=setup(rx.throwError(()=>({statusText:'Cannot delete parent row: foreign key constraint fails'})));x.c.removeQCRule(x.c.listOfAllQCRules[0]);assert.equal(x.c.listOfAllQCRules.length,2);assert.equal(x.c.isSpinning,false);assert.match(x.c.removeMessage,/qc-rule.in-use/);
 for(const response of [rx.EMPTY,rx.throwError(()=>new Error('network')),rx.NEVER]){x=setup(response);x.c.removeQCRule(x.c.listOfAllQCRules[0]);await new Promise(r=>setTimeout(r,15));assert.equal(x.c.isSpinning,false);assert.equal(x.c.listOfAllQCRules.length,2);assert.match(x.c.removeMessage,/remove-unknown/);assert.equal(x.calls(),1);}
 const pending=new rx.Subject();x=setup(pending);x.c.removeQCRule(x.c.listOfAllQCRules[0]);x.c.removeQCRule(x.c.listOfAllQCRules[0]);assert.equal(x.calls(),1);pending.complete();assert.equal(x.c.isSpinning,false);
 x=setup(rx.of('deleted'));x.c.displayOnly=true;x.c.removeQCRule(x.c.listOfAllQCRules[0]);assert.equal(x.calls(),0);
 // Exercise the actual shared interceptor branch. RxJS 7 requires an error factory;
 // passing the object itself loses the backend rejection behind a TypeError.
 const tree=source('src/app/core/net/default.interceptor.ts');const fn=tree.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name.text==='handleData').getText(tree);
 class Response {constructor(body){this.status=200;this.body=body}}class HttpErrorResponse{}
 const handle=new Function('throwError','of','HttpResponse','HttpErrorResponse','checkStatus',ts.transpile(fn,{target:ts.ScriptTarget.ES2022})+';return handleData;')(rx.throwError,rx.of,Response,HttpErrorResponse,()=>{});
 const error={result:60000,message:'foreign key constraint'};
 await assert.rejects(rx.lastValueFrom(handle({},new Response(error),{url:'/inventory/qc-rules/8'},null)),e=>e.status===60000&&e.statusText===error.message);
 const ok=new Response({result:0,data:'deleted'});assert.equal(await rx.lastValueFrom(handle({},ok,{url:'/inventory/qc-rules/8'},null)),ok);
 console.log('PASS: exact rule-only removal, foreign-key rejection shown, pending/empty/network/timeout unlocks UI without removing data or auto retry, duplicate/read-only guards, real RxJS interceptor preserves business error.');
})().catch(e=>{console.error(e);process.exitCode=1});
