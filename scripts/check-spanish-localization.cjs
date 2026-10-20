const path=require('node:path'),fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript'),{of,firstValueFrom,forkJoin,map}=require('rxjs');
function compiled(file,require=name=>{if(!name.startsWith('.'))throw Error('Unexpected import');return compiled(path.resolve(path.dirname(file),name)+'.ts');}){const context={exports:{},require,navigator:{languages:['es-MX'],language:'es-MX'}};vm.runInNewContext(ts.transpile(fs.readFileSync(file,'utf8'),{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,experimentalDecorators:true}),context);return context.exports;}
const spanish=JSON.parse(fs.readFileSync('src/assets/tmp/i18n/es-ES.json','utf8'));
const overrides=compiled('src/app/core/i18n/web-label-overrides.ts').WEB_LABEL_OVERRIDES;
const fallbacks=compiled('src/app/core/i18n/static-label-fallbacks.ts').STATIC_LABEL_FALLBACKS;
for(const [key,value]of Object.entries(fallbacks)){assert.equal(typeof spanish[key],'string',key);assert.deepEqual((spanish[key].match(/{{.*?}}/g)||[]).sort(),(value.match(/{{.*?}}/g)||[]).sort(),key);}
for(const key of Object.keys(overrides['en-US']))assert.equal(typeof (overrides['es-ES']?.[key] ?? spanish[key]),'string',key);
for(const [key,value]of Object.entries(JSON.parse(fs.readFileSync('src/assets/tmp/i18n/en-US.json','utf8'))))assert.equal(typeof spanish[key],'string',key);
class HttpBackend{}class HttpClient{constructor(backend){assert.equal(backend,staticBackend);}get(url,options){requests.push({url,options});return of(spanish);}}class DelonHttp{}class Settings{}class Platform{}class Nz{}class Delon{}const ignore=Symbol('ignore');
class Context{set(k,v){this[k]=v;return this;}get(k){return this[k];}}
class Base{flatData(d){return d;}get currentLang(){return this._currentLang;}get defaultLang(){return this._defaultLang;}_change$={next(){}};}
const requests=[],settings={layout:{lang:'es-MX'}},locale={setLocale(){},setDateLocale(){}};
const english={quantity:'Quantity','server.new-key':'New server label'};
const staticBackend={};
const inject=t=>t===HttpBackend?staticBackend:t===DelonHttp?{get:url=>{requests.push({url});return of(english);}}:t===Settings?settings:t===Platform?{isBrowser:true}:locale;
const requireMock=name=>{
 if(name==='@angular/core')return{Injectable:()=>v=>v,inject};
 if(name==='@angular/common/http')return{HttpBackend,HttpClient,HttpContext:Context};
 if(name==='@angular/common')return{registerLocaleData(){}};
 if(name.startsWith('@angular/common/locales/'))return{default:{locale:name}};
 if(name==='@angular/cdk/platform')return{Platform};
 if(name==='@delon/theme')return{AlainI18nBaseService:Base,_HttpClient:DelonHttp,SettingsService:Settings,DelonLocaleService:Delon,IGNORE_BASE_URL:ignore};
 if(name==='ng-zorro-antd/i18n')return{NzI18nService:Nz};
 if(name==='rxjs')return{forkJoin: sources => forkJoin({ ...sources }),map};
 if(name==='date-fns/locale')return{};
 if(name==='./web-label-overrides')return{WEB_LABEL_OVERRIDES:overrides};
 if(name==='./static-label-fallbacks')return{STATIC_LABEL_FALLBACKS:fallbacks};
 throw Error(name);
};
(async()=>{const {I18NService}=compiled('src/app/core/i18n/i18n.service.ts',requireMock),service=new I18NService({});assert.equal(service.defaultLang,'es-ES');assert(service.getLangs().some(l=>l.code==='es-ES'&&l.text==='Español'));const data=await firstValueFrom(service.loadLangData('es-ES'));assert.equal(data.quantity,'Cantidad');assert.equal(data['server.new-key'],'New server label');assert.equal(requests[1].options.context.get(ignore),true);assert.equal(requests[0].url,'./resource/assets/i18n/en-US.json');service.use('es-ES',data);assert.equal(service.currentLang,'es-ES');assert.equal(service._data['menu.main.common'],'Datos maestros');assert.equal(service._data['workspace.section.production'],'Producción');service.use('en-US',english);assert.equal(service._data.quantity,'Quantity');assert.equal(service._data['menu.main.common'],'Master Data');console.log('PASS: Spanish locale selection, regional normalization, local asset routing, server fallback, all static placeholders, new labels and switching back to English');})().catch(e=>{console.error(e);process.exitCode=1;});
