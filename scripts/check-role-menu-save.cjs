const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('assert/strict');
const ex={};vm.runInNewContext(ts.transpile(fs.readFileSync('src/app/routes/auth/role-menu/role-menu.component.ts','utf8'),{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,experimentalDecorators:true}),{exports:ex,require:n=>n==='@angular/core'?{Component:()=>v=>v,inject:()=>({fanyi:x=>x})}:n==='rxjs'?{firstValueFrom:x=>x}:{},console,Set,Map,Number});
(async()=>{
let calls=[],success=0,errors=0,returns=0,mismatch=false,fail=false,gate;
let saved={id:1,roleMenus:[]};
const service={processMenus:async(id,f,d,r)=>{calls.push({id,f,d,r});if(gate)await gate;if(fail)throw Error('offline');saved={id,roleMenus:[...f.map(id=>({menu:{id},displayOnlyFlag:false})),...d.map(id=>({menu:{id},displayOnlyFlag:true}))]};},getRole:async()=>mismatch?{id:1,roleMenus:[]}:saved};
const c=new ex.AuthRoleMenuComponent({}, {}, {},service,{}, {success:()=>success++,error:()=>errors++},{navigateByUrl:()=>returns++});
function setup(){c.currentRole={id:1,roleMenus:[{menu:{id:9},displayOnlyFlag:true},{menu:{id:3},displayOnlyFlag:false}]};c.allMenus=[];c.webMenuList=[{key:'1',direction:'right',displayOnly:true}];c.mobileMenuList=[{key:'2',direction:'right'},{key:'3'}];}
setup();await c.assignMenu();assert.deepEqual(Array.from(calls[0].f),[2]);assert.deepEqual(Array.from(calls[0].d),[1,9]);assert.deepEqual(Array.from(calls[0].r),[3]);assert.equal(success,1);assert.equal(returns,1);
setup();c.webMenuList=[];c.currentRole.roleMenus=[];await c.assignMenu();assert.deepEqual(Array.from(calls[1].f),[2],'mobile-only selection must be submitted');
setup();c.webMenuList=[];c.mobileMenuList=[{key:'3'}];await c.assignMenu();assert.deepEqual(Array.from(calls[2].r),[3]);
setup();mismatch=true;await c.assignMenu();assert.equal(success,3);assert.equal(errors,1);assert.equal(c.processingMenu,false);
mismatch=false;fail=true;await c.assignMenu();assert.equal(success,3);assert.equal(errors,2);assert.equal(c.processingMenu,false);
fail=false;let release;gate=new Promise(r=>release=r);const first=c.assignMenu();const count=calls.length;await c.assignMenu();assert.equal(calls.length,count);release();await first;
console.log('PASS role menus: mobile-only assignment, mixed Web flags, removals, hidden permission preservation, round-trip mismatch, failure recovery, duplicate submit');
})().catch(e=>{console.error(e);process.exitCode=1});
