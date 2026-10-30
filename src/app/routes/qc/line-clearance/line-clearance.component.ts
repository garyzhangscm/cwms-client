import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, timeout } from 'rxjs';
import { saveAs } from 'file-saver';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
function lcId():string{return Array.from(crypto.getRandomValues(new Uint8Array(24)),v=>v.toString(16).padStart(2,'0')).join('');}
interface LCField { key:string; en:string; es:string; type:string; required:boolean; options?:string[]; minimum?:number; maximum?:number; matchRequired?:boolean; expectedByProduct?:Record<string,string>; expectedSource?:string; }
interface LCQuestion {key:string; en:string; es:string; owner:string; phase:string; enabled:boolean; products:string[]; orderScope?:string; appliesToProduct?:string; fields:LCField[];}
@Component({selector:'app-line-clearance',standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./line-clearance.component.html',styleUrls:['./line-clearance.component.less']})
export class LineClearanceComponent implements OnInit,OnDestroy {
  private readonly http=inject(HttpClient);private readonly warehouse=inject(WarehouseService);
  mode=inject(ActivatedRoute).snapshot.data['lcMode'] as string;
  session:any; template:any; records:any[]=[]; record:any; busy=false; error='';notice='';lang='en';
  filters:any={from:'',to:'',shift:'',machine:'',workOrder:'',operator:'',status:'',operation:''};
  machine='';workOrder='';previousWorkOrder='';nonce=lcId();reference='';reason='';grantUser='';grantCaps:string[]=[];grants:any[]=[];
  values:Record<string,any>={};photoUrl='';readonly site=this.warehouse.getCurrentWarehouse();
  private destroyed=false;
  stages=['clearance','sample','pallet','supervisor','final','completed','cancelled'];
  get questions():LCQuestion[]{return this.template?.draft?.body?.items??[];}
  page=0;
  get allQuestions():LCQuestion[]{return this.record?.template?.items??[];}
  get stageQuestions():LCQuestion[]{return this.allQuestions.filter(q=>['completed','cancelled'].includes(this.record?.stage)||q.phase===this.record?.stage);}
  get currentQuestions():LCQuestion[]{return this.mode==='entry'?this.stageQuestions.slice(this.page,this.page+1):this.allQuestions;}
  get stageComplete():number{return this.stageQuestions.filter(q=>this.record.answers[q.key]?.complete||this.record.na[q.key]).length;}
  unusedAllowed(q:LCQuestion):boolean{return ['old_carton','old_labels','old_rfid','old_gtin','old_resin'].includes(q.key)&&q.phase==='clearance';}
  visibleFields(q:LCQuestion):LCField[]{return this.values[q.key]?.usage==='Not used'?[]:q.fields.filter(f=>f.key!=='usage');}
  setUsage(q:LCQuestion,value:string):void{this.values[q.key]={usage:value};if(value==='Not used')for(const f of q.fields)if(f.type==='number')this.values[q.key][f.key]=0;}
  scrollPage():void{setTimeout(()=>document.querySelector('.question-page-heading')?.scrollIntoView({block:'start'}));}
  navigate(target:number):void{void this.run(async()=>{const q=this.stageQuestions[this.page];if(q&&JSON.stringify(this.values[q.key])!==JSON.stringify(this.record.answers[q.key]?.values??{})){this.openRecord(await this.api(`records/${this.record.id}/answer`,{revision:this.record.revision,question:q.key,values:this.values[q.key],complete:false}),target);}else this.page=Math.max(0,Math.min(target,this.stageQuestions.length));this.scrollPage();});}

  get visibleStages():string[]{return this.record?.workflow??this.stages;}
  operation(old:string,newOrder:string):string{return old?.trim()?(newOrder?.trim()?'changeover':'closing'):(newOrder?.trim()?'opening':'');}
  operationLabel(value:string):string{return ({changeover:this.t('Changeover','Cambio de orden'),opening:this.t('Opening only','Apertura de línea'),closing:this.t('Closing only','Cierre de línea')} as Record<string,string>)[value]||'—';}
  scope(q:LCQuestion):string{if(q.orderScope)return q.orderScope;if(['old_packing','old_carton','old_labels','old_rfid','old_gtin','old_resin','last_shot','old_documents'].includes(q.key))return 'old';if(q.key==='yellow_blue')return 'both';return ['new_staging','new_carton','new_labels','new_rfid','new_gtin','new_resin','new_documents','first_pallet'].includes(q.key)||['sample','pallet'].includes(q.phase)?'new':'all';}
  get validScope():boolean{const s=this.warehouse.getCurrentWarehouse();return !this.destroyed&&!!s&&!!this.site&&s.id===this.site.id&&s.companyId===this.site.companyId;}
  cap(c:string):boolean{return this.session?.actor?.caps?.includes(c)??false;}
  label(x:{en:string;es:string}):string{return this.lang==='es'?x.es:x.en;}
  t(en:string,es:string):string{return this.lang==='es'?es:en;}
  async api(path:string,data?:any,blob=false):Promise<any>{
    if(!this.validScope)throw new Error('Warehouse changed; reload this page');
    const scope={companyId:this.site.companyId,warehouseId:this.site.id};
    const request=blob?this.http.get(`line-clearance/${path}`,{params:scope,responseType:'blob'}):data===undefined?this.http.get(`line-clearance/${path}`,{params:scope}):this.http.post(`line-clearance/${path}`,{...scope,...data});
    const r:any=await firstValueFrom(request.pipe(timeout(45000)));
    if(!this.validScope)throw new Error('Warehouse changed; reload this page');
    return blob?r:r.data;
  }
  async get(path:string,params:any):Promise<any>{
    const r:any=await firstValueFrom(this.http.get(`line-clearance/${path}`,{params:{...params,companyId:this.site.companyId,warehouseId:this.site.id}}).pipe(timeout(45000)));
    if(!this.validScope)throw new Error('Warehouse changed; reload');return r.data;
  }
  async run(fn:()=>Promise<void>):Promise<void>{if(this.busy)return;this.busy=true;this.error='';this.notice='';try{await fn();}catch(e:any){this.error=e?.error?.message||e?.message||'Request failed. Reload to verify the saved state before retrying.';}finally{this.busy=false;}}
  ngOnInit():void{void this.run(async()=>{this.session=await this.api('session');this.template=await this.api('template');if(this.mode==='configure'&&this.cap('configure'))this.grants=await this.api('grants');if(this.mode!=='configure')await this.searchNow();});}
  ngOnDestroy():void{this.destroyed=true;if(this.photoUrl)URL.revokeObjectURL(this.photoUrl);}
  reload():void{void this.run(async()=>{if(this.record)this.openRecord(await this.api(`records/${this.record.id}`));else await this.searchNow();});}
  async searchNow():Promise<void>{this.records=await this.get('records',this.filters);}
  search():void{void this.run(async()=>{this.record=undefined;await this.searchNow();});}
  open(id:string):void{void this.run(async()=>this.openRecord(await this.api(`records/${id}`)) );}
  openRecord(r:any,page?:number):void{this.record=r;this.values={};for(const q of r.template.items)this.values[q.key]={...(r.answers[q.key]?.values??{})};const first=this.stageQuestions.findIndex(q=>!r.answers[q.key]?.complete&&!r.na[q.key]);this.page=page===undefined?(first<0?this.stageQuestions.length:first):Math.min(page,this.stageQuestions.length);this.scrollPage();}
  create():void{void this.run(async()=>{if(!this.operation(this.previousWorkOrder,this.workOrder))throw new Error(this.t('Enter at least one old or new work order.','Ingrese al menos una orden anterior o nueva.'));this.openRecord(await this.api('records',{machine:this.machine,workOrder:this.workOrder,previousWorkOrder:this.previousWorkOrder,nonce:this.nonce}));this.nonce=lcId();});}
  act(action:string,q?:LCQuestion,extra:any={}):void{void this.run(async()=>{const unsaved=Object.keys(this.values).filter(k=>JSON.stringify(this.values[k])!==JSON.stringify(this.record.answers[k]?.values??{}));if(['verify','advance','sign','link'].includes(action)&&unsaved.length)throw new Error('Save or reload unsaved answers before verification / approval.');const keep=structuredClone(this.values);if(action==='issue'&&q)extra={...extra,values:this.values[q.key]};const previousPage=this.page,previousStage=this.record.stage;const result=await this.api(`records/${this.record.id}/${action}`,{revision:this.record.revision,question:q?.key,...extra});this.openRecord(result,result.stage===previousStage?previousPage+(action==='answer'&&extra.complete?1:0):undefined);for(const key of unsaved)if(key!==q?.key)this.values[key]=keep[key];this.reason='';this.reference='';this.notice=this.t('Saved.','Guardado.');});}
  get evidence():{id:string;label:string}[]{const seen=new Set<string>();const out:{id:string;label:string}[]=[];for(const q of this.allQuestions)for(const f of q.fields)if(f.type==='photo'){const id=this.values[q.key]?.[f.key];if(id&&!seen.has(id)){seen.add(id);out.push({id,label:q.en});}}return out;}
  save(q:LCQuestion,complete:boolean):void{this.act('answer',q,{values:this.values[q.key],complete});}
  upload(q:LCQuestion,f:LCField,event:Event):void{const file=(event.target as HTMLInputElement).files?.[0];if(!file)return;void this.run(async()=>{if(file.size>6*1024*1024)throw new Error('Photo must be JPEG / PNG, up to 6 MB');const encoded=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(new Error('Photo could not be read'));reader.readAsDataURL(file);});const uploaded=await this.api(`records/${this.record.id}/photo`,{base64:encoded,mime:file.type});this.values[q.key][f.key]=uploaded.id;this.notice='Photo uploaded; save this question to attach it.';});}
  showPhoto(id:string):void{void this.run(async()=>{if(this.photoUrl)URL.revokeObjectURL(this.photoUrl);this.photoUrl=URL.createObjectURL(await this.api(`photos/${id}`,undefined,true));});}
  export(format:string):void{void this.run(async()=>{const id=this.record.id;saveAs(await this.api(`records/${id}/${format}`,undefined,true),`Line-Clearance-${id}.${format}`);});}
  saveTemplate(publish:boolean):void{void this.run(async()=>{for(const q of this.questions){q.orderScope=this.scope(q);for(const f of q.fields){if(f.minimum==null)delete f.minimum;if(f.maximum==null)delete f.maximum;}}this.template=await this.api(`template/${publish?'publish':'save'}`,{body:this.template.draft.body,revision:this.template.draft.revision});this.notice=publish?'Published a new version. Existing records keep their original version.':'Draft saved.';});}
  move(i:number,d:number):void{const j=i+d;if(j<0||j>=this.questions.length)return;[this.questions[i],this.questions[j]]=[this.questions[j],this.questions[i]];}
  addQuestion():void{this.questions.push({key:'q_'+lcId(),en:'New question',es:'Nueva pregunta',owner:'qc',phase:'clearance',orderScope:'all',enabled:true,products:[],fields:[{key:'actual',en:'Actual observation',es:'Observación real',type:'text',required:true}]});}
  addField(q:LCQuestion):void{q.fields.push({key:'f_'+lcId(),en:'Actual value',es:'Valor real',type:'text',required:true});}
  setProducts(q:LCQuestion,value:string):void{q.products=value.split(',').map(v=>v.trim()).filter(Boolean);}
  setOptions(f:LCField,value:string):void{f.options=value.split('|').map(v=>v.trim()).filter(Boolean);}
  expected(f:LCField):string{return Object.entries(f.expectedByProduct??{}).map(([k,v])=>`${k}=${v}`).join('\n');}
  setExpected(f:LCField,value:string):void{f.expectedByProduct=Object.fromEntries(value.split('\n').filter(Boolean).map(line=>{const i=line.indexOf('=');return [line.slice(0,i).trim(),line.slice(i+1).trim()];}));}
  changeType(f:LCField):void{if(f.type==='choice'&&!f.options)f.options=['Confirmed','Problem'];if(f.type!=='scan'){delete f.matchRequired;delete f.expectedByProduct;}}
  toggleGrant(cap:string,event:Event):void{this.grantCaps=(event.target as HTMLInputElement).checked?[...this.grantCaps,cap]:this.grantCaps.filter(c=>c!==cap);}
  saveGrant():void{void this.run(async()=>{this.grants=await this.api('grants',{username:this.grantUser,caps:this.grantCaps});this.notice='Test Line Clearance permissions saved. MES account permissions were not changed.';});}
}
