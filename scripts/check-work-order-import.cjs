const fs=require('node:fs');const assert=require('node:assert/strict');const ts=require('typescript');
const {Subject,of,throwError,takeUntil}=require('rxjs');
const path='src/app/routes/integration/work-order-import-exceptions/work-order-import-exceptions.component.ts';
const src=ts.createSourceFile(path,fs.readFileSync(path,'utf8'),ts.ScriptTarget.Latest,true);
const cls=src.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='WorkOrderImportExceptionsComponent');
const methods=cls.members.filter(n=>ts.isMethodDeclaration(n)).map(n=>n.getText(src));
class HttpHeaders{constructor(values){this.values=values;}}class HttpParams{constructor(){this.values={};}set(k,v){this.values[k]=v;return this;}}
const js=ts.transpile(`class Tested {${methods.join('\n')}}`,{target:ts.ScriptTarget.ES2022});
const Tested=new Function('HttpHeaders','HttpParams','takeUntil',js+'; return Tested;')(HttpHeaders,HttpParams,takeUntil);
function make(){const x=new Tested();Object.assign(x,{destroyed:new Subject(),jobs:[],canRetry:true,submitting:false,loading:false,rows:[],batch:'batch-01',number:'WO-1',state:'BLOCKED',users:{getCurrentUsername:()=> 'alice'},messages:{info(){},error(){}},modal:{confirm(v){x.confirmation=v;}},http:{post(url,body){x.post={url,body};return of({data:{id:'job-1',state:'QUEUED',...body}});}}});return x;}
const row={file:'int_workorder_demo.csv',workOrderNumber:'WO-1',state:'BLOCKED'};
let x=make();x.canRetry=false;x.act(row,'retry');assert.equal(x.post,undefined);
x=make();x.act(row,'retry');assert.equal(x.post,undefined);x.confirmation.nzOnOk();assert.deepEqual(x.post.body,{file:row.file,workOrderNumber:'WO-1',action:'retry'});
x=make();x.act(row,'retry',true);x.confirmation.nzOnOk();assert.equal(x.post.body.workOrderNumber,'');
x=make();x.act(row,'check');assert.equal(x.post.body.action,'check');assert.equal(x.confirmation,undefined);
x=make();x.jobs=[{file:row.file,state:'RUNNING',workOrderNumber:''}];assert.ok(x.busy(row));x.act(row,'check');assert.equal(x.post,undefined);
assert.equal(x.retryable({...row,state:'UNCERTAIN'}),false);assert.equal(x.retryable({...row,state:'COMPLETED'}),false);assert.equal(x.retryable({...row,state:'PREPARED'}),true);
x=make();x.http.get=(url,options)=>{x.query=options.params.values;return of({data:{rows:[row],canRetry:true,total:1,truncated:false}});};x.load();assert.equal(x.query.number,'WO-1');assert.equal(x.query.state,'BLOCKED');assert.equal(x.rows.length,1);
x=make();x.http.get=()=>throwError(()=>({error:{message:'Permission denied'}}));x.load();assert.equal(x.canRetry,false);assert.equal(x.error,'Permission denied');
x=make();const replies=[];x.http.get=()=>{const s=new Subject();replies.push(s);return s;};x.showDetail(row);x.showDetail({...row,workOrderNumber:'WO-2'});replies[0].next({data:{marker:'stale'}});assert.equal(x.detail,undefined);replies[1].next({data:{marker:'current'}});assert.equal(x.detail.marker,'current');
x=make();assert.ok(x.jobSummary({results:[{state:'BLOCKED'},{state:'PREPARED'},{state:'PREPARED'}]}).includes('2 Ready to import'));
console.log('10 frontend action/filter/permission/stale-response checks passed');
