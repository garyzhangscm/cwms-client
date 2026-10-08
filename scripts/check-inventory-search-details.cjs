const fs=require('node:fs'),assert=require('node:assert/strict'),ts=require('typescript');
const {of,Subject,Observable,throwError,lastValueFrom,timeout}=require('rxjs');
const path='src/app/routes/inventory/inventory/inventory.component.ts';
const source=ts.createSourceFile(path,fs.readFileSync(path,'utf8'),ts.ScriptTarget.Latest,true);
const cls=source.statements.find(n=>ts.isClassDeclaration(n));
const names=['loadDetails','calculateDisplayQuantity','search','searchFromFirstPage','resetForm','ngOnDestroy'];
const methods=cls.members.filter(n=>n.name&&names.includes(n.name.getText(source))).map(n=>n.getText(source));
const C=new Function('lastValueFrom','timeout','formatDate',ts.transpile('class Checked {'+methods.join('\n')+'}',{target:ts.ScriptTarget.ES2022})+';return Checked;')(lastValueFrom,timeout,()=> 'test date');
function setup(){const c=new C();c.inventoryDetailVersion=0;c.inventorySearchVersion=0;c.removalMonitorVersion=0;c.inventoryTable={pi:5,ps:10,total:0,reload:()=>c.reloads++};c.reloads=0;c.warnings=0;c.messageService={warning:()=>c.warnings++};c.i18n={fanyi:k=>k};return c;}
(async()=>{
 let c=setup();const calls=[];const lookup=(kind,id)=>{calls.push(kind+':'+id);return of({id,name:kind})};
 c.localCacheService={getLocation:id=>lookup('location',id),getReceipt:id=>lookup('receipt',id),getClient:id=>lookup('client',id),getPick:id=>lookup('pick',id),getUnitOfMeasure:id=>lookup('uom',id)};
 const rows=Array.from({length:20},(_,i)=>({id:i,quantity:20,locationId:1,receiptId:2,clientId:3,pickId:4,allocatedByPickId:4,inventoryMovements:[{locationId:1}],itemPackageType:{stockItemUnitOfMeasure:{unitOfMeasureId:5,quantity:1},displayItemUnitOfMeasure:{unitOfMeasureId:5,quantity:10},itemUnitOfMeasures:[{unitOfMeasureId:5}]}}));
 await c.loadDetails(rows);assert.deepEqual(calls.sort(),['client:3','location:1','pick:4','receipt:2','uom:5']);assert(rows.every(r=>r.location.id===1&&r.receipt.id===2&&r.allocatedByPick.id===4&&r.displayQuantity===2&&r.itemPackageType.displayItemUnitOfMeasure.unitOfMeasure.id===5&&r.inventoryMovements[0].location.id===1));assert.equal(c.reloads,1);assert.equal(c.detailsLoading,false);
 // Six bounded workers, not sequential row hydration and not unlimited concurrency.
 c=setup();let active=0,peak=0,done=0;c.localCacheService={getLocation:id=>new Observable(sub=>{active++;peak=Math.max(peak,active);setTimeout(()=>{active--;done++;sub.next({id});sub.complete()},5)})};await c.loadDetails(Array.from({length:18},(_,i)=>({quantity:1,locationId:i+1})));assert.equal(done,18);assert.equal(peak,6);
 // A failed detail does not prevent successful details or leave the page loading forever.
 c=setup();c.localCacheService={getLocation:id=>id===1?throwError(()=>new Error('missing')):of({id})};const partial=[{quantity:1,locationId:1},{quantity:1,locationId:2}];await c.loadDetails(partial);assert.equal(partial[1].location.id,2);assert.equal(c.warnings,1);assert.equal(c.detailsLoading,false);
 // A result from an obsolete query cannot alter the row or reload the new table.
 c=setup();const stale=new Subject();c.localCacheService={getLocation:()=>stale};const obsolete={quantity:1,locationId:1};const old=c.loadDetails([obsolete]);c.inventoryDetailVersion++;stale.next({id:1});stale.complete();await old;assert.equal(obsolete.location,undefined);assert.equal(c.reloads,0);
 // Clear invalidates outstanding main queries; new Search starts at page one.
 c=setup();c.searchForm={value:{itemName:'ET-Grey-ST3Draw'},reset(){this.value={}}};const responses=[];const requests=[];c.inventoryService={getPageableInventories:(...args)=>{requests.push(args);const subject=new Subject();responses.push(subject);return subject}};c.processInventoryQueryResult=rows=>{c.inventories=rows};
 c.searchFromFirstPage();assert.equal(c.inventoryTable.pi,1);assert.equal(requests[0][17],1);assert.equal(requests[0][2],'ET-Grey-ST3Draw');assert(c.searching);
 c.searchForm.value.itemName='another Item';c.search();responses[1].next({content:[{id:2}],totalElements:1});assert.equal(c.inventories[0].id,2);assert.equal(c.searching,false);responses[0].next({content:[{id:1}],totalElements:99});assert.equal(c.inventories[0].id,2);assert.equal(c.inventoryTable.total,1);
 c.search();c.resetForm();responses[2].next({content:[{id:3}],totalElements:1});assert.deepEqual(c.inventories,[]);assert.equal(c.searching,false);assert.equal(c.isSpinning,false);
 console.log('PASS: 20 rows reuse 5 detail requests; six-worker bound; quantities and associations preserved; partial failure recovery; stale response and Clear guards; new search starts at page one.');
})().catch(e=>{console.error(e);process.exitCode=1});
