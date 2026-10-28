import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TitleService, _HttpClient } from '@delon/theme';
import { Subscription, timeout } from 'rxjs';
import { saveAs } from 'file-saver';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { WarehouseService } from '../warehouse-layout/services/warehouse.service';

type Kind = 'receiving'|'placement'|'movement'|'picking'|'excluded';
type Person = {key:string;username:string;group:'user'|'shared'|'system'|'unknown'} & Record<Kind,number>;
interface Report {snapshotId:string;warehouseId:number;timezone:string;startTime:string;endTime:string;generatedAt:string;rows:Person[];notes:string[];eventCount:number;}
interface Event {id:string;userKey:string;username:string;group:string;kind:Kind;time:string;lpn:string;product:string;quantity:string;source:string;destination:string;document:string;rf:string;note:string;}
@Component({selector:'app-user-activity',standalone:true,imports:[CommonModule,FormsModule,NzSelectModule,NzModalModule],
 templateUrl:'./user-activity.component.html',styleUrls:['./user-activity.component.less']})
export class UserActivityComponent implements OnInit,OnDestroy {
 private api=inject(_HttpClient);private raw=inject(HttpClient);private warehouse=inject(WarehouseService);
 start='';end='';timezone='';busy=false;loading=true;exporting=false;error='';detailError='';report?:Report;selectedUsers:string[]=[];
 readonly kinds:Kind[]=['receiving','placement','movement','picking'];
 readonly labels:Record<Kind,string>={receiving:'Receiving',placement:'Placement',movement:'Movement',picking:'Picking',excluded:'Excluded / intermediate'};
 detailUser?:Person;detailKind:Kind='receiving';detailRows:Event[]=[];detailTotal=0;page=1;detailBusy=false;
 private requests=new Subscription();private active?:Subscription;private detailRequest?:Subscription;private version=0;private detailVersion=0;private scope?:number;
 constructor(){inject(TitleService).setTitle('Warehouse User Activity');}
 ngOnInit():void {
  const w=this.warehouse.getCurrentWarehouse();this.scope=w.id;
  this.requests.add(this.api.get('user-activity/config',{companyId:w.companyId,warehouseId:w.id}).pipe(timeout(30000)).subscribe({next:r=>{
   if(w.id!==this.warehouse.getCurrentWarehouse()?.id)return;
   this.loading=false;if(typeof r?.data?.timezone!=='string'){this.error='Warehouse timezone configuration is unavailable.';return;}
   this.timezone=r.data.timezone;
   const parts=new Intl.DateTimeFormat('en-CA',{timeZone:this.timezone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
   const day=['year','month','day'].map(k=>parts.find(p=>p.type===k)?.value).join('-');this.start=day+'T06:00';this.end=day+'T18:00';
  },error:()=>{this.loading=false;this.error='Unable to load report configuration. Inventory Activity permission is required.';}}));
 }
 params():{companyId:number;warehouseId:number}{const w=this.warehouse.getCurrentWarehouse();return {companyId:w.companyId,warehouseId:w.id};}
 invalidate():void{++this.version;this.active?.unsubscribe();this.busy=false;this.report=undefined;this.close();this.error='';}
 run():void {
  this.invalidate();if(!this.start||!this.end||this.end<=this.start){this.error='Choose a start and a later end time.';return;}
  const version=this.version;this.busy=true;
  this.active=this.api.get('user-activity/report',{...this.params(),start:this.start,end:this.end}).pipe(timeout(60000)).subscribe({next:r=>{
   if(version!==this.version||this.scope!==this.warehouse.getCurrentWarehouse()?.id)return;
   this.busy=false;const v=r?.data;
   if(!v||v.warehouseId!==this.scope||v.timezone!==this.timezone||typeof v.snapshotId!=='string'||!Array.isArray(v.rows)||!Array.isArray(v.notes)||!v.rows.every((p:Person)=>typeof p.key==='string'&&typeof p.username==='string'&&['user','shared','system','unknown'].includes(p.group)&&[...this.kinds,'excluded'].every(k=>Number.isSafeInteger(p[k as Kind])&&p[k as Kind]>=0))){this.error='Invalid report response. No partial totals are shown.';return;}
   this.report=v;this.selectedUsers=this.selectedUsers.filter(k=>v.rows.some((p:Person)=>p.key===k));
  },error:e=>{if(version===this.version){this.busy=false;this.error=typeof e?.error?.message==='string'?e.error.message:'Report failed. Try a shorter period; no partial totals are shown.';}}});
 }
 get visible():Person[]{return (this.report?.rows||[]).filter(p=>!this.selectedUsers.length||this.selectedUsers.includes(p.key));}
 get people():Person[]{return this.visible.filter(p=>p.group==='user'||p.group==='shared');}
 get systems():Person[]{return this.visible.filter(p=>p.group==='system'||p.group==='unknown');}
 total(kind:Kind):number{return this.people.reduce((n,p)=>n+p[kind],0);}
 fmt(value:string):string{return new Intl.DateTimeFormat('en-US',{timeZone:this.timezone||'America/Los_Angeles',dateStyle:'short',timeStyle:'medium'}).format(new Date(value));}
 close():void{++this.detailVersion;this.detailRequest?.unsubscribe();this.detailUser=undefined;this.detailRows=[];this.detailBusy=false;this.detailError='';}
 open(person:Person,kind:Kind,page=1):void {
  if(!this.report)return;this.detailRequest?.unsubscribe();const version=++this.detailVersion,snapshot=this.report.snapshotId;
  this.detailUser=person;this.detailKind=kind;this.page=page;this.detailTotal=person[kind];this.detailRows=[];this.detailError='';this.detailBusy=true;
  this.detailRequest=this.api.get('user-activity/details',{...this.params(),snapshotId:snapshot,user:person.key,kind,page}).pipe(timeout(30000)).subscribe({next:r=>{
   if(version!==this.detailVersion||snapshot!==this.report?.snapshotId)return;
   this.detailBusy=false;const v=r?.data;
   if(v?.total!==person[kind]||v?.page!==page||!Array.isArray(v.rows)||!v.rows.every((e:Event)=>e.userKey===person.key&&e.kind===kind&&typeof e.time==='string'&&Number.isFinite(Date.parse(e.time)))){this.detailError='Detail counts could not be verified. Run the report again.';return;}
   this.detailRows=v.rows;
  },error:()=>{if(version===this.detailVersion){this.detailBusy=false;this.detailError='Detail result expired or unavailable. Run the report again.';}}});
 }
 exportExcel():void {
  if(!this.report||this.exporting)return;const snapshot=this.report.snapshotId,version=this.version;this.exporting=true;
  this.requests.add(this.raw.get('user-activity/export',{params:{...this.params(),snapshotId:snapshot,users:JSON.stringify(this.visible.map(p=>p.key))},responseType:'blob'}).pipe(timeout(60000)).subscribe({next:file=>{
   this.exporting=false;if(this.report?.snapshotId===snapshot&&version===this.version)saveAs(file,'Warehouse_User_Activity.xlsx');
  },error:()=>{this.exporting=false;this.error='Export failed or result expired. Run the report again.';}}));
 }
 ngOnDestroy():void{this.invalidate();this.requests.unsubscribe();}
}
