"""Align FAY entry HTML caching while retaining its isolated site proxy routes."""
import datetime,json,pathlib,subprocess
P=pathlib.Path;K=['kubectl','-n','staging']
def run(args):return subprocess.check_output(args,universal_newlines=True,stderr=subprocess.STDOUT)
def get(kind,name):return json.loads(run(K+['get',kind,name,'-o','json']))
d=get('deployment','webclient');volumes=d['spec']['template']['spec']['volumes'];i=next(i for i,v in enumerate(volumes) if v['name']=='fay-web-nginx');previous=volumes[i]['configMap']['name'];name='mes-web-imports-fay-20261022-02'
if previous==name:print('FAY cache configuration already current');raise SystemExit(0)
c=get('configmap',previous);text=c['data']['default.conf.template'];old="add_header Cache-Control 'no-cache';"
start=text.index('    location = /index.html {');end=text.index('\n    }',start);block=text[start:end]
if block.count(old)!=1:raise RuntimeError('Unexpected FAY index cache block')
text=text[:start]+block.replace(old,"add_header Cache-Control 'no-store' always;\n        try_files $uri =404;")+text[end:]
b=P('/root/k8s/backups')/('import-orders-fay-cache-'+datetime.datetime.utcnow().strftime('%Y%m%dT%H%M%SZ'));b.mkdir(mode=0o700);(b/'configmap-before.json').write_text(json.dumps(c));(b/'deployment-before.json').write_text(json.dumps(d));file=P('/root/k8s/4-frontend-app.yaml');original=file.read_text();(b/file.name).write_text(original)
cm={'apiVersion':'v1','kind':'ConfigMap','metadata':{'name':name,'namespace':'staging'},'data':{'default.conf.template':text}}
subprocess.run(K+['apply','-f','-'],input=json.dumps(cm),universal_newlines=True,check=True)
path='/spec/template/spec/volumes/'+str(i)+'/configMap/name'
try:
 print(run(K+['patch','deployment','webclient','--type=json','-p',json.dumps([{'op':'test','path':path,'value':previous},{'op':'replace','path':path,'value':name}])]))
 print(run(K+['rollout','status','deployment/webclient','--timeout=180s']))
 pods=json.loads(run(K+['get','pods','-l','app=webclient','-o','json']))['items']
 ready=[p for p in pods if not p['metadata'].get('deletionTimestamp') and any(v.get('configMap',{}).get('name')==name for v in p['spec'].get('volumes',[])) and p.get('status',{}).get('containerStatuses',[{}])[0].get('ready')]
 if len(ready)!=1:raise RuntimeError('Expected one ready FAY cache-config pod')
 print(run(K+['exec',ready[0]['metadata']['name'],'--','nginx','-t']))
 file.write_text(original.replace(previous,name));print(json.dumps({'cacheConfig':name,'backup':str(b),'persistentManifestUpdated':True}))
except BaseException:
 subprocess.call(K+['patch','deployment','webclient','--type=json','-p',json.dumps([{'op':'replace','path':path,'value':previous}])]);file.write_text(original);raise
