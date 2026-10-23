"""Backed-up FAY web configuration fix; business images and data stay unchanged."""
import datetime,json,pathlib,socket,subprocess,urllib.request,urllib.error,sys,yaml,os
P=pathlib.Path;K=['kubectl','-n','staging']
def run(args):
    p=subprocess.run(args,stdout=subprocess.PIPE,stderr=subprocess.PIPE,universal_newlines=True)
    if p.returncode:raise RuntimeError('Deployment command failed: '+args[0])
    return p.stdout
def get(kind,name):return json.loads(run(K+['get',kind,name,'-o','json']))
def persist(original,cm,previous,name):
    docs=list(yaml.safe_load_all(original));maps=[i for i,x in enumerate(docs) if x and x.get('kind')=='ConfigMap' and 'default.conf.template' in x.get('data',{})]
    if len(maps)!=1:raise RuntimeError('Persistent Nginx ConfigMap is not unique')
    docs[maps[0]]=cm
    deployments=[x for x in docs if x and x.get('kind')=='Deployment' and x.get('metadata',{}).get('name')=='webclient']
    if len(deployments)!=1:raise RuntimeError('Persistent Web deployment is not unique')
    mount=next(v for v in deployments[0]['spec']['template']['spec']['volumes'] if v['name']=='fay-web-nginx')
    if mount['configMap']['name']!=previous:raise RuntimeError('Unexpected persistent ConfigMap reference')
    mount['configMap']['name']=name
    return yaml.safe_dump_all(docs)
def probe(base,path,expected,json_body=False):
    try:r=urllib.request.urlopen(base+path,timeout=15)
    except urllib.error.HTTPError as e:r=e
    body=r.read()
    if r.status!=expected:raise RuntimeError('HTTP check failed: '+base+path+' status='+str(r.status))
    if json_body and not isinstance(json.loads(body),dict):raise RuntimeError('Language response is not a JSON object')
    return {'url':base+path,'status':r.status,'jsonObject':json_body}
if socket.gethostname()!='k8s-master-ar':raise RuntimeError('FAY master only')
public_base=None if '--persist-current' in sys.argv else os.environ['MES_FAY_WEB_BASE']
d=get('deployment','webclient');volumes=d['spec']['template']['spec']['volumes'];i=next(i for i,v in enumerate(volumes) if v['name']=='fay-web-nginx');previous=volumes[i]['configMap']['name'];c=get('configmap',previous);text=c['data']['default.conf.template']
prefixes=('/api/','/api/inventory-handoff/','/api/integration-settings/')
for prefix in prefixes:
    if text.count('location '+prefix+' {')+text.count('location ^~ '+prefix+' {')!=1:raise RuntimeError('Expected exactly one API prefix location: '+prefix)
if os.environ['MES_FORBIDDEN_SITE_PREFIX'] in text:raise RuntimeError('Cross-site proxy target')
updated=text
for prefix in prefixes:updated=updated.replace('location '+prefix+' {','location ^~ '+prefix+' {')
if '--persist-current' in sys.argv:
    if updated!=text:raise RuntimeError('Fix live API prefixes before persisting')
    file=P('/root/k8s/4-frontend-app.yaml');original=file.read_text();cm={'apiVersion':'v1','kind':'ConfigMap','metadata':{'name':previous,'namespace':'staging'},'data':dict(c['data'])};result=persist(original,cm,previous,previous)
    b=P('/root/k8s/backups')/('fay-web-manifest-'+datetime.datetime.utcnow().strftime('%Y%m%dT%H%M%SZ'));b.mkdir(mode=0o700);(b/file.name).write_text(original);file.write_text(result)
    print(json.dumps({'site':'fay','persistentConfigMapAndReferenceMatchLive':True,'liveResourcesChanged':False,'backup':str(b)}));raise SystemExit(0)
if updated==text:raise RuntimeError('API prefixes are already protected; no deployment required')
text=updated
name='mes-web-imports-fay-api-priority-20261022-02';b=P('/root/k8s/backups')/('fay-api-priority-'+datetime.datetime.utcnow().strftime('%Y%m%dT%H%M%SZ'));b.mkdir(mode=0o700)
(b/'configmap-before.json').write_text(json.dumps(c));(b/'deployment-before.json').write_text(json.dumps(d));file=P('/root/k8s/4-frontend-app.yaml');original=file.read_text();(b/file.name).write_text(original)
if previous not in original:raise RuntimeError('Persistent configuration reference missing')
cm={'apiVersion':'v1','kind':'ConfigMap','metadata':{'name':name,'namespace':'staging'},'data':dict(c['data'])};cm['data']['default.conf.template']=text
subprocess.run(K+['apply','-f','-'],input=json.dumps(cm),universal_newlines=True,check=True)
path='/spec/template/spec/volumes/'+str(i)+'/configMap/name';applied=False
try:
    patch=[{'op':'test','path':'/metadata/resourceVersion','value':d['metadata']['resourceVersion']},{'op':'replace','path':path,'value':name}]
    run(K+['patch','deployment','webclient','--type=json','-p',json.dumps(patch)]);applied=True
    print(run(K+['rollout','status','deployment/webclient','--timeout=180s']),flush=True)
    after=get('deployment','webclient');old_spec=d['spec']['template']['spec'];new_spec=after['spec']['template']['spec'];expected=json.loads(json.dumps(old_spec));expected['volumes'][i]['configMap']['name']=name
    if new_spec!=expected:raise RuntimeError('Unexpected concurrent pod configuration change')
    pods=json.loads(run(K+['get','pods','-l','app=webclient','-o','json']))['items'];ready=[p for p in pods if not p['metadata'].get('deletionTimestamp') and any(v.get('configMap',{}).get('name')==name for v in p['spec'].get('volumes',[])) and p.get('status',{}).get('containerStatuses',[{}])[0].get('ready')]
    if len(ready)!=1:raise RuntimeError('Expected one ready web pod')
    run(K+['exec',ready[0]['metadata']['name'],'--','nginx','-t'])
    cluster='http://'+get('service','webclient')['spec']['clusterIP'];checks=[]
    for base in (cluster,public_base):
        checks.append(probe(base,'/',200))
        checks.append(probe(base,'/api/resource/assets/i18n/en-US.json',200,True))
        checks.append(probe(base,'/api/resource/assets/i18n/zh-CN.json',200,True))
        checks.append(probe(base,'/api/inventory-handoff/__audit__.json',503,True))
        checks.append(probe(base,'/api/integration-settings/__audit__.json',503,True))
        checks.append(probe(base,'/missing-ota-release-check.js',404))
    file.write_text(persist(original,cm,previous,name))
    result={'site':'fay','cause':'Static-file regex took precedence over API JSON routes','configMap':name,'imageUnchanged':old_spec['containers'][0]['image']==new_spec['containers'][0]['image'],'backup':str(b),'persistentManifestUpdated':True,'businessWritesForVerification':False,'checks':checks}
    (b/'result.json').write_text(json.dumps(result,indent=2));print(json.dumps(result),flush=True)
except BaseException:
    if applied:
        current=get('deployment','webclient')
        if current['spec']['template']['spec']['volumes'][i]['configMap']['name']==name:
            run(K+['patch','deployment','webclient','--type=json','-p',json.dumps([{'op':'test','path':path,'value':name},{'op':'replace','path':path,'value':previous}])]);run(K+['rollout','status','deployment/webclient','--timeout=180s'])
    file.write_text(original);raise
