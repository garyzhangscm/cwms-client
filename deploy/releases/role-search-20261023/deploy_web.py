"""Backed-up image-only rollout; preserve all existing site routes and mounts."""
import argparse,datetime,json,pathlib,socket,subprocess,time,urllib.request,urllib.error,yaml
P=pathlib.Path;K=['kubectl','-n','staging'];NAME='webclient'
def run(args):
 p=subprocess.run(args,stdout=subprocess.PIPE,stderr=subprocess.PIPE,universal_newlines=True)
 if p.returncode:raise RuntimeError('Kubernetes operation failed; inspect server status without printing private arguments')
 return p.stdout
def get(kind,name):return json.loads(run(K+['get',kind,name,'-o','json']))
def ready(deployment,image):
 labels=','.join(k+'='+v for k,v in deployment['spec']['selector']['matchLabels'].items())
 pods=json.loads(run(K+['get','pods','-l',labels,'-o','json']))['items']
 matches=[p for p in pods if not p['metadata'].get('deletionTimestamp') and p['spec']['containers'][0]['image']==image and p.get('status',{}).get('containerStatuses',[{}])[0].get('ready')]
 if len(matches)!=1:raise RuntimeError('Expected one ready target-image Web pod')
 return matches[0]
def persist(file,image):
 parts=file.read_text().split('\n---');count=0
 for i,text in enumerate(parts):
  d=yaml.safe_load(text)
  if d and d.get('kind')=='Deployment' and d.get('metadata',{}).get('name')==NAME:
   old=d['spec']['template']['spec']['containers'][0]['image'];parts[i]=text.replace(old,image);count+=1
 if count!=1:raise RuntimeError('Persistent Web deployment not uniquely identified')
 content='\n---'.join(parts);list(yaml.safe_load_all(content));file.write_text(content)
def main():
 p=argparse.ArgumentParser();p.add_argument('--site',choices=['fay','colton'],required=True);p.add_argument('--image',required=True);a=p.parse_args()
 expected='brianwang1912/mes-web:v19.2-workorder-pick-scope-20261023-01@sha256:cd7acc453b2778391df29485030dd424985ebefe6b5818a01ff49e69cd5d035e'
 if socket.gethostname()!=('k8s-master-ar' if a.site=='fay' else 'k8s-master'):raise RuntimeError('Wrong site master')
 if a.image!='brianwang1912/mes-web:v19.2-role-search-20261023-01@sha256:5ae7797d0734495a87eb8ef38125741949f425f35dd4b4db45004de499cfa2ab':raise RuntimeError('Unapproved Web image')
 before=get('deployment',NAME);template=before['spec']['template'];spec=template['spec'];old=spec['containers'][0]['image']
 if old==a.image:print(json.dumps({'site':a.site,'alreadyCurrent':True}));return
 if old!=expected:raise RuntimeError('Unexpected Web image drift; stopped before rollout')
 file=P('/root/k8s/4-frontend-app.yaml');backup=P('/root/k8s/backups')/('role-search-web-'+datetime.datetime.utcnow().strftime('%Y%m%dT%H%M%SZ'));backup.mkdir(mode=0o700)
 (backup/'deployment-before.json').write_text(json.dumps(before));(backup/file.name).write_bytes(file.read_bytes())
 integration=get('deployment','integrationservice')['spec']['template'];patched=False;ours=None
 try:
  patch=[{'op':'test','path':'/metadata/resourceVersion','value':before['metadata']['resourceVersion']},{'op':'replace','path':'/spec/template/spec/containers/0/image','value':a.image}]
  print(run(K+['patch','deployment',NAME,'--type=json','-p',json.dumps(patch)]),flush=True);patched=True;ours=get('deployment',NAME)['spec']['template']
  print(run(K+['rollout','status','deployment/'+NAME,'--timeout=240s']),flush=True)
  current=get('deployment',NAME);pod=ready(current,a.image);comparison=json.loads(json.dumps(current['spec']['template']));comparison['spec']['containers'][0]['image']=old
  if comparison!=template:raise RuntimeError('Site settings changed during rollout')
  run(K+['exec',pod['metadata']['name'],'--','nginx','-t'])
  service=get('service',NAME)['spec'];base='http://'+service['clusterIP'];checks=[]
  for path in ['/','/mes-public-config-20261023.js','/api/resource/assets/i18n/en-US.json','/api/resource/assets/i18n/zh-CN.json']:
   for attempt in range(5):
    try:
     response=urllib.request.urlopen(base+path,timeout=5);body=response.read();status=response.status
     break
    except (urllib.error.URLError,OSError):
     if attempt==4:raise
     time.sleep(2)
   if status!=200:raise RuntimeError('Web read-only check failed')
   if path=='/' and b'/mes-public-config-20261023.js' not in body:raise RuntimeError('Unexpected Web index')
   checks.append({'path':path,'status':status})
  if get('deployment','integrationservice')['spec']['template']!=integration:raise RuntimeError('Integration changed during rollout')
  persist(file,a.image)
  result={'site':a.site,'service':NAME,'image':a.image,'ready':True,'configurationAndMountsPreserved':True,'persistentManifestUpdated':True,'integrationUnchanged':True,'readOnlyChecks':checks,'databaseChanged':False,'backup':str(backup)}
  (backup/'result.json').write_text(json.dumps(result,indent=2));print(json.dumps(result),flush=True)
 except BaseException:
  if patched and ours is not None and get('deployment',NAME)['spec']['template']==ours:
   run(K+['patch','deployment',NAME,'--type=json','-p',json.dumps([{'op':'replace','path':'/spec/template','value':template}])]);print(run(K+['rollout','status','deployment/'+NAME,'--timeout=240s']),flush=True)
  raise
if __name__=='__main__':main()
