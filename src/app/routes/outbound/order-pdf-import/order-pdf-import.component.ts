import { environment } from '@env/environment';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom, timeout } from 'rxjs';
import { UserService } from '../../auth/services/user.service';
import { Customer } from '../../common/models/customer';
import { Client } from '../../common/models/client';
import { CustomerService } from '../../common/services/customer.service';
import { ClientService } from '../../common/services/client.service';
import { Item } from '../../inventory/models/item';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { ItemService } from '../../inventory/services/item.service';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { Order } from '../models/order';
import { OrderCategory } from '../models/order-category';
import { OrderStatus } from '../models/order-status.enum';
import { AllocationStrategyType } from '../models/allocation-strategy-type.enum';
import { OrderService } from '../services/order.service';
import { PdfImportReaderService } from './pdf-import-reader.service';
import { cleanEdge, parsePdfOrder, PdfOrderDraft, PdfOrderLine, sameName } from './pdf-order-parser';
import { baseQuantity, PdfUnitChoice, suggestUnit, unitChoices } from './pdf-order-units';
interface ReviewLine extends PdfOrderLine {
  candidates:Item[]; item?:Item; choices:PdfUnitChoice[]; unitKey:string; loading:boolean; error:string; version:number;
  attributes:Record<string,string>; sourceQuantity?:number|null;
}
const attributes=[
  ['trackingColorFlag','defaultColor','color','Color'],['trackingStyleFlag','defaultStyle','style','Style'],
  ['trackingProductSizeFlag','defaultProductSize','productSize','Size'],
  ...[1,2,3,4,5].map(i=>[`trackingInventoryAttribute${i}Flag`,`defaultInventoryAttribute${i}`,`inventoryAttribute${i}`,`Attribute ${i}`])
];
@Component({selector:'app-order-pdf-import',standalone:false,templateUrl:'./order-pdf-import.component.html',styleUrls:['./order-pdf-import.component.less']})
export class OrderPdfImportComponent implements OnInit,OnDestroy {
  readonly testEnvironment=!environment.production;
  busy=false;creating=false;locked=false;reviewed=false;forceOcr=false;progress='';error='';fileName='';mode='';
  draft?:PdfOrderDraft;lines:ReviewLine[]=[];previews:string[]=[];page=0;previewZoom=100;
  customers:Customer[]=[];clients:Client[]=[];statuses:InventoryStatus[]=[];customerId?:number;clientId?:number;statusId?:number;
  referencesReady=false;permission=false;private controller?:AbortController;private version=0;private edits=0;
  private context='';
  constructor(private reader:PdfImportReaderService,private customerService:CustomerService,private clientService:ClientService,
    private items:ItemService,private inventoryStatuses:InventoryStatusService,private orders:OrderService,
    private warehouse:WarehouseService,private company:CompanyService,private user:UserService,private router:Router){}
  ngOnInit():void {this.context=this.contextKey();void this.loadReferences();}
  ngOnDestroy():void {this.controller?.abort();this.version++;}
  private contextKey():string {return `${this.company.getCurrentCompany()?.id}:${this.warehouse.getCurrentWarehouse()?.id}:${this.user.getCurrentUsername()}`;}
  async loadReferences():Promise<void> {
    this.referencesReady=false;
    try {
      const [customers,clients,statuses,permissions,displayOnly]=await Promise.all([
        firstValueFrom(this.customerService.loadCustomers().pipe(timeout(30000))),firstValueFrom(this.clientService.getClients().pipe(timeout(30000))),
        firstValueFrom(this.inventoryStatuses.loadInventoryStatuses().pipe(timeout(30000))),firstValueFrom(this.user.getUserPermissionByWebPage('/outbound/order').pipe(timeout(30000))),this.user.isCurrentPageDisplayOnly('/outbound/order')
      ]);
      if(this.context!==this.contextKey())throw new Error('Warehouse or account changed. Reopen Import PDF.');
      this.customers=customers;this.clients=clients;this.statuses=statuses;
      this.permission=!displayOnly&&!permissions.some(p=>p.permission.name==='add-order'&&!p.allowAccess);
      this.statusId=statuses.length===1?statuses[0].id:undefined;
      this.referencesReady=true;
      if(this.draft)this.matchCustomer();
    }catch{this.error='Could not load customers, inventory statuses or permissions. Retry loading before creating an order.';}
  }
  async selectFile(event:Event):Promise<void> {
    const input=event.target as HTMLInputElement;const file=input.files?.[0];input.value='';
    if(!file||this.busy||this.creating||this.locked)return;
    const run=++this.version;this.controller?.abort();this.controller=new AbortController();
    this.draft=undefined;this.lines=[];this.previews=[];this.page=0;this.reviewed=false;this.error='';this.busy=true;this.fileName=file.name;
    try {
      const result=await this.reader.read(file,this.forceOcr,this.controller.signal,s=>{this.progress=s;});
      if(run!==this.version)return;
      const parsed=parsePdfOrder(result.pages);if(parsed.lines.length>100)throw new Error('Import at most 100 order lines at a time. Split this PDF first.');
      this.draft=parsed;this.previews=result.previews;
      this.mode=result.ocrPages?`OCR used on ${result.ocrPages} page(s)`:'Text extracted from PDF';
      this.lines=this.draft.lines.map(l=>({...l,candidates:[],choices:[],unitKey:'',loading:false,error:'',version:0,attributes:{},sourceQuantity:l.quantity}));
      this.matchCustomer();
      // Bound read-only item lookups; repeated codes share the same response.
      const unique=[...new Set(this.lines.map(l=>l.code))];
      for(let i=0;i<unique.length;i+=4)await Promise.all(unique.slice(i,i+4).map(async code=>{
        const first=this.lines.find(l=>l.code===code)!;await this.matchItem(first);
        for(const row of this.lines.filter(l=>l!==first&&l.code===code)) {
          row.candidates=first.candidates;if(first.item)this.applyItem(row,first.item);else row.error=first.error;
        }
      }));
    }catch(error){if(run===this.version)this.error=error instanceof Error?error.message:'Could not read this PDF. Please try another file.';}
    finally{if(run===this.version){this.busy=false;this.progress='';}}
  }
  cancel():void {this.controller?.abort();this.version++;this.busy=false;this.draft=undefined;this.lines=[];this.previews=[];this.error='Recognition cancelled.';}
  private matchCustomer():void {
    const matches=this.customers.filter(c=>sameName(c.name)===sameName(this.draft?.customer||''));
    this.customerId=matches.length===1?matches[0].id:undefined;
  }
  changed():void {this.reviewed=false;this.edits++;}
  clientChanged():void {
    this.changed();for(const row of this.lines){row.version++;row.item=undefined;row.candidates=[];row.choices=[];row.unitKey='';row.error='Match this item for the selected client.';}
  }
  codeChanged(row:ReviewLine):void {this.changed();row.version++;row.item=undefined;row.choices=[];row.unitKey='';row.candidates=[];row.error='Match the item code before creating the order.';}
  async matchItem(row:ReviewLine):Promise<void> {
    if(this.creating||this.locked)return;
    const version=++row.version;const code=row.code.trim();row.loading=true;row.error='';this.changed();
    try {
      if(!code||/[*%]/.test(code))throw new Error('Enter an item code without wildcard characters.');
      const candidates=await firstValueFrom(this.items.getItems(code,undefined,undefined,undefined,undefined,this.clientId===undefined?undefined:String(this.clientId)).pipe(timeout(30000)));
      if(version!==row.version||!this.lines.includes(row))return;
      row.candidates=candidates.filter(i=>this.clientId===undefined?i.clientId==null:i.clientId===this.clientId);
      const exact=row.candidates.filter(i=>i.name.trim().toUpperCase()===code.toUpperCase());
      if(exact.length===1)await this.selectItem(row,exact[0].id!);
      else row.error=exact.length>1?'Multiple items match. Choose the correct system item.':'No exact match. Search again or choose the correct system item.';
    }catch(error){if(version===row.version)row.error=error instanceof Error?error.message:'Item lookup failed. Please retry.';}
    finally{if(version===row.version)row.loading=false;}
  }
  async selectItem(row:ReviewLine,id:number):Promise<void> {
    const version=++row.version;row.loading=true;this.changed();
    try {
      const item=await firstValueFrom(this.items.getItem(id).pipe(timeout(30000)));
      if(version!==row.version||!this.lines.includes(row))return;
      if(this.clientId===undefined?item.clientId!=null:item.clientId!==this.clientId)throw new Error('This item belongs to a different client.');
      this.applyItem(row,item);
    }catch{if(version===row.version){row.item=undefined;row.error='Could not load this item for the selected client. Retry matching.';}}
    finally{if(version===row.version)row.loading=false;}
  }
  private applyItem(row:ReviewLine,item:Item):void {
    row.item=item;row.error='';row.choices=unitChoices(item);row.unitKey=suggestUnit(row.choices,row.unit);row.attributes={};
    for(const [flag,def,key] of attributes)if((item as unknown as Record<string,unknown>)[flag])row.attributes[key]=String((item as unknown as Record<string,unknown>)[def]??'');
    if(!row.choices.length)row.error='This item has no stock unit configured. Set up its packaging before importing.';
  }
  tracked(row:ReviewLine):{key:string;label:string}[] {return attributes.filter(([flag])=>Boolean((row.item as unknown as Record<string,unknown>|undefined)?.[flag])).map(([, ,key,label])=>({key,label}));}
  quantity(row:ReviewLine):number|null {return baseQuantity(row.quantity,row.choices.find(c=>c.key===row.unitKey));}
  chosenUnit(row:ReviewLine):string {return row.choices.find(c=>c.key===row.unitKey)?.base||'—';}
  addLine():void {this.changed();this.lines.push({code:'',quantity:null,unit:'',cartons:'',description:'',poNumber:'',page:this.page+1,candidates:[],choices:[],unitKey:'',loading:false,error:'',version:0,attributes:{}});}
  removeLine(row:ReviewLine):void {this.changed();row.version++;this.lines=this.lines.filter(l=>l!==row);}
  useSavedAddress():void {
    const customer=this.customers.find(c=>c.id===this.customerId);if(!customer||!this.draft)return;
    this.changed();Object.assign(this.draft,{addressLine1:customer.addressLine1,addressLine2:customer.addressLine2||'',city:customer.addressCity,state:customer.addressState,postcode:customer.addressPostcode,country:customer.addressCountry});
  }
  get issues():string[] {
    const issues:string[]=[];const draft=this.draft;if(!draft)return ['Choose a PDF first.'];
    if(!this.referencesReady)issues.push('Load the system reference data first.');
    if(!this.permission)issues.push('Your account does not have permission to add orders.');
    const number=cleanEdge(draft.number);if(!number||/[\s\u200B\u2060*%]/.test(number))issues.push('Enter an order number without spaces or wildcard characters.');
    if(!this.customers.some(c=>c.id===this.customerId))issues.push('Select a system customer.');
    if(!draft.addressLine1.trim()||!draft.city.trim()||!draft.state.trim()||!draft.postcode.trim()||!draft.country.trim())issues.push('Complete the ship-to address.');
    if(!this.statuses.some(s=>s.id===this.statusId))issues.push('Select an inventory status.');
    if(!this.lines.length)issues.push('Add at least one order line.');
    if(this.lines.length>100)issues.push('Import at most 100 lines per order.');
    this.lines.forEach((row,i)=>{
      if(!row.item?.id||row.loading||row.error||this.quantity(row)===null||this.tracked(row).some(a=>!row.attributes[a.key]?.trim()))issues.push(`Line ${i+1}: verify the item, quantity, unit and required attributes.`);
    });
    if(this.context!==this.contextKey())issues.push('Warehouse or account changed. Reopen Import PDF.');
    return issues;
  }
  async confirmCreate():Promise<void> {
    if(this.creating||this.locked||!this.reviewed)return;
    this.error='';if(this.issues.length){this.error=this.issues.join(' ');return;}
    const version=this.edits;const draft=this.draft!;draft.number=cleanEdge(draft.number);
    const status=this.statuses.find(s=>s.id===this.statusId)!;
    const order:Order={number:draft.number,poNumber:draft.poNumber.trim(),warehouseId:this.warehouse.getCurrentWarehouse().id,status:OrderStatus.OPEN,category:OrderCategory.SALES_ORDER,
      orderBillableActivities:[],allowForManualPick:false,clientId:this.clientId,shipToCustomerId:this.customerId,
      shipToAddressLine1:draft.addressLine1.trim(),shipToAddressLine2:draft.addressLine2.trim(),shipToAddressCity:draft.city.trim(),shipToAddressState:draft.state.trim(),shipToAddressPostcode:draft.postcode.trim(),shipToAddressCountry:draft.country.trim(),
      orderLines:this.lines.map((row,i)=>({number:String(i+1),orderNumber:draft.number,warehouseId:this.warehouse.getCurrentWarehouse().id,itemId:row.item!.id,
        clientId:this.clientId,expectedQuantity:this.quantity(row)!,openQuantity:this.quantity(row)!,inprocessQuantity:0,shippedQuantity:0,productionPlanInprocessQuantity:0,productionPlanProducedQuantity:0,
        inventoryStatusId:status.id,allocationStrategyType:AllocationStrategyType.FIRST_IN_FIRST_OUT,orderLineBillableActivities:[],autoRequestShippingLabel:false,...row.attributes}))};
    this.creating=true;
    try {
      const duplicates=await firstValueFrom(this.orders.getOrders(order.number,false).pipe(timeout(20000)));
      if(duplicates.some(o=>cleanEdge(o.number).toUpperCase()===order.number.toUpperCase()))throw new Error('That order number already exists. Choose another number or open the existing order.');
      // Recheck unit metadata at confirmation, using one GET per distinct item.
      const fresh=new Map<number,Item>();
      for(const id of [...new Set(this.lines.map(l=>l.item!.id!))])fresh.set(id,await firstValueFrom(this.items.getItem(id).pipe(timeout(20000))));
      if(version!==this.edits||this.context!==this.contextKey())throw new Error('The draft or warehouse changed. Review it again.');
      for(const row of this.lines) {
        const item=fresh.get(row.item!.id!)!;const old=row.choices.find(c=>c.key===row.unitKey)!;const current=unitChoices(item).find(c=>c.key===row.unitKey);
        if(!current||current.factor!==old.factor||current.base!==old.base||(this.clientId===undefined?item.clientId!=null:item.clientId!==this.clientId)||attributes.some(([flag,,key])=>Boolean((item as unknown as Record<string,unknown>)[flag])&&!row.attributes[key]?.trim()))throw new Error('Item packaging or client changed. Match the items again before creating the order.');
      }
      // Once a write is dispatched, never automatically resend it, including after a timeout.
      this.locked=true;
      const saved=await firstValueFrom(this.orders.addOrder(order).pipe(timeout(45000)));
      if(!saved?.id)throw new Error('No creation confirmation was received.');
      await this.router.navigate(['/outbound/order'],{queryParams:{number:order.number}});
    }catch(error){
      this.error=this.locked?'The request was sent but creation was not confirmed here. Check the order list before doing anything else. This page will not send it again.':error instanceof Error?error.message:'Could not validate the order. Please retry.';
      this.reviewed=false;
    }finally{this.creating=false;}
  }
}
