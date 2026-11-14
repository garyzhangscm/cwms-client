import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { _HttpClient } from '@delon/theme';
import { NzModalService } from 'ng-zorro-antd/modal';
import { firstValueFrom, Subscription, timeout } from 'rxjs';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';

interface Line { orderLineId:number; number:string; itemId:number; itemName:string; demand:number; held:number; committed:number; shortage:number; revision:number; target:number; }
interface Snapshot { orderId:number; orderNumber:string; mode:'CLASSIC'|'ITEM_QUANTITY'; enabled:boolean; lines:Line[]; }
interface Pending { requestId:string; lines:{orderLineId:number; held:number; revision:number}[]; }

@Component({selector:'app-quantity-allocation',standalone:false,templateUrl:'./quantity-allocation.component.html',styleUrls:['./quantity-allocation.component.less']})
export class QuantityAllocationComponent implements OnInit,OnDestroy {
  snapshot?:Snapshot;error='';notice='';busy=false;uncertain=false;pending?:Pending;
  private id=0;private warehouseId=0;private generation=0;private destroyed=false;private routeSubscription?:Subscription;
  constructor(private route:ActivatedRoute,private http:_HttpClient,private warehouse:WarehouseService,private modal:NzModalService,private cdr:ChangeDetectorRef){}
  ngOnInit():void {
    this.routeSubscription=this.route.queryParamMap.subscribe(params=>{
      const id=Number(params.get('id'));const warehouseId=this.warehouse.getCurrentWarehouse()?.id??0;
      if(id===this.id&&warehouseId===this.warehouseId&&this.snapshot)return;
      this.generation++;this.id=id;this.warehouseId=warehouseId;
      this.busy=false;this.snapshot=undefined;this.pending=undefined;this.uncertain=false;this.error='';this.notice='';
      void this.load();
    });
  }
  ngOnDestroy():void {this.destroyed=true;this.generation++;this.routeSubscription?.unsubscribe();}
  private url(suffix=''):string {return `outbound/orders/${this.id}/quantity-allocation${suffix}?warehouseId=${this.warehouseId}`;}
  private context():boolean {
    if(this.destroyed)return false;
    const valid=this.warehouse.getCurrentWarehouse()?.id===this.warehouseId&&Number(this.route.snapshot.queryParamMap.get('id'))===this.id;
    if(!valid){this.error='The order or warehouse changed. Reopen Quantity Allocation from the order list.';this.cdr.markForCheck();}
    return valid;
  }
  private finish(generation:number):void {
    // Always release the loading mask for this operation, even if its context became stale.
    // Async HTTP completions must notify Angular; a later click must not be needed to repaint.
    if(!this.destroyed&&generation===this.generation){this.busy=false;this.cdr.markForCheck();}
  }
  private apply(value:Snapshot):void {this.snapshot={...value,lines:value.lines.map(line=>({...line,target:line.held}))};}
  async load():Promise<void> {
    if(this.busy)return;
    if(!Number.isSafeInteger(this.id)||this.id<=0||!this.warehouseId){this.error='Open Quantity Allocation from a sales order.';return;}
    this.busy=true;this.error='';const generation=++this.generation;
    try {const res=await firstValueFrom(this.http.get(this.url()).pipe(timeout(30000)));if(this.context()&&generation===this.generation)this.apply(res.data);}
    catch {if(generation===this.generation&&this.context())this.error='Could not load quantity allocation. Check that this feature is activated on the server, then refresh.';}
    finally {this.finish(generation);}
  }
  enable():void {
    if(this.busy||!this.context()||!this.snapshot||this.snapshot.mode!=='CLASSIC')return;
    void this.activate();
  }
  async activate():Promise<void> {
    if(this.busy||!this.context())return;
    this.busy=true;this.error='';const generation=this.generation;
    try {const res=await firstValueFrom(this.http.post(this.url('/entry'),{}).pipe(timeout(30000)));if(generation===this.generation&&this.context()){this.apply(res.data);this.notice='Enter the quantity to reserve, then save.';if(res.data.mode==='CLASSIC')this.error='This order has existing shipment work or uses the classic warehouse setting. Return to orders and use Allocate there.';}}
    catch {if(generation===this.generation&&this.context())this.error='Could not confirm activation. Refresh to check the order before trying again.';}
    finally {this.finish(generation);}
  }
  valid():boolean {return !!this.snapshot&&this.snapshot.lines.every(line=>Number.isSafeInteger(line.target)&&line.target>=0&&line.target<=line.demand-line.committed);}
  reserveRemaining():void {if(!this.busy&&!this.pending)this.snapshot?.lines.forEach(line=>line.target=line.demand-line.committed);}
  releaseRemaining():void {
    if(this.busy||this.pending)return;
    this.modal.confirm({nzTitle:'Release the remaining reservation?',nzContent:'Only unpicked quantity reservations will be released. Existing Picks and inventory movements are retained.',nzOkText:'Release reservation',nzOnOk:()=>{this.snapshot?.lines.forEach(line=>line.target=0);return this.save();}});
  }
  async save():Promise<void> {
    if(this.busy||!this.context()||!this.valid()||this.pending)return;
    const changed=this.snapshot!.lines.filter(line=>line.target!==line.held);if(!changed.length)return;
    this.pending={requestId:globalThis.crypto?.randomUUID?.()??this.uuid(),lines:changed.map(line=>({orderLineId:line.orderLineId,held:line.target,revision:line.revision}))};
    await this.sendPending();
  }
  async sendPending():Promise<void> {
    if(this.busy||!this.pending||!this.context())return;
    this.busy=true;this.error='';this.notice='';const generation=this.generation;
    try {const res=await firstValueFrom(this.http.post(this.url(),this.pending).pipe(timeout(30000)));if(generation===this.generation&&this.context()){this.apply(res.data);this.pending=undefined;this.uncertain=false;this.notice='Reservation saved. Check Unreserved demand for any inventory shortage.';}}
    catch(error:any) {if(generation===this.generation&&this.context()){
      const known=(error?.status>=400&&error?.status<500)||error?.status===45006;
      if(known){this.pending=undefined;this.uncertain=false;this.error=error?.statusText||'The reservation was rejected. Refresh for the current order and allocation quantities.';}
      else {this.uncertain=true;this.error='The result is not confirmed. Check using the same request below; do not create another reservation.';}
    }} finally {this.finish(generation);}
  }
  // UUID v4 fallback for LAN HTTP browsers without crypto.randomUUID; IDs are for deduplication, not authorization.
  private uuid():string {return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const n=Math.floor(Math.random()*16);return (c==='x'?n:(n&3)|8).toString(16);});}
  get totalHeld():number{return this.snapshot?.lines.reduce((sum,line)=>sum+line.held,0)??0;}
  get totalCommitted():number{return this.snapshot?.lines.reduce((sum,line)=>sum+line.committed,0)??0;}
}
