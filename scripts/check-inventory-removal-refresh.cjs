const fs=require('node:fs'),assert=require('node:assert/strict'),ts=require('typescript');
const {of,Subject,throwError,lastValueFrom,timeout,map}=require('rxjs');
function extract(path,name,members,bindings={}) {
 const source=ts.createSourceFile(path,fs.readFileSync(path,'utf8'),ts.ScriptTarget.Latest,true);
 const cls=source.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text===name);
 const methods=cls.members.filter(n=>n.name&&members.includes(n.name.getText(source))).map(n=>n.getText(source));
 return new Function(...Object.keys(bindings),ts.transpile('class Checked {'+methods.join('\n')+'}',{target:ts.ScriptTarget.ES2022})+';return Checked;')(...Object.values(bindings));
}
const C=extract('src/app/routes/inventory/inventory/inventory.component.ts','InventoryInventoryComponent',['removeSelectedInventory','monitorInventoryRemoval','applyCompletedInventoryRemovals','checkInventoryRemovalStatus','ngOnDestroy'],{lastValueFrom,timeout});
function setup(){
 const c=new C();const item={name:'Item',description:'Description'};
 c.inventories=[{id:1,virtual:false,item},{id:2,virtual:false,item},{id:3,virtual:false,item}];
 c.pendingRemovalIds=new Set();c.removalWarehouseId=1;c.removalMonitorVersion=0;c.removalPollLimit=3;c.isSubmittingRemoval=false;c.isMonitoringRemoval=false;
 c.warehouseService={getCurrentWarehouse:()=>({id:1})};c.inventoryTable={total:20};
 c.i18n={fanyi:k=>k};c.messageService={success(){},error(){}};
 c.getSelectedInventory=()=>[c.inventories[0],c.inventories[1],c.inventories[0]];
 c.setupDisplay=rows=>{c.listOfDisplayInventories=rows};c.delay=async()=>{};
 let submits=0,queries=[];c.inventoryService={removeInventories:(ids,async)=>{submits++;assert.equal(ids,'1,2');return of('remove request has been sent')},getRemovalInventorySnapshots:ids=>{queries.push([...ids]);return of(ids.map(id=>({id,virtual:true})))}};
 return {c,item,queries,submits:()=>submits};
}
(async()=>{
 let {c,item,queries}=setup();await c.removeSelectedInventory(true);
 assert.deepEqual(c.inventories.map(r=>r.id),[3]);assert.equal(c.inventories[0].item,item);
 assert.equal(c.inventoryTable.total,18);assert.equal(c.pendingRemovalIds.size,0);assert.equal(c.isMonitoringRemoval,false);assert.equal(c.isSubmittingRemoval,false);assert.deepEqual(queries,[[1,2]]);
 // Mixed results: remove only confirmed rows, leave approval/pending/missing rows visible.
 ({c}=setup());let step=0;c.inventoryService.getRemovalInventorySnapshots=ids=>of(++step===1?[{id:1,virtual:true},{id:2,virtual:false}]:[]);
 await c.removeSelectedInventory(false);assert.deepEqual(c.inventories.map(r=>r.id),[2,3]);assert(c.pendingRemovalIds.has(2));assert(c.removalNeedsReview);assert.equal(c.inventoryTable.total,19);
 // Polling failure cannot repeat the accepted deletion or remove any visible records.
 let state=setup();c=state.c;c.inventoryService.getRemovalInventorySnapshots=()=>throwError(()=>new Error('unavailable'));
 await c.removeSelectedInventory(true);assert.equal(state.submits(),1);assert(c.removalNeedsReview);assert.equal(c.inventories.length,3);assert.equal(c.pendingRemovalIds.size,2);
 await c.removeSelectedInventory(true);assert.equal(state.submits(),1);
 // Checking again after a status failure only reads state; it cannot resubmit deletion.
 c.inventoryService.getRemovalInventorySnapshots=ids=>of(ids.map(id=>({id,virtual:true})));
 await c.checkInventoryRemovalStatus();assert.equal(state.submits(),1);assert.equal(c.pendingRemovalIds.size,0);assert.deepEqual(c.inventories.map(row=>row.id),[3]);
 // Double-click while the submission is outstanding sends one mutation.
 state=setup();c=state.c;const receipt=new Subject();let calls=0;c.inventoryService.removeInventories=()=>{calls++;return receipt};
 const pending=c.removeSelectedInventory(true);await c.removeSelectedInventory(true);assert.equal(calls,1);receipt.next('accepted');receipt.complete();await pending;
 // Submission failure leaves inventory intact and releases the button.
 ({c}=setup());c.inventoryService.removeInventories=()=>throwError(()=>new Error('rejected'));await c.removeSelectedInventory(true);assert.equal(c.inventories.length,3);assert.equal(c.pendingRemovalIds.size,0);assert.equal(c.isSubmittingRemoval,false);
 // Destroyed page cannot start polling or mutate the view after a late acknowledgement.
 ({c}=setup());const late=new Subject();c.inventoryService.removeInventories=()=>late;const inflight=c.removeSelectedInventory(true);c.ngOnDestroy();late.next('accepted');late.complete();await inflight;assert.equal(c.inventories.length,3);assert.equal(c.pendingRemovalIds.size,0);
 // Switching warehouse while checking does not apply old-warehouse responses to the view.
 ({c}=setup());const snapshot=new Subject();c.inventoryService.getRemovalInventorySnapshots=()=>snapshot;
 const crossWarehouse=c.removeSelectedInventory(true);await Promise.resolve();c.warehouseService={getCurrentWarehouse:()=>({id:8})};snapshot.next([{id:1,virtual:true}]);snapshot.complete();await crossWarehouse;assert.equal(c.inventories.length,3);assert.equal(c.pendingRemovalIds.size,0);
 // Poll requests are bounded to 100 IDs, and results outside the requested chunk are ignored.
 ({c}=setup());c.getSelectedInventory=()=>Array.from({length:205},(_,i)=>({id:i+1}));let chunks=[];
 c.inventoryService.removeInventories=()=>of('accepted');c.inventoryService.getRemovalInventorySnapshots=ids=>{chunks.push(ids);return of([...ids.map(id=>({id,virtual:true})),{id:999,virtual:true}])};await c.removeSelectedInventory(true);assert.deepEqual(chunks.map(x=>x.length),[100,100,5]);assert.equal(c.pendingRemovalIds.size,0);
 class Params{constructor(v={}){this.v=v}append(k,v){return new Params({...this.v,[k]:v})}}
 const S=extract('src/app/routes/inventory/services/inventory.service.ts','InventoryService',['getRemovalInventorySnapshots'],{HttpParams:Params,map});const svc=new S();svc.warehouseService={getCurrentWarehouse:()=>({id:7})};let params;svc.http={get:(url,p)=>{assert.equal(url,'inventory/inventories');params=p.v;return of({data:[]})}};
 assert.throws(()=>svc.getRemovalInventorySnapshots([]));assert.throws(()=>svc.getRemovalInventorySnapshots(Array.from({length:101},(_,i)=>i+1)));
 await lastValueFrom(svc.getRemovalInventorySnapshots([1,2,2,NaN,0]));assert.deepEqual(params,{warehouseId:7,inventoryIds:'1,2',includeVirturalInventory:true,includeDetails:false});
 console.log('PASS: targeted polling, mixed completion/approval, no deletion on missing/error, duplicate prevention, teardown, 100-ID chunks, metadata preservation and scoped read-only parameters.');
})().catch(e=>{console.error(e);process.exitCode=1});
