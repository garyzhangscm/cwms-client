const fs=require('fs'),ts=require('typescript'),vm=require('vm'),assert=require('node:assert/strict');
const path='src/app/routes/outbound/order/order.component.ts';const source=ts.createSourceFile(path,fs.readFileSync(path,'utf8'),ts.ScriptTarget.Latest,true);
const owner=source.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='OutboundOrderComponent');
const names=['loadPrintPolicy','canPrintShipping','canPrintManual','printPackingSlip','previewPackingSlip','printBillOfLading','previewBillOfLading','printManualPickSheet','previewManualPickSheet'];
const methods=owner.members.filter(n=>ts.isMethodDeclaration(n)&&names.includes(n.name.getText(source))).map(n=>n.getText(source)).join('\n');
const fixture=`class Fixture {printPolicies=new Map();printPolicyLoading=new Set();printShipmentIds=new Map();orderService:any;messageService={warning:()=>{}};${methods}};globalThis.Fixture=Fixture;`;
const context={};vm.createContext(context);vm.runInContext(ts.transpileModule(fixture,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText,context);const f=new context.Fixture(),order={id:42,number:'TEST'};let checks=0;
function check(x){assert.ok(x);checks++;}
check(!f.canPrintShipping(order));check(!f.canPrintManual(order));
for(const n of names.filter(n=>/^(print|preview)/.test(n)))f[n](...(n.startsWith('print')?[{},order]:[order])); // blocked calls must not reach report services
f.orderService={printEligibility:()=>({subscribe:({next})=>next({manualPick:true,shipping:false,shipments:[{id:1,ready:false}]})})};f.loadPrintPolicy(order,true);check(f.canPrintManual(order));check(!f.canPrintShipping(order));
f.orderService={printEligibility:()=>({subscribe:({next})=>next({manualPick:false,shipping:true,shipments:[{id:1,ready:true},{id:2,ready:false}]})})};f.loadPrintPolicy(order,true);check(!f.canPrintManual(order));check(f.canPrintShipping(order));check(f.printShipmentIds.get(42)===1);
f.printShipmentIds.set(42,2);check(!f.canPrintShipping(order));
f.orderService={printEligibility:()=>({subscribe:({next})=>next({manualPick:true,shipping:true,shipments:[{id:1,ready:true},{id:2,ready:true}]})})};f.printShipmentIds.delete(42);f.loadPrintPolicy(order,true);check(f.canPrintManual(order));check(!f.canPrintShipping(order));f.printShipmentIds.set(42,2);check(f.canPrintShipping(order));
f.orderService={printEligibility:()=>({subscribe:({error})=>error()})};f.loadPrintPolicy(order,true);check(!f.canPrintShipping(order));check(!f.canPrintManual(order));check(!f.printPolicyLoading.has(42));
const service=fs.readFileSync('src/app/routes/outbound/services/order.service.ts','utf8');check(service.includes("params.append('shipmentId', shipmentId).append('type', 'PACKING_SLIP')"));check(service.includes("params.append('shipmentId', shipmentId).append('type', 'BILL_OF_LADING')"));
console.log(`Passed ${checks} actual print-availability component/service checks (partial pick, shipment selection, stale state, failed eligibility).`);
